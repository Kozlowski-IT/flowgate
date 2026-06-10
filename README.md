# FlowGate

A full-stack **multi-step approval / request workflow** application — built as a reference project.

**Stack:** Angular (standalone components, Reactive Forms, signals) · NestJS (DDD-layered modules) · PostgreSQL (TypeORM, migrations) · WebSocket (real-time) · JWT auth with RBAC.

**What it does:** requests move through a server-enforced state machine (Draft → Submitted → In Review → Approved/Rejected) with role-based access (requester / reviewer / admin), a live status board updated over WebSocket, and an append-only audit trail.

> Status: in development. Self-built reference/demo project — generic demo data, no real client data.

## Getting started (local dev)

Prerequisites: Node ≥ 24.15, Docker with Compose.

```bash
# 1. Database
cp .env.example .env          # adjust JWT_SECRET (openssl rand -hex 32)
docker compose up -d          # PostgreSQL 18, localhost:5432 (loopback only)

# 2. Backend (NestJS, http://localhost:3001/api/v1)
cd backend
npm install
npm run migration:run         # create schema
npm run seed                  # create demo users (see below)
npm run start:dev

# 3. Frontend (Angular, http://localhost:4200)
cd ../frontend
npm install
npx ng serve                  # proxies /api to the backend
```

## Demo accounts

Seeded by `npm run seed` — password for all: `Demo1234!` (override via `SEED_PASSWORD` / `SEED_PASSWORD_<ROLE>`).

| Email | Role | Can do |
|---|---|---|
| `requester@flowgate.demo` | requester | create and submit own requests |
| `reviewer@flowgate.demo` | reviewer | review, approve/reject assigned requests |
| `admin@flowgate.demo` | admin | everything, incl. user management |

The seed refuses to run with `NODE_ENV=production` unless `ALLOW_PROD_SEED=true` is set.

## Architecture

- **Backend:** NestJS with bounded contexts (`auth`, `users`, `requests`, `events`) and DDD layering per module — `domain/` is framework-free (entities, value objects, repository interfaces), `infrastructure/` holds the TypeORM implementations, `application/` the use cases. Repository pattern wired via injection tokens.
- **Auth:** JWT (1h), global guards — `JwtAuthGuard` (authentication, 401) and `RolesGuard` (authorization, 403), opt-out via `@Public()`.
- **Frontend:** Angular standalone components, signals-based `AuthService`, functional HTTP interceptor and route guards, lazy-loaded routes.

See `SPEC.md` for the full specification and `docs/` for plans and (later) the case study.
