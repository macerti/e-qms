# AI Integration Across the QMS — Full Plan

Goal: turn AI from a Help-only chat into an embedded coach that drafts content, explains compliance, and answers questions over the user's own data. All routed through Lovable AI Gateway (no extra keys).

## Architecture (shared across all phases)

- **One edge function per use case** under `supabase/functions/ai-*`, each with its own system prompt grounded in ISO 9001 + app features.
- **Shared backend helpers**: `supabase/functions/_shared/aiClient.ts` (gateway call + 429/402 handling), `_shared/promptContext.ts` (builds compact JSON context for a given org/process).
- **Frontend hooks**: `useAICoach(scope)`, `useAIDraft(kind)`, `useAIChat(scope)` — all wrap `supabase.functions.invoke` with streaming where useful.
- **Coach UI primitive**: `<AICoachCard />` — dismissible suggestion card, slot-based (title, rationale, CTA button, ISO clause tag). Lives next to existing dashboard signal cards and process tabs. Dismissal stored in `localStorage` keyed by user + suggestion hash.
- **AI draft pattern**: every "Generate draft" button opens a side sheet with the streamed draft + Accept / Edit / Discard. Accepted drafts go through the same persistence path as manual creation, never bypassing validation.

```text
 ┌─ frontend ─────────────────┐    ┌─ edge functions (gateway) ──┐
 │ AICoachCard, AIDraftSheet │ →  │ ai-coach, ai-draft-*,       │
 │ AIChatPanel, hooks         │    │ ai-explain, ai-rag-query    │
 └────────────────────────────┘    └─────────────────────────────┘
                                              │
                                   Lovable AI Gateway
                                   (gemini-3-flash for chat,
                                    gemini-embedding-001 for RAG)
```

## Phase 1 — Proactive Coach + Generative Drafting + Smarter Onboarding

**1.1 Proactive Coach (dismissible inline cards)**
- New `ai-coach` edge function. Input: `{ scope: "dashboard" | "process" | "audit" | "managementReview" | "risk" | "kpi", contextSummary }`. `promptContext.ts` queries only the IDs/counts needed (e.g. dashboard → counts of unlinked failed KPIs, risks without actions, open findings past SLA).
- Returns 1–3 structured suggestions via tool calling: `{ title, rationale, isoClause, ctaLabel, ctaRoute, suggestionKey }`.
- Surfaces:
  - Dashboard: row of `<AICoachCard />` under HeroBand.
  - Process detail Overview tab: one card under header.
  - Audit detail: card above findings list.
  - Management Review workspace: card at top.
  - Risk list: card when matrix has gaps.

**1.2 Generative Drafting (one per draft kind, all share `AIDraftSheet`)**
- `ai-draft-quality-policy` — inputs: sector, scope, top context issues. Output: 4-axis policy text.
- `ai-draft-process` — input: short description + typology. Output: purpose, activities[], suggested KPIs[], suggested risks[].
- `ai-draft-risks` — input: process id (server fetches process + sector). Output: risk register starter (title, description, severity, probability, suggested priority).
- `ai-draft-swot` — input: org profile. Output: internal/external issues.
- `ai-draft-audit-checklist` — inputs: scope clauses + process ids. Output: checklist items grouped by clause.
- `ai-draft-action-from-finding` — input: finding id. Output: root cause hypothesis, containment, corrective, efficiency criteria.
- `ai-draft-mgmt-review` — input: period. Output: minutes pre-fill from KPI values, audits, actions, risks of the period.
- UI: "✦ Draft with AI" button added next to existing "+ New" buttons on Quality Policy, Process create dialog, Risk list (per process), Issues list, Audit checklist editor, Action form (from a finding), Management Review workspace.

**1.3 Smarter Onboarding**
- After the existing onboarding completes (sector + country + scope captured), show a new optional step "Want a starter workspace?" → calls a new `ai-onboarding-seed` function that returns:
  - Suggested process map (3–6 typical processes for sector)
  - Draft Quality Policy
  - 1 starter risk per process
  - 1 starter KPI per process
- All items shown as a reviewable checklist; user accepts/edits before persistence. All persisted records tagged in `audit_log` with `payload.ai_seeded = true` for traceability.

## Phase 2 — RAG Q&A over the user's own data

**2.1 Embeddings infrastructure**
- DB migration:
  - `create extension if not exists vector;`
  - `qms_embeddings(id, organization_id, source_type, source_id, content, embedding vector(3072), updated_at)` with HNSW cosine index and RLS scoped to `organization_id = current_org()`.
  - `match_qms_embeddings(query_embedding, match_count, org_id)` SQL function (security definer, org-scoped).
