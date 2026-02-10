# eQMS Frontend

Quality management system frontend built with Vite, React, TypeScript, Tailwind, and MariaDB (via PHP API).

## Getting started

```sh
npm install
npm run dev
```

## Deploying on shared hosting (build-only)

If your hosting environment does not allow Node/React dev servers, use the static build output.
This produces a `dist/` folder you can upload to your hosting provider.

```sh
npm run build
```

Then upload the `dist/` directory. The PHP API can live on the same shared hosting environment.

### Shared hosting with PHP (recommended)

If your hosting supports PHP but not Node, use the built-in PHP API:

1. Build the frontend:

```sh
npm run build
```

2. Upload the `dist/` folder to your hosting.
3. Upload the `public/api` folder (PHP API) alongside your `dist` files.
4. Copy `public/api/config.example.php` to `public/api/config.php` and fill in your MariaDB credentials.
5. Set `VITE_API_BASE_URL="/api"` when building, so the frontend calls the PHP API on the same host.

This PHP API writes to the `records` table used by the frontend.
It also expects an `X-Tenant-Id` header so data is scoped per tenant.

## Environment configuration

This frontend does not connect to a database directly. Database credentials are kept in the backend
service. Configure both frontend and backend by creating a local `.env`:

```sh
# .env
# Frontend
VITE_API_BASE_URL=""

# Backend (PHP)
DB_HOST="localhost"
DB_PORT=3306
DB_NAME="macerti_app"
DB_USER="macerti_app"
DB_PASSWORD="your_password_here"
```

Copy the template to start:

```sh
cp .env.example .env
```

## API contract (initial)

Your backend should expose at least:

```
GET /api/health
GET /api/records/:type
POST /api/records/:type
PUT /api/records/:type/:id
DELETE /api/records/:type/:id
GET /api/tenants
POST /api/tenants
POST /api/users
POST /api/memberships
GET /api/processes
POST /api/processes
GET /api/processes/:id
PUT /api/processes/:id
DELETE /api/processes/:id
GET /api/processes/:id/activities
POST /api/processes/:id/activities
PUT /api/activities/:id
DELETE /api/activities/:id
GET /api/requirements
POST /api/requirements
GET /api/activities/:id/requirements
POST /api/activities/:id/requirements
DELETE /api/activities/:id/requirements/:requirementId
```

The UI currently uses these record endpoints to persist processes, issues, actions, and documents.
You can extend this contract as needed for auditing, users, or workflows.

## Tech stack

- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
