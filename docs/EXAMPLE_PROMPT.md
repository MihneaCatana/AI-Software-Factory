# Example prompt for Codex

Open this factory folder in Codex and submit:

> Use the `build-application` skill and the six custom agents to build a small-business CRM named "Acme CRM" targeting Romania and the EU. Customers can sign in with Supabase, manage contacts, and move deals through a Kanban sales pipeline. Generate the app under `projects/acme-crm`. Start from the full-stack template, write a product specification and technical plan, get early security and legal design reviews, then implement the MVP. Run observable build, integration and security checks, record the results, and give me the exact local start commands and outstanding blockers. No production deployment or external account actions without my approval.

Review every step. The Codex app or CLI must support project-scoped custom subagents for role delegation. If this feature is not available in your version, Codex can still follow the skill and perform the same stages sequentially.