- Edge function `ai-embed-record`: called from a Postgres trigger via `pg_net` (or simpler: from the existing app save paths) whenever a process, issue, risk, action, document, audit, finding, KPI, or management review item is created/updated. Chunks text, embeds via gateway, upserts into `qms_embeddings`. Source content kept in the embedding row to avoid extra joins at query time.
- Backfill script edge function `ai-embed-backfill` (admin-only) to embed existing records once.

**2.2 RAG chat extension to Help page**
- New `ai-rag-query` edge function: embeds the user question, calls `match_qms_embeddings` for top-K (default 8), passes retrieved snippets + question to chat model with a citation-aware system prompt.
- Help page gets a toggle "Answer from my system" vs "General ISO guidance" (current behavior). When on, responses include source chips (`Risk RISK/26/004`, clickable to detail route).

**2.3 Smart analysis helpers**
- `ai-explain-fulfillment` — for a requirement showing "not yet satisfied": returns *why* (which linked-record types are missing) + concrete next steps.
- `ai-suggest-root-cause` — on a finding or failed KPI: 5-Whys + Ishikawa categories. Surfaced as a button in finding/KPI detail.
- `ai-narrate-trend` — for a KPI's history: short narrative + correlation hints.

## Phase 3 — Document Intelligence + Audit Companion

**3.1 Document Intelligence**
- On document upload (existing `qms-documents` bucket), call `ai-analyze-document`:
  - Extracts text (PDF/Word) via gateway multimodal model.
  - Returns suggested clause tags, suggested linked process, extracted activity list, summary.
  - Shown in document detail as a "AI analysis" panel with Accept buttons that write to existing fields.
- `ai-diff-document-versions` — given two versions, summarize material changes for revision history.

**3.2 External audit report → findings**
- Upload action on audit detail: "Import findings from report". Calls `ai-extract-findings` → returns array of `{statement, clauseCode, processGuess, severity}`. User reviews then bulk-creates real `audit_findings`.

**3.3 Audit Companion (live capture)**
- New mode on audit detail: text input (voice optional via browser Web Speech API in a follow-up) → `ai-structure-audit-note` streams a structured finding card the auditor can confirm.

## Cross-cutting concerns

- **Cost control**: every coach call cached per `(user, scope, contextHash)` for 10 minutes in `localStorage`; backend dedupes via the same hash. Embeddings only re-computed when content actually changes (compare `updated_at`).
- **Privacy**: prompt context never includes auth tokens or other users' data; everything queried server-side under `current_org()` RLS using the caller's JWT.
- **Traceability**: every persisted record originating from AI gets an `audit_log` entry with `action = "ai_generated"` and the prompt/model recorded in `payload`.
- **Failure modes**: 429 and 402 from gateway shown as inline non-blocking banners on the coach card / draft sheet — never block the user from manual creation.
- **No new dependencies** required beyond what's already in the project (`react-markdown` is already installed for the Help chat).

## Files (high-level)

New edge functions:
`ai-coach`, `ai-draft-quality-policy`, `ai-draft-process`, `ai-draft-risks`, `ai-draft-swot`, `ai-draft-audit-checklist`, `ai-draft-action-from-finding`, `ai-draft-mgmt-review`, `ai-onboarding-seed`, `ai-embed-record`, `ai-embed-backfill`, `ai-rag-query`, `ai-explain-fulfillment`, `ai-suggest-root-cause`, `ai-narrate-trend`, `ai-analyze-document`, `ai-diff-document-versions`, `ai-extract-findings`, `ai-structure-audit-note`, plus `_shared/aiClient.ts` and `_shared/promptContext.ts`.

New frontend:
`src/components/ai/AICoachCard.tsx`, `AIDraftSheet.tsx`, `AICoachRow.tsx`, `AIRagToggle.tsx`, `useAICoach.ts`, `useAIDraft.ts`, `useAIRag.ts`.

Touched frontend (small additions only — "Draft with AI" buttons + coach mount points):
Dashboard, ProcessDetail, ProcessList, IssueList, RiskList (per process), AuditDetail, AuditList, ActionForm, ManagementReviewWorkspace, Onboarding, Help, DocumentDetail.

One DB migration for `vector` extension + `qms_embeddings` + `match_qms_embeddings` (Phase 2).

## Rollout order inside the plan

1. Shared backend helpers + `AICoachCard` primitive
2. Phase 1 coach + the 3 highest-value drafts (Quality Policy, Process, Action from finding) + Onboarding seed
3. Remaining Phase 1 drafts
4. Phase 2 embeddings migration + backfill + RAG Help toggle + explain/root-cause/trend helpers
5. Phase 3 document analysis, findings import, audit companion

If at any step you want to pause and ship, each phase is independently usable.
