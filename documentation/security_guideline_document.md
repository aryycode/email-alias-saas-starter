# Security Guidelines for email-alias-saas-starter

This document outlines the security principles, controls, and best practices to follow when developing, configuring, and operating the `email-alias-saas-starter` application. It is organized according to core security domains and provides actionable recommendations tailored to this project’s architecture.

---

## 1. Authentication & Access Control

•  **Strong Credential Policies**  
   – Enforce minimum password length (12+ characters), complexity (uppercase, lowercase, digits, symbols), and periodic rotation for service and administrative accounts.  
   – Leverage Better Auth’s built-in policies or extend them to reject common/compromised passwords.  

•  **Secure Session Management**  
   – Store session tokens in secure, HTTP-only cookies with the `Secure` and `SameSite=Strict` attributes.  
   – Enforce both idle and absolute session timeouts (e.g., idle: 15m, absolute: 8h).  
   – Invalidate sessions on logout or password change to prevent session fixation.  

•  **Role-Based Access Control (RBAC)**  
   – Define roles (e.g., `user`, `admin`, `support`) in your database and assign permissions for each API route and UI action.  
   – Implement server-side authorization checks in your Next.js API middleware (e.g., wrap `/api/domains`, `/api/emails`, `/api/webhook` routes) to ensure only authorized roles can perform sensitive operations.  

•  **Multi-Factor Authentication (MFA)**  
   – Offer optional MFA (TOTP or SMS) for users managing domains or viewing incoming email data.  
   – Integrate a trusted library (e.g., `otplib`) or third-party provider to manage TOTP secrets and verification flows.  

## 2. Input Handling & Processing

•  **Schema-Based Validation**  
   – Use a validation library (e.g., Zod) for all API request bodies and webhook payloads.  
   – Define strict schemas for domain creation (`name`, `type`), alias provisioning, email metadata, and the inbound webhook’s raw content.  

•  **Prevent Injection Attacks**  
   – Interact with PostgreSQL exclusively through Drizzle ORM’s parameterized queries.  
   – Never construct raw SQL strings with user input.  
   – For any dynamic DNS validation, strictly validate domain names against a whitelist pattern (e.g., `^[a-z0-9.-]+\.[a-z]{2,}$`).  

•  **Sanitize and Encode Output**  
   – When rendering email bodies or domain names in React, apply context-aware encoding or sanitize HTML with DOMPurify before injecting into the DOM.  

•  **Secure File Uploads & Attachments**  
   – Validate attachment MIME types and enforce file size limits.  
   – Store attachments outside the public webroot or in a separate object-storage bucket with restricted read/write policies.  
   – Scan uploaded files for malware using a scanning service or virus-scan library.  

## 3. Data Protection & Privacy

•  **Encryption in Transit & At Rest**  
   – Enforce HTTPS (TLS 1.2+) across all Next.js pages and API routes.  
   – Configure HSTS (`Strict-Transport-Security`) with a long max-age and subdomain inclusion.  
   – Encrypt database data at rest by enabling PostgreSQL’s file-system encryption or using a managed database with encryption enabled.  

•  **Secure Secrets Management**  
   – Store all secrets (e.g., `WORKER_SECRET_KEY`, database credentials, object storage keys) in a vault or cloud provider’s secret manager—never in source code or `.env` files under version control.  
   – Rotate secrets on a regular schedule and revoke immediately if compromised.  

•  **Data Minimization & Masking**  
   – Return only necessary fields in API responses (avoid exposing full PII unless required).  
   – Mask or redact sensitive data (e.g., email addresses, full names) in logs and error messages.  

## 4. API & Service Security

•  **Endpoint Protection**  
   – Require authentication on every API route under `/api/*`.  
   – For the inbound webhook (`/api/webhook/email-inbound`), validate a strong secret using a constant-time comparison and return `401 Unauthorized` on failure.  

