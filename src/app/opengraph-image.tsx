import { ImageResponse } from "next/og";

// Satori renders OG images in an isolated environment without access to CSS
// variables, so we mirror the brand tokens from globals.css as sRGB hex here.
// Keep in sync with --brand-start / --brand-end / dark --primary when those
// tokens change.
const BRAND_START = "#ff7a20";
const BRAND_END = "#ffb85c";
const SIGNAL = "#fd9e3d";
const BACKGROUND = "#050505";
const FOREGROUND = "#f3f2ee";
const MUTED = "#a3a19f";
const FAINT = "#6f6c69";

export const alt = "James Cadena — IT Infrastructure Analyst";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const GRID_SIZE = 64;
const GRID_RGB = "255, 244, 230";
const GRID_ALPHA = 0.08;

const hops = [
  { kind: "CLIENT", value: "you" },
  { kind: "EDGE POP", value: "edge" },
  { kind: "ORIGIN", value: "james.cadena.sh" },
];

// The grid is drawn as explicit 1px lines, each faded by its own linear
// gradient, rather than masked by a radial vignette: Satori ignores the
// `inset` shorthand and sizes radial gradients differently from browsers.
const gridColumns = Array.from(
  { length: Math.floor(size.width / GRID_SIZE) },
  (_, index) => (index + 1) * GRID_SIZE,
);
const gridRows = Array.from(
  { length: Math.floor(size.height / GRID_SIZE) },
  (_, index) => (index + 1) * GRID_SIZE,
);

function gridColor(alpha: number) {
  return `rgba(${GRID_RGB}, ${alpha.toFixed(3)})`;
}

// Strongest at the top centre, fading towards the sides and the bottom.
function columnGradient(x: number) {
  const fromCentre = Math.abs(x - size.width / 2) / (size.width / 2);
  const alpha = GRID_ALPHA * (1 - 0.7 * fromCentre ** 2);
  return `linear-gradient(to bottom, ${gridColor(alpha)}, ${gridColor(0)} 85%)`;
}

function rowGradient(y: number) {
  const alpha = GRID_ALPHA * Math.max(0, 1 - y / (size.height * 0.85));
  return `linear-gradient(to right, ${gridColor(0)}, ${gridColor(alpha)} 50%, ${gridColor(0)})`;
}

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: BACKGROUND,
        color: FOREGROUND,
        fontFamily: "sans-serif",
      }}
    >
      {/* Blueprint grid. */}
      {gridColumns.map((x) => (
        <div
          key={`x${x}`}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: x,
            width: 1,
            backgroundImage: columnGradient(x),
          }}
        />
      ))}
      {gridRows.map((y) => (
        <div
          key={`y${y}`}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: y,
            height: 1,
            backgroundImage: rowGradient(y),
          }}
        />
      ))}
      {/* Satori reads a leading bare size keyword as a colour stop, so the
          glow's radial gradient names its shape first. */}
      <div
        style={{
          position: "absolute",
          top: -300,
          left: 150,
          width: 900,
          height: 600,
          display: "flex",
          backgroundImage:
            "radial-gradient(ellipse closest-side at 50% 50%, rgba(255, 122, 32, 0.26), rgba(255, 122, 32, 0))",
        }}
      />

      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{ display: "flex", fontSize: 28, letterSpacing: "-0.01em" }}
          >
            <span>cadena</span>
            <span style={{ color: SIGNAL }}>.sh</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontSize: 20,
              letterSpacing: "0.18em",
              color: MUTED,
            }}
          >
            <div style={{ width: 40, height: 2, background: SIGNAL }} />
            <span>IT INFRASTRUCTURE ANALYST</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              fontSize: 132,
              lineHeight: 0.9,
              letterSpacing: "-0.055em",
            }}
          >
            <span>James Cadena</span>
            <div
              style={{
                width: 58,
                height: 10,
                marginLeft: 12,
                marginBottom: 14,
                background: `linear-gradient(90deg, ${BRAND_START}, ${BRAND_END})`,
              }}
            />
          </div>
          <div style={{ display: "flex", fontSize: 36, color: MUTED }}>
            Enterprise networks, datacenters, and security.
          </div>
        </div>

        {/* The hero's route trace, flattened into a single chain. */}
        <div style={{ display: "flex", alignItems: "center" }}>
          {hops.map((hop, index) => {
            const isOrigin = index === hops.length - 1;

            return (
              <div
                key={hop.kind}
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexGrow: isOrigin ? 0 : 1,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: isOrigin ? 18 : 16,
                      height: isOrigin ? 18 : 16,
                      borderRadius: 999,
                      border: `2.5px solid ${SIGNAL}`,
                      background: isOrigin ? SIGNAL : BACKGROUND,
                      boxShadow: isOrigin
                        ? "0 0 0 6px rgba(253, 158, 61, 0.18)"
                        : "none",
                    }}
                  />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span
                      style={{
                        fontSize: 15,
                        letterSpacing: "0.16em",
                        color: FAINT,
                      }}
                    >
                      {`0${index + 1} ${hop.kind}`}
                    </span>
                    <span
                      style={{
                        fontSize: 24,
                        color: isOrigin ? FOREGROUND : MUTED,
                      }}
                    >
                      {hop.value}
                    </span>
                  </div>
                </div>
                {isOrigin ? null : (
                  <div
                    style={{
                      display: "flex",
                      flexGrow: 1,
                      height: 2,
                      margin: "0 28px",
                      background: `linear-gradient(90deg, rgba(253, 158, 61, 0.25), rgba(253, 158, 61, 0.7))`,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    size,
  );
}
