# Email Alias SaaS Implementation Guide

This document describes the email alias SaaS functionality that has been implemented in the `codeguide-starter-fullstack` project.

## Overview

The email alias SaaS system allows users to:
1. Add custom domains and verify ownership via DNS
2. Create email aliases for their domains
3. Receive emails sent to those aliases
4. View and manage received emails through a web interface

## Architecture

### Database Schema

The following tables have been added to support email functionality:

#### `domains` Table
- `id` (UUID, Primary Key)
- `userId` (Foreign Key to users table)
- `domainName` (String, Unique)
- `isVerified` (Boolean, Default: false)
- `verificationCode` (String, Unique)
- `createdAt` (Timestamp)

#### `aliases` Table
- `id` (UUID, Primary Key)
- `userId` (Foreign Key to users table)
- `domainId` (Foreign Key to domains table, Nullable)
- `aliasEmail` (String, Unique)
- `description` (Text, Nullable)
- `createdAt` (Timestamp)

#### `emails` Table
- `id` (UUID, Primary Key)
- `userId` (Foreign Key to users table)
- `aliasId` (Foreign Key to aliases table, Nullable)
- `fromAddress` (String)
- `subject` (String, Nullable)
- `bodyText` (Text, Nullable)
- `bodyHtml` (Text, Nullable)
- `isRead` (Boolean, Default: false)
- `receivedAt` (Timestamp, Default: now)

#### `attachments` Table
- `id` (UUID, Primary Key)
- `emailId` (Foreign Key to emails table)
- `filename` (String)
- `contentType` (String)
- `sizeBytes` (Integer)
- `storagePath` (String)

### API Routes

#### Email Webhook
- **Endpoint**: `POST /api/webhook/email-inbound`
- **Purpose**: Receives raw email data from Cloudflare Worker
- **Authentication**: `WORKER_SECRET_KEY` in Authorization header
- **Process**:
  1. Validates secret key
  2. Extracts recipient from `X-Email-To` header
  3. Parses raw email using `mailparser`
  4. Finds user by checking aliases table, then domains table
  5. Stores email and attachments in database

#### Domain Management
- **GET /api/domains**: List user's domains
- **POST /api/domains**: Add new domain with verification code
- **POST /api/domains/[id]/verify**: Verify domain via DNS TXT record
- **DELETE /api/domains/[id]**: Delete domain

#### Email Management
- **GET /api/emails**: List user's emails with pagination
- **GET /api/emails/[id]**: Get email details and mark as read
- **DELETE /api/emails/[id]**: Delete email

### Frontend Pages

#### Domain Management (`/dashboard/domains`)
- Add new domains
- View verification status
- Display DNS configuration instructions
- Verify domains via DNS lookup
- Delete domains

#### Inbox (`/dashboard/inbox`)
- Two-panel layout (email list + detail view)
- Search functionality
- Read/unread status indicators
- Attachment display
- Secure HTML rendering using iframe
- Individual email pages (`/dashboard/inbox/[id]`)

## Email Flow

1. **Incoming Email**: Email sent to alias@user-domain.com
2. **DNS Routing**: MX records route to Cloudflare
3. **Cloudflare Worker**: Captures email and forwards to webhook
4. **Webhook Processing**: Parses email and stores in database
5. **User Interface**: Email appears in user's inbox

## Security Features

### Webhook Security
- Secret key validation for webhook endpoint
- User authorization checks on all API routes

### Email Rendering Security
- HTML emails rendered in iframe with `sandbox` attribute
- Prevents XSS attacks from malicious email content

### Authentication
- All API routes protected with Better Auth session validation
- User can only access their own data

## Configuration Required

### Environment Variables
```env
# Email Management
WORKER_SECRET_KEY=your_secret_key_here

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/postgres

# Auth
BETTER_AUTH_SECRET=your_auth_secret
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```

### Cloudflare Setup (Required for production)

#### Worker Configuration
```javascript
// Worker code to forward emails to webhook
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const authHeader = request.headers.get('Authorization')
  if (authHeader !== WORKER_SECRET_KEY) {
    return new Response('Unauthorized', { status: 401 })
  }

  const emailData = await request.text()
  const recipient = request.headers.get('X-Email-To')

  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': WORKER_SECRET_KEY,
      'X-Email-To': recipient,
      'Content-Type': 'text/plain'
    },
    body: emailData
  })

  return response
}
```

#### Email Routing Configuration
1. Enable Email Routing in Cloudflare dashboard
2. Create catch-all rule with lowest priority
3. Set action to "Send to Worker"

#### DNS Records for Custom Domains
For each user domain:
- **MX Record**: `@` → `mx.cloudflare.net` (Priority: 10)
- **TXT Record**: `@` → `{verificationCode}` (for domain verification)

## Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Database Setup**:
   ```bash
   npm run db:up
   npm run db:push
   ```

3. **Environment Configuration**:
   Copy `.env.example` to `.env` and configure

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

## File Structure

```
├── db/schema/
│   ├── domains.ts
│   ├── aliases.ts
│   ├── emails.ts
│   ├── attachments.ts
│   └── index.ts
├── app/api/
│   ├── webhook/email-inbound/route.ts
│   ├── domains/route.ts
│   ├── domains/[domainId]/route.ts
│   ├── domains/[domainId]/verify/route.ts
│   ├── emails/route.ts
│   └── emails/[emailId]/route.ts
├── app/dashboard/
│   ├── domains/page.tsx
│   ├── inbox/page.tsx
│   └── inbox/[emailId]/page.tsx
└── components/
    ├── app-sidebar.tsx (updated)
    └── ui/ (shadcn/ui components)
```

## Future Enhancements

1. **Alias Management**: UI for creating and managing email aliases
2. **Real-time Updates**: WebSocket integration for new email notifications
3. **Email Sending**: Compose and send emails from aliases
4. **Advanced Filtering**: More sophisticated email filtering and search
5. **Email Forwarding**: Forward emails to external addresses
6. **Storage Implementation**: Complete attachment storage with S3/R2 integration

## Testing

To test the email flow in development:

1. **Database**: Ensure PostgreSQL is running and schema is applied
2. **Webhook**: Use curl to test webhook endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/webhook/email-inbound \
     -H "Authorization: your_worker_secret_key" \
     -H "X-Email-To: test@example.com" \
     -H "Content-Type: text/plain" \
     --data-binary @sample_email.eml
   ```
3. **Domain Management**: Add domains through UI and test DNS verification
4. **Email Viewing**: Navigate to inbox to view received emails

## Troubleshooting

### Common Issues

1. **Database Connection**: Check DATABASE_URL and ensure PostgreSQL is running
2. **Authentication**: Verify Better Auth configuration and session handling
3. **DNS Verification**: Ensure DNS records have propagated (can take 24-48 hours)
4. **Webhook Security**: Confirm WORKER_SECRET_KEY matches between Cloudflare and application

### Logging

Check console logs for:
- Webhook processing errors
- DNS lookup failures
- Authentication issues
- Database connection problems

## Support

For issues or questions about the email alias SaaS implementation, refer to:
- Project documentation in `/documentation/`
- Component code comments
- Drizzle ORM documentation for database queries
- Better Auth documentation for authentication
- Next.js App Router documentation for API routes