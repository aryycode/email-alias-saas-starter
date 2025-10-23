flowchart TD
    A[User opens app] --> B[Check authentication]
    B -->|Authenticated| C[Show dashboard]
    B -->|Not authenticated| D[Redirect to login]
    D --> E[User enters credentials]
    E --> B
    C --> F[Domains page]
    C --> G[Inbox page]
    F --> H[Add domain]
    H --> I[Validate domain format]
    I --> J{Domain valid}
    J -->|Yes| K[Save domain]
    J -->|No| L[Show error]
    K --> M[Check DNS records]
    M --> N{DNS verified}
    N -->|Yes| O[Update status to verified]
    N -->|No| P[Prompt add DNS]
    G --> Q[Fetch email list]
    Q --> R[Display inbox]
    R --> S[Select email]
    S --> T[Fetch email content]
    T --> U[Display email]
    subgraph WebhookFlow
        W[Email received] --> X[Verify secret key]
        X --> Y{Secret valid}
        Y -->|Yes| Z[Parse email payload]
        Y -->|No| AD[Discard email]
        Z --> AA[Lookup user by alias]
        AA --> AB{User found}
        AB -->|Yes| AC[Save email to database]
        AB -->|No| AD
        AC --> AE[Upload attachments]
        AE --> AF[Trigger notification event]
    end
    AF --> AG[New email notification]
    AG --> C