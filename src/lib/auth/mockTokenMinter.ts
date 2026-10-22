import { SignJWT, importJWK } from "jose";

const SYNTHETIC_PRIVATE_KEY = {
  kty: "EC",
  x: "VnU-JY69eEzXKc4iaIdqcZXdi6hia8tN3MmLWYA6JnY",
  y: "3HK1kf0YGj4Fy70i4isXjlz41-tuKwcE8iF-JS3C7Pk",
  crv: "P-256",
  d: "P2Qr9pldXHtjm2i_kW4L14HfUtFAsSQ0ZdE4b_REO50",
  kid: "nexus-lms-vvk-01",
  alg: "ES256",
};

export const ROLE_PERMISSION_SCOPES: Record<string, string[]> = {
  doctor: [
    "ehr:read",
    "ehr:write",
    "prescription:propose",
    "quorum:sign",
    "support:reply",
    "pii:propose",
    "spii:request-once",
  ],
  pharmacist: [
    "ehr:read",
    "prescription:verify",
    "quorum:sign",
    "support:reply",
    "pii:propose",
    "spii:request-once",
  ],
  director: [
    "ehr:read",
    "staff:verify-evidence",
    "quorum:sign",
    "policy:manage",
    "pii:propose",
    "spii:request-once",
  ],
  patient: [
    "appointment:book",
    "support:ask",
    "profile:read-own",
    "pii:propose",
    "spii:request-once",
  ],
  ai_auditor: [
    "ehr:read",
    "prescription:safety-audit",
    "quorum:sign",
  ],
};

export async function mintSyntheticTideToken(user: {
  id: string;
  name: string;
  email: string;
  role: string;
}) {
  const privateKey = await importJWK(SYNTHETIC_PRIVATE_KEY, "ES256");

  const now = Math.floor(Date.now() / 1000);
  const isGovernanceMember = ["doctor", "pharmacist", "director", "ai_auditor"].includes(user.role);

  const token = await new SignJWT({
    azp: "nexus-lms-client",
    preferred_username: user.name,
    email: user.email,
    vuid: `vuid_tide_${user.id}`,
    tideUserKey: `ed25519_pub_${user.role}_${user.id.slice(0, 8)}`,
    realm_access: {
      roles: [
        user.role,
        "_tide_enabled",
        "default-roles-nexus-lms",
        "offline_access",
      ],
    },
    resource_access: {
      "nexus-lms-client": {
        roles: [user.role, ...(ROLE_PERMISSION_SCOPES[user.role] || [])],
      },
      ...(isGovernanceMember
        ? {
            "realm-management": {
              roles: ["tide-realm-admin"],
            },
          }
        : {}),
    },
    // Sender-constrained DPoP thumbprint (RFC 9449)
    cnf: {
      jkt: `dpop_p256_jkt_${user.role}_${user.id.slice(0, 6)}`,
    },
  })
    .setProtectedHeader({ alg: "ES256", kid: "nexus-lms-vvk-01", typ: "JWT" })
    .setIssuer("http://localhost:8080/realms/nexus-lms")
    .setAudience("account")
    .setSubject(user.id)
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .setNotBefore(now)
    .sign(privateKey);

  return token;
}
