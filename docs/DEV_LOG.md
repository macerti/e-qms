# Dev log

Append-only, most recent session on top. Every session — even a small
one — adds an entry here before pushing, so the next dev (human or AI)
doesn't repeat work. Format: what I found, what I tested (with actual
results, not "should work"), what I changed, what's next.

---

## Session 1 — 2026-09-05 — Claude (chat session)

### Context read before starting
- Cloned `main`. Read `README.md`, `docs/engineering-guidelines.md`,
  `docs/architecture/README.md`, `.lovable/plan.md`, `package.json`,
  `.env.example`, `public/api/bootstrap.php`, `public/api/config.example.php`.
- Checked GitHub Actions history via API: 25 total runs of
  `deploy-ftp.yml`, the last 10+ checked were **all `failure`**, going
  back to at least 2026-05-18.
- Checked issues/PRs via API: 20 closed issues/PRs from prior
  Codex-agent sessions (mostly FTP workflow attempts and architecture
  refactors), **zero open** — nothing unmerged to recover.

### What I tested (actual results)
- `npm ci` locally → **failed**: `npm error Missing: vfile-message@4.0.3
  from lock file` (and ~50 more missing transitive deps, all under the
  `react-markdown` dependency tree). This is the exact failure that has
  been killing every CI run at the "Install dependencies" step (confirmed
  via `actions/jobs/{id}` → step `Install dependencies` = `failure`,
  everything after it `skipped`).
- `npm install` (regenerates lockfile) → succeeded, 499 packages.
- `npm ci` again with the regenerated lockfile → **succeeded**.
- `npm run build` (`VITE_BASE_PATH=/qms/`) → **succeeded**. Output:
  `dist/index.html` present, main JS chunk 1.92 MB (547.76 KB gzip) —
  Vite warns about the 500 KB chunk-size threshold, not a build failure.
- `npm run lint` → **282 errors, 12 warnings** (255×
  `@typescript-eslint/no-explicit-any`, 27× `no-restricted-imports`).
  Does not block build.
- `npm run check:architecture` (custom guard script) → **passes**. Note:
  this does *not* catch the 27 `no-restricted-imports` violations ESLint
  finds — the two checks disagree on what counts as a boundary violation.
- `npm audit` → 22 vulnerabilities (1 low, 6 moderate, 15 high). Not
  triaged individually this session.
- Tried to pull the actual CI job log text via the GitHub API's
  `.../actions/jobs/{id}/logs` redirect — blocked by this sandbox's
  network egress (Azure Blob Storage host not allow-listed). Worked
  around it by reproducing the failure locally instead (see above),
  which turned out to be more informative anyway.

### What I changed and pushed
1. **Fixed the root cause of every failed deploy**: regenerated
   `package-lock.json` / `bun.lock` so `npm ci` matches `package.json`.
2. **Security fix**: `.github/workflows/deploy-ftp.yml` had the FTP
   server, username, and password **hardcoded in plaintext** (visible
   in git history across several prior commits). Replaced with
   `${{ secrets.FTP_SERVER }}` / `FTP_USERNAME` / `FTP_PASSWORD` /
   `FTP_SERVER_DIR`. **The old password is still in git history** —
   rotating the secret value here does not remove it from history, so
   please rotate the actual FTP password on the hosting provider.
3. Added `.github/workflows/db-migrate.yml`: reusable workflow
   (`workflow_call` + manual `workflow_dispatch`) that runs
   `scripts/migrate.sh` against MariaDB using `DB_HOST` / `DB_PORT` /
   `DB_NAME` / `DB_USER` / `DB_PASSWORD` secrets. Tracks applied
   migrations in a `schema_migrations` table so it's safe to run on
   every deploy.
4. Added `database/migrations/0001_baseline.sql` (idempotent, mirrors
   the current inline schema in `public/api/bootstrap.php`) and
   `database/migrations/README.md` explaining the workflow and the
   known duplication with `bootstrap.php` (see Priorities).
5. Renamed/restructured `.github/workflows/deploy-ftp.yml` →
   `Build, Test, Migrate & Deploy`: now calls `db-migrate.yml` first,
   then installs, lints (non-blocking), runs the architecture guard
   (blocking), builds, verifies `dist/index.html`, then deploys.
6. Added GitHub issue templates (`bug_report.yml`, `feature_request.yml`,
   `technical_debt.yml`, `config.yml`) and a PR template so priorities,
   features, and debt are trackable per GitHub norms instead of only
   living in chat/dev-log form.
7. Added `docs/PRIORITIES.md` (this repo's live priority board) and
   this file.

### Secrets you need to add (Settings → Secrets and variables → Actions)
- `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, `FTP_SERVER_DIR` — same
  values as before, but **rotate the FTP password first** since the old
  one leaked into git history.
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` — for the
  new migration workflow. Must be a host your MariaDB accepts external
  connections from GitHub Actions' IP ranges (shared hosting often
  requires allow-listing or a proxy — check with your host if the
  migrate job can't connect).

### What's next (not done this session)
- No automated test suite exists at all. Recommend `vitest` + a first
  batch of domain-layer smoke tests before building more features on
  top — see Priorities P0 #3.
- Once secrets are added, watch the first real run of
  `Build, Test, Migrate & Deploy` — the migrate job is new and untested
  against your actual hosting DB (only tested logically/locally, not
  against your live MariaDB).
- Resolve the architecture duality note (Priorities, continuous #1)
  before starting `.lovable/plan.md` Phase 2 (adds a new Supabase table
  — make sure that's intentional given the PHP/MariaDB backend is the
  system of record for everything else).
- Then: work P0 bugs → P1 features by priority → keep chipping at the
  technical debt table every session, per the standing instruction not
  to defer it indefinitely.
