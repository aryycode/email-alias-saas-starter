# Backend Structure Document

This document outlines the backend setup for the `email-alias-saas-starter` project. It covers the overall architecture, database, API design, hosting, infrastructure, security, and monitoring to provide a clear picture of how everything fits together.

## 1. Backend Architecture

**Overview**
- Built with Next.js (App Router) running on a Node.js environment.  
- Uses serverless functions (API routes) for handling HTTP requests without managing servers directly.  
- Organized in a layered pattern:
  - **Routing Layer**: Next.js API route files map URLs to handlers.  
  - **Controller/Handler Layer**: Each route calls a function to process input, enforce business logic, and call services.  
  - **Service/Data Layer**: Encapsulates database queries via Drizzle ORM.

**Key Benefits**
- **Scalability**:  
  - Serverless functions auto-scale with demand.  
  - Containerized development (Docker) can easily be mirrored in production.
- **Maintainability**:  
  - TypeScript enforces types across the codebase.  
  - Clear folder structure (`app/`, `db/`, `components/`, `lib/`).
- **Performance**:  
  - Built-in edge and static caching via Vercel.  
  - Database connection pooling and indexed queries for speed.

## 2. Database Management

**Database Technology**
- Type: SQL (relational).  
- System: PostgreSQL.  
- ORM: Drizzle ORM (TypeScript-first).

**Data Handling**
- **Connection**: Environment variable–driven connection string with pooling.  
- **Structure**: Five main tables—`users`, `domains`, `aliases`, `emails`, `attachments`.  
- **Best Practices**:
  - Transactions for multi-step operations (e.g., storing email + attachments).  
  - Indexes on foreign keys and search fields (e.g., `recipient`, `received_at`).  
  - Migrations managed via Drizzle or a separate migration tool.

## 3. Database Schema

**Human-Readable Summary**
- **users**: Built-in by Better Auth. Stores user credentials and metadata.  
- **domains**: Tracks custom domains added by each user, along with verification status.  
- **aliases**: Stores email alias addresses tied to a domain.  
- **emails**: Records each received message’s headers, body, timestamp, and read/unread state.  
- **attachments**: Metadata for each email attachment and a pointer to an object storage key.

**SQL Schema (PostgreSQL)**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE domains (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_at TIMESTAMPTZ
);

CREATE TABLE aliases (
  id SERIAL PRIMARY KEY,
  domain_id INT NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  local_part TEXT NOT NULL,
  full_address TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE emails (
  id SERIAL PRIMARY KEY,
  alias_id INT NOT NULL REFERENCES aliases(id) ON DELETE SET NULL,
  sender TEXT NOT NULL,
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_read BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE attachments (
  id SERIAL PRIMARY KEY,
  email_id INT NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  content_type TEXT,
  size_bytes INT,
  storage_key TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```  

## 4. API Design and Endpoints

**Approach**: RESTful API via Next.js App Router.

**Authentication**: All routes (except `/api/auth`) require a valid session cookie from Better Auth.

**Key Endpoints**:
- **POST** `/api/webhook/email-inbound`
  - Receives raw email POSTs from Cloudflare Worker.  
  - Validates a secret key header.  
  - Parses email with `mailparser`.  
  - Inserts records into `emails` and `attachments`.
- **GET** `/api/domains`
  - Lists user’s domains.
- **POST** `/api/domains`
  - Adds a new domain for the user.
- **GET** `/api/domains/:id/verify`
  - Checks DNS TXT records for ownership.  
  - Updates `is_verified` flag.
- **GET** `/api/emails`
  - Lists metadata for the user’s emails (paginated).
- **GET** `/api/emails/:id`
  - Returns full email content (text, HTML, attachments list).
- **PATCH** `/api/emails/:id/read`
  - Marks an email as read.

## 5. Hosting Solutions

**Primary Platform**: Vercel
- Serverless functions power API routes.  
- Built-in CDN for static assets and page caching.  
- Automatic scaling and zero-maintenance deployments.

**Database Hosting**:
- **Development**: Docker Compose–managed PostgreSQL container.  
- **Production**: Managed PostgreSQL service (e.g., AWS RDS, Supabase).

**Benefits**:
- Reliability through managed infrastructure.  
- Cost-effective startup with free tiers (Vercel, Supabase).  
- Global performance via CDN.

## 6. Infrastructure Components

- **Load Balancer / Edge Network**: Vercel’s edge delivers requests to nearest serverless region.  
- **CDN**: Caches static assets and ISR/SSG pages.  
- **Cache Layer**:
  - Browser cache controlled via HTTP headers.  
  - Optional Redis cache for session or rate-limiting (future enhancement).
- **Object Storage**: Cloudflare R2 or AWS S3 for attachments.  
- **CI/CD**: Git-based deployment pipeline on Vercel.  
- **Containerization** (Dev/Staging): Docker + Docker Compose for consistent local environments.

## 7. Security Measures

- **Authentication & Authorization**:  
  - Better Auth for secure sign-up/sign-in.  
  - HTTP-only cookies prevent client-side tampering.  
  - API route guards verify sessions on each request.
- **Webhook Protection**:  
  - Secret key check on `/api/webhook/email-inbound` header.  
- **Input Validation**:  
  - Zod schemas validate all incoming JSON bodies (domains, aliases, webhook payload).  
- **Data Encryption**:  
  - TLS (HTTPS) for all traffic.  
  - Managed DB encryption at rest.  
  - Object storage encryption for attachments.
- **Content Sanitization**:  
  - Email HTML sanitized via DOMPurify or sandboxed in an `iframe` to prevent XSS.
- **Secrets Management**:  
  - `.env` files store keys outside of source control.  
  - Vercel Environment Variables handle production secrets.

## 8. Monitoring and Maintenance

- **Error Monitoring**: Sentry (or Logflare) captures runtime exceptions in API routes and edge functions.  
- **Performance Metrics**:  
  - Vercel Analytics for response latencies and traffic patterns.  
  - Database monitoring via built-in RDS dashboard or Datadog.
- **Logging**:  
  - Structured logs in Vercel console.  
  - Centralized log retention for troubleshooting.
- **Uptime & Alerts**:  
  - Health checks with UptimeRobot or Vercel.  
  - Alerts for error rate spikes or downtime.
- **Maintenance Strategy**:  
  - Regular dependency updates via automated tools (Dependabot).  
  - Nightly database backups and periodic restore drills.  
  - Quarterly security audits of infrastructure and code.

## 9. Conclusion and Overall Backend Summary

This backend is designed to meet the needs of an email-alias SaaS application by combining a modern serverless framework (Next.js) with a robust relational database (PostgreSQL). The architecture is:

- **Scalable**: Serverless functions and managed services scale with user demand.  
- **Maintainable**: TypeScript, clear folder structure, and ORM-driven schemas keep the codebase clean and consistent.  
- **Secure**: End-to-end encryption, input validation, and proper authentication guard all user data.  
- **Performant**: CDN caching, connection pooling, and edge delivery ensure fast responses.

Unique aspects:
- Seamless webhook integration for inbound email processing.  
- Drizzle ORM’s type-safe schema definitions in TypeScript.  
- Flexible infrastructure that spans local Docker development to global serverless production.

This comprehensive setup provides a rock-solid foundation to build, iterate, and scale your email alias management platform.