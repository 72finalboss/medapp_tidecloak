# 🏥 MediCare (AegisMed)

> **Zero-Trust Hospital & Clinical Governance Platform Powered by TideCloak**

[![Built with TideCloak](https://img.shields.io/badge/Security-TideCloak%20PRISM%20%26%20IGA-0066cc?style=flat-square)](#4-why-tidecloak-matters)
[![Auth](https://img.shields.io/badge/Auth-M--of--N%20Emergent%20Authority-success?style=flat-square)](#1-vision--originality)
[![Tokens](https://img.shields.io/badge/JWT-ES256%20%2B%20DPoP-orange?style=flat-square)](#4-why-tidecloak-matters)

**MediCare (AegisMed)** is a modern hospital and clinical governance platform built on a simple premise: **no single person should ever hold the keys to the kingdom.** 

Powered by **TideCloak**, the platform replaces traditional unilateral admin privileges with multi-party **Emergent Authority ($M\text{-of-}N$ Quorum)**. Whether verifying a new doctor's medical license, editing personal patient data (PII), exporting self-destructing sensitive records (SPII), or signing off on high-risk clinical orders, every high-stakes action requires cryptographic consensus.

---

## 📋 Table of Contents

1. [Vision & Originality](#1-vision--originality)
2. [Rethinking the Trust Bottleneck](#2-rethinking-the-trust-bottleneck)
3. [Real-World Value & Impact](#3-real-world-value--impact)
4. [Why TideCloak Matters](#4-why-tidecloak-matters)
5. [Prototype Walkthrough: What to Look For](#5-prototype-walkthrough-what-to-look-for)
6. [Quick Start & Key Routes](#6-quick-start--key-routes)

---

## 1. Vision & Originality

Hospital software usually forces a choice between everyday usability and lockdown security. MediCare (AegisMed) bridges that gap. On the surface, it is a calm, accessible patient portal featuring online appointment booking, a searchable specialist directory, a clean Dark/Light glassmorphic interface, and 24/7 clinical support Q&A. Underneath, it runs on a zero-trust governance model where "super-admin" power simply doesn't exist:

* **🔒 No Automatic Staff Activation:** Doctors, Pharmacists, and Hospital Directors cannot just sign up and start working. They must upload verifiable medical license credentials (*Số CCHN*) during registration. Their accounts stay locked until a multi-party Quorum reviews the evidence and signs off.
* **🛡️ Peer-Governed Profile Edits:** Changing personal or administrative profile details requires multi-role Quorum approval. Meanwhile, everyday self-service updates—like changing a username or password—are guarded by multi-channel 2FA OTP via Email, SMS, or the TideCloak Authenticator.
* **💥 One-Time, Self-Destructing SPII Vault:** The most sensitive medical and biometric identifiers (SPII) never appear in plain text on a screen. To access them, a user must request an $M\text{-of-}N$ Quorum approval. Once granted, the data exports as a single-use `.json` file, and the decryption grant immediately self-destructs the moment the download finishes.

---

## 2. Rethinking the Trust Bottleneck

In a standard hospital IT setup, a single compromised admin account, a rogue insider, or a breached identity server can spell disaster. Someone with the right credentials can quietly alter staff privileges, siphon off thousands of national ID and genetic records, or forge high-risk opioid prescriptions. Because legacy access control relies on centralized trust and static permissions, hospitals are stuck trading clinical speed for massive security liability.

By stripping away that single point of failure using TideCloak's decentralized threshold cryptography and Identity Governance & Administration (IGA), the dynamic changes completely:

* **Authority is earned per action, not granted forever:** Power isn't sitting in a single admin account waiting to be hijacked. Instead, it emerges on the fly only when distinct clinical roles—a **Doctor**, a **Pharmacist**, and a **Director**—cryptographically co-sign a specific request.
* **Zero trust, even in the identity provider:** Even the underlying identity server cannot forge tokens or read passwords. Patients and clinicians can work with sensitive health records knowing it is mathematically impossible for any one person or server to abuse the system alone.

---

## 3. Real-World Value & Impact

* **For Patients:** You get real ownership and visibility over your health data. Neither hospital IT staff nor outside attackers can quietly peek at or export your genetic, biometric, or insurance records without leaving a multi-party Quorum paper trail. Even when an export is legitimately approved, the authorization dies after a single download.
* **For Doctors & Pharmacists:** Clinicians are shielded from credential spoofing and solo prescription mistakes. High-risk actions—like ordering IV Morphine/Opioids or finalizing inpatient discharge summaries—require mandatory $2\text{-of-}3$ role-distinct verification.

### 💡 Concrete Workflow Example: Ephemeral SPII Export

```text
[ /profile ] Request SPII Export 
     │
     ▼
Status: PENDING_QUORUM (Vault Locked)
     │
     ├──► Sign Shard 1: Doctor (@truongnguyenxuanvinh) in [ /quorum ]
     └──► Sign Shard 2: Pharmacist (@pharm.thao) in [ /quorum ]
     │
     ▼
Status: APPROVED_READY_ONCE (2/2 Committed)
     │
     ▼
[ /profile ] Click "Download SPII (.json) — Once Only"
     │
     ▼
Status: DOWNLOADED_EXPIRED (Grant Immediately Self-Destructs)
```

---

## 4. Why TideCloak Matters

MediCare doesn't just bolt security onto the UI; its core guarantees are wired directly into TideCloak's cryptographic primitives (designed and verified using Tide's MCP):

| Primitive | Route / File | Security Guarantee |
| :--- | :--- | :--- |
| **PRISM Threshold Auth** | `/login` | Eliminates stored password hashes by splitting password verification across Tide's decentralized Cybersecurity Fabric (ORK nodes). |
| **IGA & Quorum Governance** | `/quorum` | Built on `iga-admin-governance` and `policy-governed-signing`. Enforces role-distinct `realm-management:tide-realm-admin` and `quorum:sign` claims to block self-approval (`QUORUM_COLLUSION_REJECTED`). |
| **Non-Rotating VVK & Local JWKS** | `data/tidecloak.json`<br>`/api/tide/access-check`<br>`/api/quorum/validate-shard` | Protected backend routes verify `ES256` JWT signatures locally against the embedded `jwk` in `data/tidecloak.json` with zero remote network calls. |
| **Sender-Constrained DPoP** | `cnf.jkt` | Locks every access token to the caller's cryptographic key thumbprint, rendering stolen tokens useless if replayed elsewhere. |

---

## 5. Prototype Walkthrough: What to Look For

Our live prototype (`http://localhost:3000`) and Full HD walkthrough video (`public/medicare_full_showcase_subtitled.mp4`) show the entire hospital workflow and security lifecycle in action. Here are the key flows judges can test firsthand:

1. **The Patient Experience & Adaptive UI (`/` & `/support`):**
   * Flip between **Light and Dark Mode** in the top navigation bar.
   * Filter verified specialists by department (`#doctors`), book an appointment (`#appointment`), and post or reply to patient symptom inquiries on `/support`.
2. **Staff Sign-Up with License Verification (`/login`):**
   * Switch to **Sign up** and choose a non-patient clinical role like *Bác sĩ điều trị* (Attending Physician).
   * Inspect the mandatory fields for **Medical License Evidence (*Số CCHN*)** and submit the form to watch the account enter a *Pending Multi-Party Quorum Verification* lock.
3. **2FA Password Updates & Peer-Reviewed Profile Edits (`/profile`):**
   * Trigger a 6-digit OTP via SMS, Email, or Authenticator in the simulated inbox to update a password on the spot.
   * Edit a personal PII field to see how it immediately spins up a multi-party Quorum change request instead of saving directly.
4. **Role-Distinct Quorum Signing & Self-Destructing Downloads (`/profile` → `/quorum` → `/profile`):**
   * Request an SPII unlock on `/profile`, then head over to `/quorum` to sign **Shard 1** as a **Doctor**.
   * Use the **Role Switcher** in the top-right navbar to swap to the **Pharmacist** view and sign **Shard 2** (`2/2 COMMITTED`).
   * Return to `/profile` and click **Download SPII (.json) — Once Only** to watch the decryption grant immediately self-destruct (`DOWNLOADED_EXPIRED`).
5. **Live RBAC & Cryptography Tester (`/tide-security`):**
   * Jump between `DOCTOR`, `PHARMACIST`, `DIRECTOR`, `PATIENT`, and `AI_AUDITOR` roles to stress-test `hasRealmRole()`, `hasClientRole()`, tampered JWT rejections (`401`), and role-collusion blocks (`400`) live against the backend.

---

## 6. Quick Start & Key Routes

### Running Locally

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to explore the platform.

### Key Application Endpoints

* `/` — Patient Portal, Specialist Directory (`#doctors`), and Online Booking (`#appointment`)
* `/support` — 24/7 Clinical Support & Patient Symptom Q&A
* `/login` — PRISM Authentication & Medical License Evidence Registration
* `/profile` — 2FA OTP Self-Service, PII Edit Requests, & Ephemeral 1-Time SPII Vault
* `/quorum` — Multi-Party $M\text{-of-}N$ Role-Distinct Quorum Signing Console
* `/tide-security` — Interactive TideCloak RBAC, Local JWKS, DPoP & Collusion Verifier
* `public/medicare_full_showcase_subtitled.mp4` — Full HD Subtitled Showcase Video