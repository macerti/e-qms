# Engineering Guidelines

## 1) Domain/UI Separation
- `src/domains/*` contains business vocabulary and pure domain models/services only.
- `src/ui/*` contains reusable presentation primitives and patterns.
- UI screens must call API clients/services, not persistence adapters directly.

## 2) Multi-tenant Baseline
- Every persisted entity must include: `organization_id`, `created_at`, `updated_at`.
- No singleton mutable object may represent organization data.
- Repositories must accept tenant/organization context before query execution.

## 3) Standard-Agnostic Model
- Requirements belong to a `Standard` (`standard_id`) and never to hardcoded ISO naming.
- Allocation is represented by mappings, not by standard-specific fields.
- Organizations can load multiple standards in parallel.

## 4) API Boundary Contract
- Required flow: `UI -> API Client -> Domain Service -> Repository -> Persistence adapter`.
- Domain services cannot contain framework-specific dependencies.
- ORM/storage assumptions are forbidden in domain and API service layers.

## 5) Token-only Styling Policy
- Reuse `/src/ui/tokens/*` for color, spacing, typography, elevation and motion choices.
- Avoid hardcoded one-off style literals in feature pages where tokens exist.
- Inputs and editable fields must preserve clear contrast from background surfaces.

## 6) Inline Editing Contract
- Inline editing must clearly indicate local vs persisted behavior.
- List rows require stable keys and explicit actions for edit/delete.
- Editing controls should avoid modal-only workflows.

## 7) Help & Tooltip Enforcement
- Each editable field may provide optional guidance (`FieldHint`).
- Complex screens must expose contextual help (`ContextHelp`).
- Help copy is configured in `ui/patterns/help/helpConfig.ts` and not hardcoded ad hoc.

## 8) Folder Ownership
- `domains/*`: business models and cross-screen domain configuration.
- `platform/*`: tenancy, provisioning, and global configuration contracts.
- `api/*`: transport contracts and client orchestration.
- `infrastructure/*`: repository and adapter implementations.
- `ui/*`: visual primitives, layout, tokens, and UX patterns.

## 9) Naming Rules
- Domain entities: `*Entity`, platform contracts: explicit functional names.
- Use snake_case for transport-level persistence fields (`organization_id`, `created_at`, `updated_at`).
- Route-level screens remain in `pages/*` until fully migrated into domain packages.

## 10) Future Tool Integration
1. Define domain metadata in `domains/tools`.
2. Add contracts in `api/contracts`.
3. Add repository behavior in `infrastructure/persistence`.
4. Expose UI with existing primitives (`Page`, `Section`, `DataTable`, `TabLayout`, `EmptyState`).
5. Add contextual guidance via `ContextHelp` and `FieldHint`.
