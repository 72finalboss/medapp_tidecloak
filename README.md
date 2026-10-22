[![Built with TideCloak](https://tide.org/badges/built-with-tidecloak.svg)](https://tide.org/tidecloak?utm_source=github&utm_medium=readme&utm_campaign=unlocked)

# Next.js Customer Portal — Tide Starter Template

## Project overview

_A minimal, production-architected Next.js App Router customer portal demonstrating zero-trust authentication, DPoP-bound tokens, and server-side RBAC powered by TideCloak._

Built with [TideCloak](https://tide.org/tidecloak?utm_source=github&utm_medium=readme&utm_campaign=unlocked).

### 1. Vision & originality

<!-- What new product, service, experience or way of working are you proposing? What makes your idea distinctive? -->
Modern web applications frequently blur the line between client-side UX convenience and true server-side security, while relying on centralized identity providers that create single points of failure. We are proposing a standardized, zero-trust customer portal starter architecture for the Next.js App Router that ships with decentralized authentication, Identity Governance and Administration (IGA), and cryptographic proof-of-possession (DPoP) right out of the box. What makes this distinctive is its strict architectural separation between UI route gating and real server-side API verification, paired with automated one-command provisioning (`npm run init`) that spins up a fully configured TideCloak realm in seconds.

### 2. Trust constraint insight

<!-- What is difficult, risky or impossible today because trust, privacy or security gets in the way? Explain what becomes possible when that constraint is removed. -->
Today, building a customer portal requires trusting centralized identity databases with sensitive credentials and accepting the risk of bearer token theft, session hijacking, or compromised admin accounts. Furthermore, developers often mistakenly rely on client-side route guards or edge middleware as their primary security layer. By removing the centralized trust constraint through Tide's decentralized cybersecurity fabric (a 14-of-20 threshold network) and enforcing DPoP (Demonstrating Proof-of-Possession) at the API route level, stolen tokens become useless and no single entity ever holds the keys to user identities. This makes it possible for teams to rapidly deploy high-assurance portals where identity compromise and unauthorized privilege escalation are mathematically mitigated.

### 3. Value & impact

<!-- Who would benefit, and how would their lives or work improve? Give a concrete example of why this matters. -->
Full-stack developers, SaaS founders, and enterprise engineering teams building customer-facing B2B/B2C portals benefit immediately from this template. Instead of spending weeks stitching together OIDC providers, configuring Content Security Policies (CSP), and writing custom JWT verification logic, developers can bootstrap a breach-resistant portal in minutes. 

**Concrete Example:** Consider a healthcare or fintech startup launching a portal where support staff and customers access sensitive records. If an attacker compromises a client browser extension and exfiltrates an access token, traditional portals would expose customer data via the `/api/customers` endpoint. With this template's DPoP-enforced architecture and server-side `withRole()` guards, the stolen token is rejected at the API boundary, and sensitive customer records remain completely safe.

### 4. Why TideCloak matters

<!-- How does your application use TideCloak, and how does that integration help enable your idea? Connect the technology to the possibility you are demonstrating. -->
TideCloak is the core identity and access management engine powering this application. Our integration leverages TideCloak across four critical layers:
- **Automated Realm & IGA Provisioning:** Our `scripts/init-tidecloak.sh` script interfaces directly with TideCloak to bootstrap the realm, client, Identity Governance and Administration (IGA), and admin account linkage automatically.
- **Client-Side Auth & Silent SSO:** Uses `@tidecloak/nextjs` (`src/app/providers.tsx` and `public/silent-check-sso.html`) to manage seamless user sessions and DPoP key binding in the browser.
- **Cryptographic API Protection:** Server-side auth helpers (`src/lib/auth/protect.ts`) verify TideCloak-issued JWTs and DPoP proofs on every request to `/api/customers`.
- **Granular RBAC:** Role claims embedded in the verified TideCloak token drive both role-aware UI rendering (`src/app/dashboard/page.tsx`) and strict server-side authorization (`withRole()`).

### 5. Prototype & storytelling

<!-- What does your prototype demonstrate today? Describe the key interaction judges should look for. -->
The prototype demonstrates a complete, end-to-end authentication and authorization lifecycle in a Next.js App Router application. 

**Key interactions judges should look for:**
1. **Zero-Touch Bootstrap (`npm run init`):** Watch the initialization script automatically launch the `tideorg/tidecloak-dev` container, configure the realm and client based on `package.json`, enable IGA, export `data/tidecloak.json`, and generate an admin Tide account invite link.
2. **TideCloak Login & DPoP Binding:** Navigate to `http://localhost:3000` and click **Login**. Authenticate via TideCloak and observe the post-auth redirect handler (`src/app/auth/redirect/page.tsx`) establishing a DPoP-protected session.
3. **Role-Aware Dashboard & Protected APIs:** Visit `/dashboard` (`src/app/dashboard/page.tsx`) to see role-adaptive UI components alongside live data fetched from `/api/customers` (`src/app/api/customers/route.ts`), which actively enforces server-side JWT and role verification.

| Layer | File | Security Value |
|-------|------|---------------|
| UI gating | `src/app/dashboard/layout.tsx` | None. UX convenience only. |
| Route guard | `src/app/dashboard/layout.tsx` | None for APIs. Redirect only. |
| API auth | `src/app/api/customers/route.ts` | **Real.** JWT + DPoP verified server-side. |
| RBAC | `src/lib/auth/protect.ts` (`withRole()`) | **Real.** Role checked on verified JWT. |

---

## Setup

### Prerequisites

- **Node.js 18+**
- **Docker Desktop** (running)
- **curl** and **jq** (required for the automated `npm run init` script)

### Option 1: Automated Quick Start (Recommended)

`npm run init` runs `scripts/init-tidecloak.sh`, which automatically starts the TideCloak Docker container, creates the realm and client from `package.json`, enables IGA, creates an admin user, and exports `data/tidecloak.json`.

```bash
# 1. Clone or unzip the repository and navigate into the project folder
cd "nextjs-customer-portal"

# 2. Install all dependencies
npm install

# 3. Start TideCloak, bootstrap the realm, and export data/tidecloak.json
npm run init

# 4. Open the printed invite link in your browser to link your admin Tide account

# 5. Start the Next.js development server
npm run dev
```

Open `http://localhost:3000` in your browser and click **Login** to authenticate with TideCloak.

*(Optional: You can override the default realm and client names via environment variables: `REALM_NAME=foo CLIENT_NAME=foo-client npm run init`)*

### Option 2: Manual / BYO TideCloak Setup

If you prefer to start the TideCloak container manually (or on Windows without `bash`/`jq`):

```bash
# 1. Navigate into the project directory
cd "nextjs-customer-portal"

# 2. Start the TideCloak development container in Docker
docker run -d -p 8080:8080 -e KC_BOOTSTRAP_ADMIN_USERNAME=admin -e KC_BOOTSTRAP_ADMIN_PASSWORD=password tideorg/tidecloak-dev:latest

# 3. Open http://localhost:8080/, configure your realm/client (or import scripts/realm.json.template),
#    and download the adapter config to data/tidecloak.json

# 4. Install dependencies and start the development server
npm install
npm run dev

# 5. Open http://localhost:3000/ and click Login with TideCloak
```