[![Built with TideCloak](https://tide.org/badges/built-with-tidecloak.svg)](https://tide.org/tidecloak?utm_source=github&utm_medium=readme&utm_campaign=unlocked)

## Project overview

**MediCare (AegisMed)** is a modern hospital and clinical governance platform that enforces multi-party **Emergent Authority ($M$-of-$N$ Quorum)** for staff credential verification, personal medical data (PII) edits, single-use self-destructing Sensitive PII (SPII) exports, and high-risk clinical orders.

Built with [TideCloak](https://tide.org/tidecloak?utm_source=github&utm_medium=readme&utm_campaign=unlocked).

### 1. Vision & originality

**MediCare (AegisMed)** reimagines hospital digital infrastructure by replacing unilateral "super-admin" privileges with **cryptographic Emergent Authority**. Alongside a calm, patient-centered healthcare portal (online appointment booking, specialist directory, Dark/Light glassmorphic UI, and 24/7 clinical support Q&A), the platform introduces a zero-trust clinical governance model where:
- **No non-patient account can self-activate:** Doctors, Pharmacists, and Hospital Directors must submit verifiable medical license credentials (`Số CCHN`) at sign-up and remain locked until a multi-party Quorum verifies their evidence.
- **Every PII modification is peer-governed:** Editing any personal or administrative profile field requires multi-role Quorum approval, while self-service Username/Password updates are protected by multi-channel 2FA OTP (`Email`, `SMS`, or `TideCloak Authenticator`).
- **Ephemeral 1-Time SPII Vault:** Highly sensitive medical and biometric identifiers (`SPII`) are never displayed in plaintext on screen; they can only be exported as a single-use `.json` file after $M$-of-$N$ Quorum approval, and the decryption grant **immediately self-destructs after one download**.

### 2. Trust constraint insight

In traditional hospital IT systems, a single compromised administrator, rogue insider, or breached IAM server can silently alter medical staff credentials, exfiltrate thousands of patients' genetic/national ID records (`SPII`), or forge high-risk opioid prescriptions. Because traditional access control relies on centralized trust in database administrators and long-lived static permissions, hospitals face an impossible trade-off between **clinical agility** and **catastrophic insider/breach risk**.

When that single-point-of-trust constraint is removed through **TideCloak's decentralized threshold cryptography and Identity Governance & Administration (IGA)**:
- Authority is no longer held by any single person or server—it **emerges dynamically** only when distinct clinical roles (`Doctor` + `Pharmacist` + `Director`) cryptographically co-sign a specific request.
- Even the identity provider itself cannot forge tokens or read passwords, enabling patients and clinicians to collaborate on sensitive health data with mathematical certainty that no single party can abuse their access.

### 3. Value & impact

- **Patients** gain complete sovereignty and transparency over their most sensitive health records (`PII` & `SPII`), knowing that neither hospital IT staff nor external attackers can silently view or export their genetic, biometric, or insurance records without an auditable multi-party Quorum trail—and that any approved SPII export automatically expires after a single download.
- **Doctors & Pharmacists** are protected from credential spoofing and unilateral prescription errors through mandatory `2-of-3` role-distinct verification on controlled medications (such as IV Morphine/Opioids) and inpatient discharge summaries.
- **Concrete Example:** When a patient or clinician requests a Sensitive PII (`SPII`) export on `/profile`, the vault remains locked (`PENDING_QUORUM`). Only after a **Doctor** (`@truongnguyenxuanvinh`) and a **Pharmacist** (`@pharm.thao`) independently sign the request in `/quorum` does the status transition to `APPROVED_READY_ONCE`. The moment the user clicks **Download SPII (.json)** once, the grant immediately transitions to `DOWNLOADED_EXPIRED`, preventing replay or secondary leakage.

### 4. Why TideCloak matters

MediCare's security guarantees are architected directly around **TideCloak's core cryptographic primitives** (planned and verified via **Tide's MCP**):
- **PRISM Threshold Authentication (`/login`):** Eliminates stored password hashes by distributing password verification across Tide's Cybersecurity Fabric (ORK nodes).
- **IGA Change-Request & Quorum Governance (`/quorum`):** Mapped to Tide's `iga-admin-governance` and `policy-governed-signing` patterns, requiring role-distinct `realm-management:tide-realm-admin` and `quorum:sign` claims so no single role can self-approve (`QUORUM_COLLUSION_REJECTED`).
- **Non-Rotating Vendor-Verifiable Key (`VVK`) & Local JWKS (`data/tidecloak.json`):** Protected backend APIs (`/api/tide/access-check` and `/api/quorum/validate-shard`) verify `ES256` JWT signatures locally against the embedded `jwk` in `data/tidecloak.json` without remote network calls.
- **Sender-Constrained DPoP Proofs (`cnf.jkt`):** Binds every access token to the caller's cryptographic key thumbprint so stolen tokens cannot be replayed.

### 5. Prototype & storytelling

Our live prototype (`http://localhost:3000`) and embedded Full HD showcase video (`public/medicare_full_showcase_subtitled.mp4`) demonstrate the complete hospital and security lifecycle. **Key interactions judges should look for:**
1. **Modern Hospital Experience & Adaptive Theme (`/` & `/support`):** Toggle between **Light & Dark Mode** in the Navbar, filter verified specialists by department (`#doctors`), book an appointment online (`#appointment`), and submit/reply to patient symptom reports on `/support`.
2. **Non-Patient Staff Sign-Up with Mandatory Evidence (`/login`):** Switch to **Sign up**, select a non-patient role (`Bác sĩ điều trị`), inspect the mandatory **Medical License Evidence (`Số CCHN`)** fields, and submit—watching the account enter a **Pending Multi-Party Quorum Verification** lock.
3. **2FA OTP Credential Change & PII Quorum Governance (`/profile`):** Request an SMS/Email/App **6-digit OTP** in the simulated inbox to update a password immediately, then edit a personal PII field to trigger a multi-party Quorum change request.
4. **Role-Distinct M-of-N Quorum Signing & 1-Time SPII Self-Destruct (`/profile` → `/quorum` → `/profile`):** Request an SPII unlock on `/profile`, navigate to `/quorum` to sign Shard 1 as **Doctor**, use the top-right Navbar Role Switcher to switch to **Pharmacist** and sign Shard 2 (`2/2 COMMITTED`), then return to `/profile` and click **Download SPII (.json) — Once Only** to watch the decryption grant immediately self-destruct (`DOWNLOADED_EXPIRED`).
5. **Live TideCloak RBAC & Cryptographic Verifier (`/tide-security`):** Switch between `DOCTOR`, `PHARMACIST`, `DIRECTOR`, `PATIENT`, and `AI_AUDITOR` to test `hasRealmRole()`, `hasClientRole()`, tampered JWT rejection (`401`), and role collusion rejection (`400`) against the backend.

## Setup

```bash
# Download the source code from GitHub (or unzip into a folder called medapp_tidecloak)
git clone https://github.com/72finalboss/medapp_tidecloak.git
cd "medapp_tidecloak"

# (Optional — Live TideCloak Container) Open Docker Desktop and start TideCloak Dev:
docker run -d -p 8080:8080 -e KC_BOOTSTRAP_ADMIN_USERNAME=admin -e KC_BOOTSTRAP_ADMIN_PASSWORD=password tideorg/tidecloak-dev:latest
# Open http://localhost:8080/, create or import realm, and export Tide OIDC JSON to data/tidecloak.json
# Note: Pre-configured synthetic VVK adapter keys are already included in data/tidecloak.json for immediate testing!

# Install all dependencies
npm.cmd install

# Start the Next.js development server
npm.cmd run dev

# Open http://localhost:3000/ in your browser
# Click "TideCloak" or "/login" to test TideCloak Sign-In, Role Switching, and M-of-N Quorum Governance
```
