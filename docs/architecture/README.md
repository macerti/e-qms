# Architecture Boundaries

## Layering
- UI (`src/pages`, `src/components`, `src/ui`) -> Application (`src/application`) only.
- Application orchestrates use-cases and calls domain services/repositories.
- Domain (`src/domains`) contains business models/rules without React/framework concerns.
- Infrastructure (`src/infrastructure`) implements repository/persistence adapters.

## Guardrails
- ESLint `no-restricted-imports` blocks UI->Domain imports.
- ESLint blocks Domain->React/UI imports.
- `npm run check:architecture` validates architecture invariants.

## Data modes
- `VITE_APP_DATA_MODE=demo` enables isolated demo providers in `src/demo`.
- `VITE_APP_DATA_MODE=real` uses infrastructure real providers and does not load demo seed providers.
