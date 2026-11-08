---
name: security-audit
description: Threat-model and audit a generated application for security risks before code generation and before release, producing an evidence-based security report.
---

# Security audit

1. Identify assets, actors, entry points, data classifications and trust boundaries. Write `docs/threat-model.md` early.
2. Review architecture and implementation for authorization at object/tenant level, auth session handling, injection, XSS/CSRF, SSRF, file uploads, secrets, supply chain, logging and configuration according to relevant OWASP ASVS controls.
3. Run available linters, secret scans, dependency audits or targeted tests. Record exact commands and results. Unknowns stay unknown.
4. Write `.factory/reports/security.json` using `docs/CONTRACTS.md`; severity is `critical | high | medium | low`, finding status is `open | resolved | accepted_risk`.
5. A high/critical unresolved or accepted risk requires a `fail` gate until it is remediated or handled under a separately documented, authorized exception process. Do not create exceptions yourself.
6. Retest after developer remediation. Return traceable file paths and reproduction details; do not edit implementation as an independent reviewer.

Reference: https://asvs.owasp.org/ (verify the applicable current version).
