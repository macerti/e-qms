# Contributing

1. **Read first**: `docs/DEV_LOG.md` (top entry — what the last session
   found/tested/left off at) and `docs/PRIORITIES.md` (current bug →
   feature → tech-debt order).
2. **Follow**: `docs/engineering-guidelines.md` and
   `docs/architecture/README.md` for layering/boundary rules
   (`npm run check:architecture` and `npm run lint` both check parts of
   this — see Priorities for where they currently disagree).
3. **Before opening a PR**: use `.github/PULL_REQUEST_TEMPLATE.md`'s
   checklist. If you touched the DB schema, add a migration under
   `database/migrations/` (see that folder's README) — don't only edit
   `public/api/bootstrap.php`.
4. **Before you stop working, even mid-task**: update
   `docs/DEV_LOG.md` with what you did, what you tested (with actual
   results), and what the next person should know — then push. A small
   verified step logged beats a bigger change no one can find.
5. **Filing work**: use the issue templates
   (`.github/ISSUE_TEMPLATE/`) — Bug, Feature, or Technical Debt. Debt
   gets filed, not silently deferred; it goes in `docs/PRIORITIES.md`'s
   continuous section.
