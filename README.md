# Subscription Microservice (subscription-ms)

## Overview
The Subscription Microservice serves as the core billing, quoting, and feature-gating engine of the multi-tenant SaaS platform. Built on Domain-Driven Design (DDD), this service encapsulates complex business rules regarding subscription tiers, usage limits, metering, and invoice lifecycle management.

It acts as the single source of truth for determining whether a tenant (company) has access to specific application features, enforcing quotas in real-time, and securely processing simulated webhooks from third-party payment providers (e.g., Stripe, PayPal).

## Responsibilities
- **Subscription Lifecycle Management:** Handles the creation, upgrade, downgrade, status tracking, and cancellation of subscriptions.
- **Feature Gating & Usage Metering:** Enforces tenant quotas by tracking usage increments/decrements in real-time and exposing a highly performant `hasAccessToFeature` gateway for other microservices.
- **Invoice & Billing Orchestration:** Tracks billing cycles, invoice history, and securely handles asynchronous payment gateway webhooks (Payment Succeeded / Payment Failed) decoupled from internal JWT constraints.
- **Enterprise Database Patterns:** Leverages PostgreSQL with a custom `QueryBuilder` and `TransactionManager` to guarantee atomicity and cross-table consistency during complex subscription mutations.

## Tech Stack
- **Runtime:** Node.js
- **Language:** TypeScript
- **Web Framework:** Hono (optimized for edge and modern Node environments)
- **Validation & Documentation:** Zod + OpenAPI (Auto-generated Swagger documentation)
- **Database:** PostgreSQL (interfaced via robust, custom SQL drivers)
- **Security:** HMAC-signature simulation for webhooks and JWT validation for internal endpoints.

## Architecture
The service adheres to a strictly layered Domain-Driven Design (DDD) utilizing an Onion Architecture:
- **Domain Layer (`src/domain/`)**: Contains pure business logic. Defines Entities (Subscription, Plan, Invoice), Value Objects, and abstract Repositories.
- **Application Layer (`src/application/`)**: Application services that map DTOs to Domain Entities and choreograph transactions spanning multiple repositories.
- **Infrastructure Layer (`src/infrastructure/`)**: Concrete persistence adapters interacting with PostgreSQL through specialized query builders.
- **Presentation Layer (`src/presentation/`)**: Distinct modular routing for Invoices (including external Webhooks), Plans, and Subscriptions. Validation driven by Hono and Zod.

## Local Development

### Prerequisites
- Node.js (v18 or higher recommended)
- pnpm (package manager used across the monorepo)
- A running instance of PostgreSQL

### Installation
1. Install dependencies:
```bash
pnpm install
```

2. Configure environment variables in an `.env` file at the root of `subscription-ms`:
```env
PORT=3002
API_BASE_URL=/api
DOCS_URL=/public/api-docs
OPENAPI_URL=/public/openapi.json
DB_PG_HOST=localhost
DB_PG_PORT=5432
DB_PG_USER=your_db_user
DB_PG_PASSWORD=your_db_password
DB_PG_DATABASE=subscription_db
JWT_SECRET=your-internal-jwt-signature-key
```

### Running the Application
Start the development server:
```bash
pnpm run dev
```

By default, the server will start on port 3002. You can view the OpenAPI documentation and test endpoints at:
```
http://localhost:3002/public/api-docs
```

## Production Details
This microservice ships with a production-ready `Dockerfile` focusing on minimal attack surface and rapid start times, designed for highly scalable environments like AWS ECS, EKS, or Kubernetes clusters.
