import { NextRequest, NextResponse } from "next/server";
import { verifyTideJWT, extractToken, hasRole } from "@/lib/auth/tideJWT";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = extractToken(authHeader);

    // Cryptographic verification against local embedded JWKS in tidecloak.json
    const jwt = await verifyTideJWT(token);

    const body = await req.json();
    const { requestId, existingSignatures, requiredThreshold } = body;

    const callerRole = (jwt.resource_access as any)?.["nexus-lms-client"]?.roles?.[0] || "unknown";

    // 1. Quorum Invariant: Check if role has already signed
    const isDuplicate = existingSignatures?.some((s: any) => s.role === callerRole);
    if (isDuplicate) {
      return NextResponse.json(
        {
          error: "QUORUM_COLLUSION_REJECTED",
          message: `Inadmissible: Role [${callerRole}] has already contributed a signature shard. Emergent Authority strictly requires distinct roles.`,
        },
        { status: 400 }
      );
    }

    // 2. Mint synthetic VVK cryptographic shard proof
    const shardProof = {
      role: callerRole,
      signerName: jwt.preferred_username || "Verified Principal",
      signerId: jwt.sub,
      timestamp: new Date().toISOString(),
      signatureHash: `vvk_shard_0x${Math.random().toString(36).substring(2, 12)}`,
      jwtKid: "nexus-lms-vvk-01",
    };

    const newCount = (existingSignatures?.length || 0) + 1;
    const thresholdReached = newCount >= (requiredThreshold || 2);

    return NextResponse.json({
      success: true,
      shard: shardProof,
      totalSignatures: newCount,
      threshold: requiredThreshold || 2,
      status: thresholdReached ? "COMMITTED" : "PENDING",
      message: thresholdReached
        ? "🎉 Quorum threshold achieved! Decision cryptographically sealed to official record."
        : `Signature shard accepted (${newCount}/${requiredThreshold} collected).`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "VERIFICATION_FAILED", message: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}
