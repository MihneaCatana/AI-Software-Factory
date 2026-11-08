---
name: compliance-review
description: Assess a generated application's potential legal and regulatory constraints by jurisdiction, user type, data handling and business model; create a sourced, scoped report with human review flags.
---

# Compliance and legal issue spotting

1. Read `factory.project.json` and the original idea. Identify intended markets, business model, controllers/processors, user categories, personal/sensitive data, payments, age restrictions, marketing, platform/AI functionality and integrations. Record unknowns explicitly.
2. Before implementation, identify potentially applicable regulations and product design constraints in `docs/compliance.md`. Do not assume every fintech, healthcare or AI law applies; explain triggering conditions.
3. Research authoritative current primary sources (e.g., EUR-Lex, EDPB, national regulators); record URLs, jurisdictions, effective dates and the date accessed. Verify current laws when online access exists; if not, mark needs_review.
4. Review implementation of identified requirements, distinguishing legal issues from technical checks. Report privacy notices, consent/legal bases, data subject processes, retention, international transfers, consumer terms, licenses and regulated-activity questions where relevant.
5. Write `.factory/reports/compliance.json` using `docs/CONTRACTS.md`. State evidence, unresolved risks and whether counsel review is required. `pass` means only that the scoped checklist found no outstanding issues; it is not a legal certification.
6. Never approve release or provide conclusive legal advice. Request human/legal review for regulated or materially uncertain matters.
