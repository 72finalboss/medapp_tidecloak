import { NextRequest, NextResponse } from "next/server";
import { mintSyntheticTideToken } from "@/lib/auth/mockTokenMinter";
import { MOCK_USERS } from "@/lib/mockData";
import { UserRole } from "@/lib/types";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const role = (url.searchParams.get("role") || "doctor") as UserRole;
  const user = MOCK_USERS[role] || MOCK_USERS.doctor;

  const token = await mintSyntheticTideToken({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  return NextResponse.json({
    token,
    user,
    tokenType: "DPoP",
    signingAlgorithm: "ES256",
    keyId: "nexus-lms-vvk-01",
    brokerUrl: "http://localhost:8080/realms/nexus-lms",
  });
}
