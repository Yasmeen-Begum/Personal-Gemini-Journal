# Enterprise Security Constitution & AI Studio Directives

## 1. Threat Modeling & Trust Boundaries
- **Zero-Trust Architecture**: Treat all client-side inputs and tokens as untrusted. Enforce strict server-side validation and schema boundary checks.
- **Threat Vector Mitigation**: Protect against OWASP Top 10, Prompt Injection, Insecure Direct Object References (IDOR), Denial of Wallet (DoS/DoW) resource exhaustion attacks, and Cross-Tenant Data Contamination.
- **Identity & Authorization**: Every resource mutation or read must be cryptographically bounded to the authenticated subject `request.auth.uid`. No custom client claims or unsecured wildcard queries.

## 2. Secure Coding Standards
- **Server-Side API Proxying**: All sensitive AI models (Gemini API), third-party services, and administrative tasks must be executed exclusively in server-side routes (`/api/*`).
- **Input Sanitization & Output Encoding**: Sanitize all incoming user payloads against strict regex and length limits before database persistence or AI ingestion.
- **Fail-Safe & Defensive Defaults**: Default-deny all database reads and writes. Explicitly allowlist only verified operations.
- **Error Obfuscation**: Never expose internal database schemas, stack traces, or secret key fragments in user-facing error messages. Catch errors and structure them with secure diagnostic identifiers.

## 3. Database Isolation Rules (Zero Cross-User Leakage)
- **Hierarchical Path Isolation**: Store user-authored documents in authenticated subcollections (e.g. `/users/{userId}/entries/{entryId}`).
- **Strict Attribute-Based Access Control (ABAC)**: Firestore security rules MUST enforce `request.auth.uid == userId` and validate document ownership on every single `get`, `create`, `update`, `delete`, and `list` operation.
- **No Blanket Collection Reads**: Prohibit unscoped collection group queries or unconstrained list operations (`allow list: if isSignedIn()` is forbidden without strict ownership predicates).
- **Immutable Audit Fields**: Protect immutable system metadata (`createdAt`, `ownerId`) against state tampering during updates.

## 4. Secret Management & Cloud Security
- **Cloud Secret Separation**: API keys and master tokens must be sourced from runtime environment secrets (Google Cloud Secret Manager / `.env.example`), never committed or bundled in client-side code.
- **Zero-Leakage Guarantee**: Client bundles must never contain `GEMINI_API_KEY`, service account credentials, or administrative tokens.
- **Client-Side Zero-Knowledge Capabilities**: For high-assurance privacy, provide client-side AES-GCM encryption layers for sensitive journal entries where only the authenticated user holds decryption keys.
