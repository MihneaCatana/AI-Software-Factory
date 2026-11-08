# Artifact contracts and release policy

Generated project layout:

- `factory.project.json`: project identity, original idea, jurisdictions and assumed business context.
- `docs/product.md`: user stories and acceptance criteria.
- `docs/architecture.md`: data model, APIs, integration contracts, task dependencies.
- `docs/tasks.md`: reproducible implementation tasks.
- `docs/compliance.md`: jurisdiction-sensitive analysis and questions.
- `docs/threat-model.md`: assets, boundaries, threats and mitigations.
- `.factory/reports/qa.json`, `security.json`, `compliance.json`: independent review outputs.
- `.factory/approval.json`: human approval bound to a source fingerprint.

## Review report shape

All reports use:

```json
{
  "kind": "security",
  "status": "pending",
  "updatedAt": null,
  "scope": [],
  "checks": [{"name": "test name", "status": "pass", "evidence": "exact command and observed result"}],
  "findings": [{
    "id": "SEC-001", "severity": "high", "status": "open",
    "summary": "problem", "evidence": "file path or output", "remediation": "specific fix"
  }],
  "sources": []
}
```

Allowed report status: `pending`, `pass`, `fail`, `needs_review`. Allowed check status: `pass`, `fail`, `not_run`. Allowed finding severity: `critical`, `high`, `medium`, `low`; status: `open`, `resolved`, `accepted_risk`. QA may use `scope` as a list of tested features. Legal report has additional `jurisdictions`, `humanReviewRequired`, and `sources` entries `{ "url": "https://...", "jurisdiction": "EU", "accessedAt": "ISO timestamp", "relevance": "..." }`.

A `pass` requires real observations and no unresolved blocking findings. The CLI enforces basic structural and blocking criteria, NOT the truth of agent statements, full application security or legal compliance. Compliance reports are not a legal certification.

## Release gate

`node scripts/check-gates.mjs projects/<slug>` exits 0 only if:

1. QA, Security and Compliance each explicitly say `pass`, with at least one evidenced passed check and meaningful scope.
2. No security critical/high finding is open or accepted as risk; no QA critical/high failed finding; no compliance open critical/high concern.
3. Compliance covers all project jurisdictions, has at least one documented source and does not require further human legal review.
4. `.factory/approval.json` has an explicit human approval with approver, timestamp and `fingerprint` matching the current generated source.

The source fingerprint hashes file paths and content, excluding `.git`, dependencies, build outputs, local secrets, and `.factory` review artifacts. If source changes, approval is invalidated. This is a local safeguard, not a cryptographic attestation service.

For the current fingerprint:

```sh
node scripts/fingerprint.mjs projects/<slug>
```

Approval file example (after review only):

```json
{
  "approved": true,
  "approver": "actual human reviewer",
  "approvedAt": "2026-11-08T20:00:00Z",
  "fingerprint": "<result of fingerprint script>",
  "note": "Scope of the human approval"
}
```

Do not simulate an approval or auto-populate this with `approved: true`. Do not publicly deploy merely because a command exits 0.
