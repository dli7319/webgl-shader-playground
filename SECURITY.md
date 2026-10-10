# Security Policy

## Reporting a vulnerability

Please report security vulnerabilities privately via
[GitHub Security Advisories](https://github.com/dli7319/webgl-shader-playground/security/advisories/new)
for this repository. Do not open a public issue for security-sensitive reports.

Include reproduction steps and impact if possible. You'll get an answer as
soon as the maintainer can; disclosure is coordinated before any public fix.

## Scope notes

- This app runs entirely in the browser — there is no server-side code, no
  accounts, and no user data is transmitted anywhere.
- The main attack surface is malicious shader source or image files shared
  between users; treat shared `.frag`/image files like any untrusted input.
- Dependencies are the usual supply-chain risk; keep `npm audit` findings in
  mind when bumping versions.
