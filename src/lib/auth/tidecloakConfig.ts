import { existsSync, readFileSync } from "fs";
import { join } from "path";

// Playbook: protect-api-nextjs Step 1
export interface TidecloakConfig {
  realm: string;
  "auth-server-url": string;
  "ssl-required": string;
  resource: string;
  "public-client": boolean;
  "confidential-port": number;
  jwk: { keys: any[] }; // Tide extension: embedded JWKS (Vendor-Verifiable Key)
  vendorId?: string;
  homeOrkUrl?: string;
}

const FALLBACK_SIMULATED_TIDE_CONFIG: TidecloakConfig = {
  realm: "nexus-lms",
  "auth-server-url": "http://localhost:8080",
  "ssl-required": "external",
  resource: "nexus-lms-client",
  "public-client": true,
  "confidential-port": 0,
  vendorId: "aegismed-clinical-vvk-vendor",
  homeOrkUrl: "https://ork-01.tideprotocol.org",
  jwk: {
    keys: [
      {
        kty: "EC",
        crv: "P-256",
        x: "VnU-JY69eEzXKc4iaIdqcZXdi6hia8tN3MmLWYA6JnY",
        y: "3HK1kf0YGj4Fy70i4isXjlz41-tuKwcE8iF-JS3C7Pk",
        kid: "nexus-lms-vvk-01",
        alg: "ES256",
        use: "sig",
      },
    ],
  },
};

export function loadTideConfig(): TidecloakConfig {
  if (process.env.CLIENT_ADAPTER) {
    return JSON.parse(process.env.CLIENT_ADAPTER);
  }

  const configPath = join(process.cwd(), "data", "tidecloak.json");
  if (!existsSync(configPath)) {
    return FALLBACK_SIMULATED_TIDE_CONFIG;
  }

  const config = JSON.parse(readFileSync(configPath, "utf-8"));

  if (!config.jwk) {
    throw new Error(
      "Adapter JSON missing jwk field. " +
        "Export via Tide endpoint (providerId=keycloak-oidc-keycloak-json). " +
        "The jwk field is only present when IGA is enabled on the realm."
    );
  }

  return config;
}
