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

export async function mintSyntheticTideToken(user: {
  id: string;
  name: string;
  email: string;
  role: string;
}) {
  const privateKey = await importJWK(SYNTHETIC_PRIVATE_KEY, "ES256");

  const now = Math.floor(Date.now() / 1000);

  const token = await new SignJWT({
    azp: "nexus-lms-client",
    preferred_username: user.name,
    email: user.email,
    realm_access: {
      roles: [user.role, "default-roles-nexus-lms", "offline_access", "uma_authorization"],
    },
    resource_access: {
      "nexus-lms-client": {
        roles: [user.role],
      },
    },
    // Sender-constrained DPoP thumbprint
    cnf: {
      jkt: "synth_dpop_thumbprint_p256_mock",
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
