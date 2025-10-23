# Tech Stack Document for email-alias-saas-starter

This document explains, in everyday language, the technology choices behind the **email-alias-saas-starter** project. It will help you understand why each tool or framework was chosen and how they work together to create a modern, secure, and scalable email alias management application.

## 1. Frontend Technologies

We chose a set of tools and libraries that make building a fast, interactive, and user-friendly interface easy.

- **Next.js (App Router)**
  - Provides React-based pages and server-side rendering out of the box.
  - Lets us combine front-end views and backend API routes in one codebase.
- **React**
  - A popular library for building reusable UI components.
  - Enables dynamic, interactive user interfaces.
- **TypeScript**
  - Adds type checking on top of JavaScript for fewer runtime errors.
  - Improves code clarity and maintainability.
- **Tailwind CSS (v4)**
  - A utility-first styling framework that speeds up CSS development.
  - Ensures consistent spacing, colors, and typography across the app.
- **shadcn/ui**
  - A collection of pre-built, customizable React components (cards, tables, forms, buttons).
  - Helps deliver a clean, consistent design quickly.
- **next-themes**
  - Manages light/dark mode with a simple toggle.
  - Persists user preference in local storage for a seamless experience.
- **Lucide React**
  - A set of SVG icons that integrate easily with React components.

Together, these choices let us build a polished dashboard (domains list, inbox view, detail panels) that feels responsive and cohesive, without reinventing the wheel.

## 2. Backend Technologies

The backend powers data storage, business logic, and secure user management.

- **Better Auth**
  - Provides secure user sign-up and sign-in flows.
  - Manages sessions with HTTP-only cookies to protect dashboard pages and API routes.
- **Next.js API Routes**
  - Let us build serverless endpoints directly inside the `app/api` folder.
  - Handle tasks like receiving webhooks, listing domains, and fetching emails.
- **Node.js**
  - Runs JavaScript/TypeScript on the server side.
- **PostgreSQL**
  - A reliable relational database to store users, domains, aliases, emails, and attachments.
- **Drizzle ORM**
  - Defines database schemas in TypeScript, ensuring type safety.
  - Simplifies queries and migrations for all tables.
- **mailparser**
  - Parses raw email content (headers, HTML/plain text body, attachments) in the inbound webhook.
- **Node’s `dns.promises`**
  - Checks DNS TXT records for domain verification within an API route.

These components work together so that user data, email records, and domain information are stored safely and can be retrieved or updated through simple API calls.

## 3. Infrastructure and Deployment

We set up a development and deployment environment that’s reliable, consistent, and easy to scale.

- **Docker & docker-compose**
  - Containerize the application and PostgreSQL database.
  - Ensure everyone on the team uses the same environment.
- **Next.js Standalone Build** (`output: 'standalone'`)
  - Produces a compact, self-contained server build suitable for containers.
- **Vercel (Deployment Target)**
  - Optimized for hosting Next.js apps with zero-configuration deployments.
- **Git and GitHub**
  - Version control system for source code management.
  - Supports collaboration, code review, and branch-based workflows.
- **(Optional CI/CD)**
  - A pipeline (e.g., GitHub Actions) can run tests and deploy on every merge to main.

This setup ensures consistent builds, quick deployments, and a clear path from local development to production.

## 4. Third-Party Integrations

We integrate external services to extend functionality without reinventing the wheel.

- **Cloudflare Workers**
  - Receives inbound emails and forwards them via a secure webhook.
- **Object Storage (R2, S3, etc.)**
  - Stores email attachments outside the database.
  - SDKs stream files directly from the webhook to storage.
- **Pusher or Ably (Optional, Real-Time)**
  - Sends live notifications (e.g., “New Email”) to the dashboard.
- **mailparser**
  - Although open-source, it serves as a critical service for breaking down raw email content.

These integrations reduce development time and provide reliable, scalable services for email handling and notifications.

## 5. Security and Performance Considerations

We built in safeguards and optimizations to protect data and keep the app snappy.

Security Measures:

- **HTTP-Only Cookies**
  - Protect session tokens from client-side JavaScript.
- **Environment Variables** (`.env`) 
  - Store secrets (Worker key, database credentials, storage keys) outside source control.
- **Request Validation (e.g., Zod)**
  - Validates incoming JSON bodies for domain creation and webhook events.
- **Secret Key Check**
  - Verifies `WORKER_SECRET_KEY` header for the email webhook.
- **XSS Protection**
  - Renders HTML email content in a sandboxed `iframe` or sanitizes with `DOMPurify`.

Performance Optimizations:

- **Server-Side Rendering (SSR)**
  - Pre-renders pages for faster first load and better SEO.
- **Standalone Docker Build**
  - Produces a lean production image with only needed dependencies.
- **Caching (Optional)**
  - Leverage Next.js’s built-in caching strategies for static assets and API responses.

## 6. Conclusion and Overall Tech Stack Summary

In summary, the **email-alias-saas-starter** uses a modern, end-to-end TypeScript stack:

- Frontend: Next.js, React, Tailwind CSS, shadcn/ui, next-themes, Lucide icons
- Backend: Next.js API routes, Better Auth, PostgreSQL, Drizzle ORM, mailparser, Node DNS module
- Infrastructure: Docker, docker-compose, standalone Next.js build, Vercel deployments, Git/GitHub
- Integrations: Cloudflare Workers, object storage (R2/S3), optional real-time via Pusher/Ably
- Security & Performance: HTTP-only cookies, env variables, request validation, XSS protection, SSR

These choices align perfectly with the project goals: to provide a secure, scalable, and developer-friendly foundation for building email alias management features like domain verification, inbox display, and attachment handling. The result is a solid SaaS starter that gets you quickly to your core functionality with best practices built in.