•  **Rate Limiting & Throttling**  
   – Implement rate limiting on public endpoints (e.g., sign-up, sign-in) to mitigate brute-force and credential-stuffing attacks.  
   – Apply stricter limits to the inbound webhook to prevent denial-of-service (e.g., max 100 requests/min per IP).  

•  **CORS & CSRF**  
   – Configure CORS to allow only your sanctioned client origins.  
   – Use anti-CSRF tokens for state-changing requests in the dashboard and API calls.  

•  **API Versioning**  
   – Prefix your routes (e.g., `/api/v1/domains`, `/api/v1/emails`) to manage breaking changes and deprecations securely.  

## 5. Web Application Security Hygiene

•  **Security Headers**  
   – `Content-Security-Policy`: Restrict scripts to self and trusted CDNs, sandbox iframes for email views.  
   – `X-Frame-Options: DENY` or CSP `frame-ancestors 'none'` to prevent clickjacking.  
   – `X-Content-Type-Options: nosniff` and `Referrer-Policy: no-referrer-when-downgrade`.  

•  **Cookie Security**  
   – Set cookies as `HttpOnly`, `Secure`, `SameSite=Strict` to prevent XSS/CSRF attacks.  

•  **Avoid Client-Side Storage of Sensitive Data**  
   – Do not store tokens, secrets, or PII in `localStorage` or `sessionStorage`.  

## 6. Infrastructure & Configuration Management

•  **Harden Docker & Containers**  
   – Run Node processes as a non-root user inside containers.  
   – Minimize base images and remove unnecessary packages.  
   – Mount secrets as read-only files (e.g., Docker secrets) rather than environment variables when possible.  

•  **Secure Database Configuration**  
   – Use a dedicated database user with least privileges (e.g., separate `read_only` and `write` roles).  
   – Enforce SSL/TLS connections to the PostgreSQL instance.  

•  **Change Default Credentials**  
   – Ensure any default admin accounts or ports are disabled or renamed in production.  

•  **Automated Patch Management**  
   – Regularly update the OS, Node.js runtime, Next.js, and all dependencies.  
   – Integrate continuous scanning (e.g., Dependabot, Snyk) to catch vulnerable packages.  

## 7. Dependency Management

•  **Vet Third-Party Libraries**  
   – Choose well-maintained packages with active communities.  
   – Review dependency changelogs and vulnerability advisories before upgrading.  

•  **Deterministic Builds**  
   – Commit lockfiles (`package-lock.json`) and regenerate them only after review.  

•  **Minimize Attack Surface**  
   – Remove unused dependencies (e.g., test frameworks) from production bundles.  

## 8. Logging, Monitoring & Incident Response

•  **Secure Logging**  
   – Log failed authentication attempts, CSRF violations, and webhook signature mismatches.  
   – Do not log PII or raw email content; log only metadata (timestamps, userId, domain).  

•  **Monitoring & Alerts**  
   – Configure real-time alerts for anomalous spikes in webhook failures or login attempts.  
   – Use a centralized logging/monitoring service (e.g., ELK, Datadog).  

•  **Incident Response Plan**  
   – Define processes for secret/key rotation, user notifications, and service recovery.  

## 9. Developer Best Practices

•  **Code Reviews & Security Audits**  
   – Mandate peer reviews with a security checklist for every pull request.  
   – Periodically perform threat modeling sessions for new features (e.g., email parsing, object storage integration).  

•  **Testing Strategy**  
   – Develop unit tests for validation logic and API handlers.  
   – Create integration tests simulating Cloudflare Worker webhook requests and DNS verification flows.  
   – Perform regular static analysis and SAST scans on the codebase.  

•  **Documentation & Training**  
   – Document security controls and configuration steps in the project’s README or a dedicated `SECURITY.md`.  
   – Provide onboarding training on secure coding practices and incident response.  

---

Adhering to these guidelines will help ensure that the `email-alias-saas-starter` application is built and maintained with a robust security posture, protecting both your infrastructure and user data from emerging threats.