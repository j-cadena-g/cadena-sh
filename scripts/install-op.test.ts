// @vitest-environment node

import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const scriptPath = join(repoRoot, "scripts/install-op.sh");

const createdDirs: string[] = [];

function makeExecutable(path: string, contents: string) {
  writeFileSync(path, contents, { mode: 0o755 });
}

function createMockCommands(mockBinDir: string) {
  makeExecutable(
    join(mockBinDir, "curl"),
    `#!/bin/sh
out=""
while [ "$#" -gt 0 ]; do
  if [ "$1" = "-o" ]; then
    out="$2"
    shift 2
    continue
  fi
  shift 1
done

printf 'fake zip' >"$out"
`,
  );

  makeExecutable(
    join(mockBinDir, "unzip"),
    `#!/bin/sh
dest=""
while [ "$#" -gt 0 ]; do
  if [ "$1" = "-d" ]; then
    dest="$2"
    shift 2
    continue
  fi
  shift 1
done

cat >"$dest/op" <<'EOF'
#!/bin/sh
if [ "$1" = "--version" ]; then
  echo 2.35.0-beta.01
else
  exit 0
fi
EOF
chmod +x "$dest/op"
`,
  );
}

function runInstallOp(sha256Output: string) {
  const tempDir = mkdtempSync(join(tmpdir(), "install-op-test-"));
  createdDirs.push(tempDir);

  const mockBinDir = join(tempDir, "mock-bin");
  const outputBinDir = join(tempDir, "output-bin");
  mkdirSync(mockBinDir);
  mkdirSync(outputBinDir);

  createMockCommands(mockBinDir);

  makeExecutable(
    join(mockBinDir, "sha256sum"),
    `#!/bin/sh
echo "${sha256Output}  $1"
`,
  );

  return spawnSync("bash", [scriptPath], {
    cwd: repoRoot,
    env: {
      ...process.env,
      PATH: `${mockBinDir}:${process.env.PATH ?? ""}`,
      OP_BIN_DIR: outputBinDir,
    },
    encoding: "utf8",
  });
}

function expectedChecksumForCurrentPlatform() {
  const key = `${process.platform}:${process.arch}`;

  switch (key) {
    case "darwin:arm64":
      return "0a07daa0bbb88c81ef0ab73e54a20eb7a9371374a58fb5ac6db56ef727d9b531";
    case "darwin:x64":
      return "967e9ab535877df57bb4bb74d487005c8a1823aae378d9158e4407833ec86560";
    case "linux:x64":
      return "a0dce54733cf331737a00e1491257f56886ace82c0a3d481c5cc33a9d7305bce";
    case "linux:arm64":
      return "1e598d0271de16f5a995c2014961cfe9111b11f05358ab73314454aeabb736cd";
    default:
      throw new Error(`Unsupported test platform: ${key}`);
  }
}

afterEach(() => {
  for (const dir of createdDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("install-op.sh", () => {
  it("fails closed when the downloaded archive checksum does not match", () => {
    const result = runInstallOp(
      "deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
    );

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/checksum/i);
  });

  it("installs successfully when the checksum matches the pinned release", () => {
    const result = runInstallOp(expectedChecksumForCurrentPlatform());

    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/installed 2\.35\.0-beta\.01/i);
  });
});
