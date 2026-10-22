[![Built with TideCloak](https://tide.org/badges/built-with-tidecloak.svg)](https://tide.org/tidecloak?utm_source=github&utm_medium=readme&utm_campaign=unlocked)

## Project overview

_MediCare (AegisMed) is a zero-trust hospital and clinical governance platform that replaces unilateral admin privileges with cryptographic multi-party Emergent Authority ($M\text{-of-}N$ Quorum) for medical staff verification, patient PII edits, one-time self-destructing sensitive record (SPII) exports, and high-risk clinical orders._

Built with [TideCloak](https://tide.org/tidecloak?utm_source=github&utm_medium=readme&utm_campaign=unlocked).

### 1. Vision & originality

Hospital software usually forces an uncomfortable choice between everyday usability and strict security. MediCare (AegisMed) bridges that gap by pairing a calm, accessible patient portal—complete with online appointment booking, a searchable specialist directory, an adaptive Dark/Light glassmorphic UI, and 24/7 clinical support Q&A—with a zero-trust governance model where unilateral "super-admin" power simply doesn't exist:

* **No automatic staff activation:** Doctors, Pharmacists, and Hospital Directors cannot just sign up and start working. They must submit verifiable medical license credentials (*Số CCHN*) at registration, keeping their accounts locked until a multi-party Quorum reviews the evidence and signs off.
* **Peer-governed profile edits:** Changing any personal or administrative profile field requires multi-role Quorum approval. Meanwhile, everyday self-service updates like changing a username or password are protected by multi-channel 2FA OTP (Email, SMS, or TideCloak Authenticator).
* **One-time, self-destructing SPII Vault:** Highly sensitive medical and biometric identifiers (SPII) never appear in plaintext on screen. They can only be exported as a single-use `.json` file after an $M\text{-of-}N$ Quorum approves the request—and the decryption grant immediately self-destructs the moment the first download finishes.

### 2. Trust constraint insight

In a traditional hospital IT system, a single compromised admin account, rogue insider, or breached IAM server can spell disaster. Someone with elevated credentials can quietly alter staff privileges, siphon off thousands of national ID and genetic records (SPII), or forge high-risk opioid prescriptions. Because legacy access control relies on centralized trust in database administrators and static, long-lived permissions, hospitals are stuck trading clinical speed for massive insider and breach risk.

When that single point of failure is removed through TideCloak's decentralized threshold cryptography and Identity Governance & Administration (IGA):

* **Authority is earned per action, not held forever:** Power no longer sits in a single admin account or server waiting to be hijacked. Instead, authority emerges dynamically only when distinct clinical roles (Doctor + Pharmacist + Director) cryptographically co-sign a specific request.
* **Mathematical certainty over blind trust:** Even the identity provider itself cannot forge tokens or read passwords. Patients and clinicians can collaborate on sensitive health data knowing that no single party—insider or outsider—can abuse their access alone.

### 3. Value & impact

* **Patients** get real ownership and transparency over their most sensitive health records (PII & SPII). Neither hospital IT staff nor external attackers can quietly view or export genetic, biometric, or insurance data without leaving an auditable multi-party Quorum trail—and any approved SPII export automatically expires after a single download.
* **Doctors & Pharmacists** are protected from credential spoofing and solo prescription errors through mandatory $2\text{-of-}3$ role-distinct verification on controlled medications (such as IV Morphine/Opioids) and inpatient discharge summaries.
* **Concrete Example:** When a patient or clinician requests a Sensitive PII (SPII) export on `/profile`, the vault stays locked (`PENDING_QUORUM`). Only after a Doctor (`@truongnguyenxuanvinh`) and a Pharmacist (`@pharm.thao`) independently review and sign the request in `/quorum` does the status switch to `APPROVED_READY_ONCE`. The exact moment the user clicks **Download SPII (.json)**, the grant transitions to `DOWNLOADED_EXPIRED`, preventing replay attacks or secondary leaks.

### 4. Why TideCloak matters

MediCare doesn't just bolt security onto the UI; its core guarantees are wired directly into TideCloak's cryptographic primitives (planned and verified via Tide's MCP):

* **PRISM Threshold Authentication (`/login`):** Eliminates stored password hashes by splitting password verification across Tide's decentralized Cybersecurity Fabric (ORK nodes).
* **IGA Change-Request & Quorum Governance (`/quorum`):** Built on Tide's `iga-admin-governance` and `policy-governed-signing` patterns, enforcing role-distinct `realm-management:tide-realm-admin` and `quorum:sign` claims so no single role can approve their own requests (`QUORUM_COLLUSION_REJECTED`).
* **Non-Rotating Vendor-Verifiable Key (VVK) & Local JWKS (`data/tidecloak.json`):** Protected backend APIs (`/api/tide/access-check` and `/api/quorum/validate-shard`) verify `ES256` JWT signatures locally against the embedded `jwk` in `data/tidecloak.json` with zero remote network calls.
* **Sender-Constrained DPoP Proofs (`cnf.jkt`):** Binds every access token to the caller's cryptographic key thumbprint, making stolen tokens useless if someone tries to replay them.

### 5. Prototype & storytelling

Our live prototype (`http://localhost:3000`) and embedded Full HD showcase video (`public/medicare_full_showcase_subtitled.mp4`) walk through the complete hospital and security lifecycle. Key interactions judges should look for:

* **Modern Hospital Experience & Adaptive Theme (`/` & `/support`):** Toggle between Light and Dark Mode in the Navbar, filter verified specialists by department (`#doctors`), book an appointment online (`#appointment`), and submit or reply to patient symptom reports on `/support`.
* **Non-Patient Staff Sign-Up with Mandatory Evidence (`/login`):** Switch to **Sign up**, select a clinical role (*Bác sĩ điều trị*), inspect the mandatory Medical License Evidence (*Số CCHN*) fields, and submit—watching the account enter a *Pending Multi-Party Quorum Verification* lock.
* **2FA OTP Credential Change & PII Quorum Governance (`/profile`):** Request an SMS, Email, or App 6-digit OTP in the simulated inbox to update a password on the spot, then edit a personal PII field to trigger a multi-party Quorum change request.
* **Role-Distinct $M\text{-of-}N$ Quorum Signing & 1-Time SPII Self-Destruct (`/profile` $\rightarrow$ `/quorum` $\rightarrow$ `/profile`):** Request an SPII unlock on `/profile`, head to `/quorum` to sign Shard 1 as a Doctor, use the top-right Navbar Role Switcher to switch to Pharmacist and sign Shard 2 (`2/2 COMMITTED`), then return to `/profile` and click **Download SPII (.json) — Once Only** to watch the decryption grant immediately self-destruct (`DOWNLOADED_EXPIRED`).
* **Live TideCloak RBAC & Cryptographic Verifier (`/tide-security`):** Switch between `DOCTOR`, `PHARMACIST`, `DIRECTOR`, `PATIENT`, and `AI_AUDITOR` to test `hasRealmRole()`, `hasClientRole()`, tampered JWT rejection (`401`), and role-collusion rejection (`400`) live against the backend.

## Setup

```bash
# 1. Clone or unzip the repository and navigate into the project folder
cd "medicare-aegismed"

# 2. Start the local TideCloak instance via Docker Desktop
docker run -d -p 8080:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin \
  -e KC_BOOTSTRAP_ADMIN_PASSWORD=password \
  tideorg/tidecloak-dev:latest

# 3. Configure TideCloak (Optional if using the pre-configured local adapter)
# Open http://localhost:8080/, create a new realm/client, set redirect URIs to http://localhost:3000/*,
# and export the adapter config to data/tidecloak.json

# 4. Install dependencies and start the development server
npm install
npm run dev

# 5. Open http://localhost:3000/ in your browser
# Click "Login" (/login) or explore the Quorum & Tide Security verifiers (/quorum, /tide-security)
```