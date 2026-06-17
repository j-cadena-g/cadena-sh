#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REFS_FILE="${ROOT_DIR}/.op/refs.env"
REF_KEY="CADENA_SH_DEV_1PASSWORD_ENVIRONMENT_ID"

trim() {
  local input="$1"
  input="${input#"${input%%[![:space:]]*}"}"
  input="${input%"${input##*[![:space:]]}"}"
  printf '%s' "${input}"
}

strip_wrapping_quotes() {
  local value="$1"
  if [[ "${value}" == \"*\" && "${value}" == *\" ]]; then
    value="${value:1:${#value}-2}"
  elif [[ "${value}" == \'*\' && "${value}" == *\' ]]; then
    value="${value:1:${#value}-2}"
  fi
  printf '%s' "${value}"
}

lookup_shell_ref() {
  local key="$1"
  printenv "${key}" 2>/dev/null || true
}

lookup_file_ref() {
  local wanted_key="$1"

  if [ ! -f "${REFS_FILE}" ]; then
    return 0
  fi

  local line
  local key
  local value

  while IFS= read -r line || [ -n "${line}" ]; do
    line="${line%$'\r'}"
    line="$(trim "${line}")"
    if [ -z "${line}" ] || [[ "${line}" == \#* ]] || [[ "${line}" != *=* ]]; then
      continue
    fi

    key="$(trim "${line%%=*}")"
    value="$(trim "${line#*=}")"
    if [ "${key}" = "${wanted_key}" ]; then
      strip_wrapping_quotes "${value}"
      return 0
    fi
  done < "${REFS_FILE}"
}

resolve_op_environment_id() {
  local value

  value="$(lookup_shell_ref "${REF_KEY}")"
  if [ -n "${value}" ]; then
    printf '%s' "${value}"
    return 0
  fi

  value="$(lookup_file_ref "${REF_KEY}")"
  if [ -n "${value}" ]; then
    printf '%s' "${value}"
    return 0
  fi
}

if [ "$#" -eq 0 ]; then
  echo "usage: $0 -- <command> [args...]" >&2
  exit 1
fi

if [ "${1:-}" = "--" ]; then
  shift
fi

if [ "$#" -eq 0 ]; then
  echo "usage: $0 -- <command> [args...]" >&2
  exit 1
fi

OP_ENVIRONMENT_VALUE="$(resolve_op_environment_id)"

if [ -z "${OP_ENVIRONMENT_VALUE}" ]; then
  cat >&2 <<'EOF'
error: missing cadena-sh 1Password Environment reference.

Set CADENA_SH_DEV_1PASSWORD_ENVIRONMENT_ID in .op/refs.env or export it in your shell.
OP_ENVIRONMENT_ID is reserved for Vercel build/deploy.
EOF
  exit 1
fi

if ! command -v op >/dev/null 2>&1; then
  echo "error: 1Password CLI (op) is required for dev:op." >&2
  exit 1
fi

exec op run --environment "${OP_ENVIRONMENT_VALUE}" -- "$@"
