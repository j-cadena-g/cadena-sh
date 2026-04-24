# Security Policy

This repository powers [james.cadena.sh](https://james.cadena.sh) — a single-page
personal site with a contact form backed by Resend and protected by Vercel BotID.

## Reporting a vulnerability

Please report suspected vulnerabilities privately. Do not open a public issue for
security reports.

Preferred channels, in order:

1. **GitHub Private Vulnerability Reporting** — use the "Report a vulnerability"
   button under this repository's Security tab.
2. **Contact form** — [james.cadena.sh/#contact](https://james.cadena.sh/#contact).
   Mention "security" in the message and I will follow up from a private address.

Please include:

- a short description of the issue and its impact,
- the affected URL, route, or file,
- reproduction steps (a minimal payload or request is ideal),
- any logs or proof-of-concept output you can share.

I aim to acknowledge reports within **72 hours** and to have a remediation or
mitigation plan within **14 days** for anything with production impact. Timing
may slip for low-severity issues or when the underlying fix lives in an
upstream dependency.

## Scope

In scope:

- `james.cadena.sh` and the apex redirect at `cadena.sh`,
- the `POST /api/contact` route and its CSP, CORS, and BotID surface,
- secret handling in `scripts/install-op.sh`, the `pnpm build:vercel` path, and the runtime 1Password Environments SDK path,
- client-side code shipped from this repository.

Out of scope:

- vulnerabilities in Vercel, Resend, 1Password, or other third-party platforms —
  please report those upstream,
- denial-of-service findings that rely on volumetric traffic,
- reports generated solely by automated scanners without a working proof of
  concept,
- missing best-practice headers that do not translate into an exploitable
  weakness.

## Safe-harbor

Good-faith research against this site will not result in a legal complaint from
me, provided it avoids data exfiltration, service disruption, and interaction
with other users. If in doubt about whether a test is safe, ask first.
