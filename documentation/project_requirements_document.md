# Project Requirements Document (PRD)

## 1. Project Overview

This project is an email alias management SaaS built on a modern full-stack template. Users can register custom sending and receiving domains, create email aliases, and view incoming messages in a secure dashboard. Behind the scenes, a Cloudflare Worker forwards inbound mail to our webhook, which parses, stores, and surfaces messages and attachments. This eliminates the need for users to expose their real inboxes, reducing spam and consolidating multiple email identities in one place.

We’re building this because people want more control over their email footprint and a centralized interface for handling custom domains and aliases. Key objectives are: 

•  A smooth, secure signup and login experience.  
•  A reliable DNS verification flow for custom domains.  
•  Real-time or near-real-time delivery of inbound messages.  
•  A clean inbox UI that safely renders HTML and attachments.  

Success will be measured by the number of verified domains added, aliases created, and emails successfully received and displayed without errors.

## 2. In-Scope vs. Out-of-Scope

### In-Scope (v1)

•  User authentication and session management (signup, login, logout).  
•  Dashboard with protected routes.  
•  Domain management: add, list, verify via DNS TXT lookup.  
•  Alias management under each verified domain.  
•  Webhook endpoint for inbound email from Cloudflare Worker.  
•  Parsing of raw email (headers, body, attachments) using mailparser.  
•  Saving emails and attachments in PostgreSQL (with Drizzle ORM) and object storage.  
•  Inbox UI: paginated list, detail view, read/unread marking.  
•  Light/dark theme toggle (persisted preference).  

### Out-of-Scope (Phase 2+)

•  Outbound SMTP sending of emails.  
•  Advanced analytics or reporting dashboards.  
•  OAuth or SSO (e.g., Google, GitHub).  
•  Native mobile apps (iOS/Android).  
•  AI-driven spam filtering or classification.  
•  Multi-tenant billing and subscription management.  

## 3. User Flow

A new user visits the landing page and clicks "Sign Up". They register with email and password (stored via Better Auth), then land on the protected `/dashboard` home screen. The sidebar shows links to "Domains" and "Inbox." They click "Domains" to add their first custom domain. A form asks for `example.com`; on submit, the frontend calls `POST /api/domains`. The server writes a pending record and returns the TXT record users must add in their DNS.

Once DNS is updated, the user clicks "Verify" next to that domain entry. The frontend calls `GET /api/domains/verify?domain=example.com`, and the backend checks `dns.promises.resolveTxt`. If the TXT record matches, the domain status updates to "Verified." Next, the user creates an alias under that domain. They navigate to "Aliases," click "New Alias," enter `news@example.com`, and save. The alias appears in the list.

The user then tests inbound flow by sending mail to `news@example.com`. Cloudflare Worker receives it and posts to `/api/webhook/email-inbound`. The app validates the worker secret, parses the email, finds the user by recipient domain, inserts the email & attachments, and returns 201. Back in the dashboard, the user clicks "Inbox" to see the new message, clicks it to view safely rendered HTML in a sandbox or sanitized markup, and downloads attachments if any.

## 4. Core Features

-  **Authentication & Authorization**: Secure signup/login, HTTP-only cookies, session guard on all dashboard pages and API routes.  
-  **Dashboard Layout**: Sidebar navigation, main content area, theming toggle.  
-  **Domain CRUD + Verification**: API endpoints for create/list/delete, DNS TXT check using Node’s `dns.promises`.  
-  **Alias Management**: CRUD for email aliases scoped to verified domains.  
-  **Inbound Email Webhook**: Route at `/api/webhook/email-inbound`, secret validation, raw parsing with `mailparser`.  
-  **Data Models**: Drizzle ORM schemas for `users`, `domains`, `aliases`, `emails`, `attachments`.  
-  **Attachments Storage**: Stream to S3 or Cloudflare R2, store metadata in DB.  
-  **Inbox UI**: Paginated list with sender, subject, timestamp, read/unread status; detail view with sanitized/sandboxed HTML.  
-  **Notifications**: Toasts for success/error and new-email events (to be added in real-time phase).  
-  **Theming**: Light/dark mode via `next-themes`, preference persisted.  

## 5. Tech Stack & Tools

-  Frontend: Next.js (App Router), React, TypeScript.  
-  Styling: Tailwind CSS, shadcn/ui components, Lucide React icons, next-themes.  
-  Backend: Node.js (v18+), Next.js API routes, TypeScript.  
-  Database: PostgreSQL, Drizzle ORM.  
-  Auth: Better Auth (session cookies).  
-  Email Parsing: mailparser library.  
-  DNS Verification: Node’s `dns.promises.resolveTxt`.  
-  Object Storage: AWS S3 or Cloudflare R2 SDK.  
-  Containerization: Docker, docker-compose (Postgres service).  
-  Deployment: Vercel (or any Node.js-friendly host).  
-  Validation & Testing: Zod for schema validation, Vitest/Jest for unit/integration tests, Playwright for end-to-end.  
-  IDE & Plugins: VS Code, Cursor AI for code suggestions, Windsurf for snippets (optional).  

## 6. Non-Functional Requirements

-  **Performance**: API responses under 200ms; initial page load under 1s on 3G.  
-  **Scalability**: Must support thousands of users and email events; database indexes on `domains`, `aliases`, `emails`.  
-  **Security**: OWASP Top 10 compliance, secret key validation, input sanitization (XSS prevention), HTTPS only, HTTP-only cookies.  
-  **Reliability**: Webhook idempotency, retry logic for DNS and storage writes.  
-  **Usability**: Accessible (WCAG AA), responsive (mobile to desktop), clear validation/error messages.  
-  **Compliance**: GDPR-friendly data handling, environment variables for secrets in `.env`.  

## 7. Constraints & Assumptions

-  Assumes Cloudflare Worker is set up to forward inbound mail via POST.  
-  Requires Next.js App Router (v14+) and Node.js v18+.  
-  PostgreSQL must run in Docker or external managed instance.  
-  Drizzle ORM schema definitions will cover all tables and relations.  
-  Object storage credentials provided via environment (`.env`).  
-  No external SMTP service required for v1; inbound only.  

## 8. Known Issues & Potential Pitfalls

-  **Email Parsing Edge Cases**: Complex MIME structures can break `mailparser`.  
  *Mitigation*: Write tests for multi-part emails, log parse failures.  
-  **DNS Propagation Delays**: Users may click "Verify" before TXT records propagate.  
  *Mitigation*: Retry with exponential backoff, show clear instructions.  
-  **Large Attachments**: Streaming big files can exhaust memory.  
  *Mitigation*: Use streaming APIs, enforce max size, upload directly to storage.  
-  **XSS in Email HTML**: Malicious scripts in email content.  
  *Mitigation*: Sandbox in `iframe` or sanitize with DOMPurify.  
-  **API Rate Limits**: On high email volume, webhook may hit rate limits.  
  *Mitigation*: Queue messages (e.g., BullMQ) or batch inserts.  
-  **Transactional Integrity**: Partial failures (DB write + upload).  
  *Mitigation*: Use two-phase commit or compensating cleanup logic on failure.  

This document should serve as the single source of truth for all subsequent technical designs and implementation steps. Any changes or additions must map back clearly to these requirements to avoid scope confusion.