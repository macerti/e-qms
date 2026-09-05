# Priorities

Working order for this repo, per team agreement: **bugs → features (by
priority) → technical debt is continuous, not deferred**. Every item
here should also exist as a GitHub Issue (use the templates in
`.github/ISSUE_TEMPLATE/`) so it's assignable and closeable; this file
is the at-a-glance board. Update it in the same PR that changes an
item's status — don't let it drift from reality.

Status legend: `TODO` / `IN PROGRESS` / `BLOCKED` / `DONE`.

Last updated: 2026-09-05 (session 1 — see `docs/DEV_LOG.md`).

## P0 — Bugs (fix before anything else)

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | CI install step fails on every run (`npm ci` — lockfile out of sync with `package.json`, missing `react-markdown` transitive deps) | DONE | Fixed session 1: regenerated `package-lock.json`. This is why **every** FTP deploy run has failed since it was added. |
| 2 | FTP credentials hardcoded in plaintext in `.github/workflows/deploy-ftp.yml` (committed to git history) | DONE (workflow) / **ACTION NEEDED (you)** | Workflow now reads `secrets.FTP_*`. The old password (`Azerty123456`) is still in git history — rotate it on the hosting provider; changing the workflow does not remove it from history. |
| 3 | Zero automated tests in the repo (no test runner configured, no `test` script) | TODO | Not fixed this session — flagged as a bug because "tests done, results gotten" currently means "manual/CI build only." Recommend adding `vitest` + a handful of smoke tests for the domain layer before adding more features. |

## P1 — Features (by priority — reorder as business needs change)

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | (fill in from `.lovable/plan.md` Phase 1 — Proactive Coach + Generative Drafting + Smarter Onboarding) | TODO | Plan already written, not yet built per the file — verify against actual `src/` state before starting. |
| 2 | (fill in from `.lovable/plan.md` Phase 2 — RAG Q&A over org data) | TODO | Depends on Phase 1 shared helpers. |
| 3 | (fill in from `.lovable/plan.md` Phase 3 — Document Intelligence + Audit Companion) | TODO | Depends on Phase 2 embeddings. |

> The AI feature plan in `.lovable/plan.md` is detailed and current — use
> it as the source of truth for AI feature scope/sequencing rather than
> duplicating it here. This table just tracks *status*.

## Continuous — Technical debt (never "later", always someone's current chunk)

| # | Item | Severity | Status | Notes |
|---|------|----------|--------|-------|
| 1 | Architectural duality: README describes a MariaDB + PHP API backend (the actual FTP deploy target), while `supabase/` holds migrations + edge functions for AI features only. Several past PRs (`codex/eliminate-architectural-duality-in-codebase*`) already attempted to address confusion here | P1 | TODO | Before adding more Supabase-backed features, write one paragraph in `docs/architecture/README.md` stating explicitly: MariaDB/PHP = system of record, Supabase = AI-gateway-only, never a second copy of core QMS data. |
| 2 | DB schema defined twice: inline `CREATE TABLE IF NOT EXISTS` in `public/api/bootstrap.php` **and** `database/migrations/0001_baseline.sql` (added session 1) | P1 | TODO | Long-term: make migrations the only source of truth, delete the inline DDL from `bootstrap.php`. Don't do this until the migration workflow has run clean in production at least once. |
| 3 | 255 ESLint `@typescript-eslint/no-explicit-any` errors across the codebase | P2 | TODO | `npm run lint` is wired into CI as non-blocking (`continue-on-error`) specifically so this doesn't block deploys while it's paid down incrementally. Tighten to blocking once this count is near zero. |
| 4 | 27 ESLint `no-restricted-imports` architecture-boundary violations (mostly `src/pages/certification-body/modules/*` importing domain stores directly) | P2 | TODO | Note: `npm run check:architecture` (custom guard script) currently passes — it does not catch these. Either extend the guard script or treat ESLint's `no-restricted-imports` as the authoritative check and fix the violations. |
| 5 | Main JS bundle is 1.92 MB (547 KB gzip) — Vite warns on the 500 KB chunk threshold | P2 | TODO | No code-splitting/`manualChunks` configured yet. Worth revisiting once feature work picks up and the bundle grows further. |
| 6 | `npm audit`: 22 vulnerabilities (1 low, 6 moderate, 15 high) in current dependency tree | P1 | TODO | Not triaged individually this session — run `npm audit` for details before the next dependency bump and fix what's safe to fix without breaking the build. |
| 7 | ~20 previous Codex-agent PRs, all closed, none merged into the visible history in a way that resolved the CI bug — worth a quick pass to confirm nothing useful was lost | P3 | TODO | All were closed with no open PRs remaining as of session 1; no unmerged work to recover, but worth a skim if a future dev suspects a fix was "already done" before. |

## How to use this file

- Starting a session: read `docs/DEV_LOG.md` top entry first, then this file.
- Picking up work: move the row to `IN PROGRESS`, put your name/session in Notes.
- Finishing a chunk (even partial): update status, add a `docs/DEV_LOG.md` entry, push. See `.github/PULL_REQUEST_TEMPLATE.md`.
