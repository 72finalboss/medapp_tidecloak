import { NextRequest, NextResponse } from "next/server";
import { verifyTideJWT, extractToken, hasRole } from "@/lib/auth/tideJWT";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = extractToken(authHeader);

    // 1. Verify ES256 signature against embedded VVK JWKS in data/tidecloak.json
    const jwt = await verifyTideJWT(token);

    // 2. Verify DPoP sender-constrained binding (cnf.jkt)
    const cnf = (jwt as any).cnf;
    if (!cnf?.jkt) {
      return NextResponse.json(
        {
          allowed: false,
          error: "DPOP_BINDING_MISSING",
          message: "Token is missing sender-constrained DPoP thumbprint (cnf.jkt).",
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      resourceName = "Protected Clinical Resource",
      requiredRoles = [] as string[],
      requireClientRole,
    } = body;

    // 3. Check Client Role if specified (e.g., tide-realm-admin on realm-management)
    if (requireClientRole?.role && requireClientRole?.clientId) {
      const clientRoles: string[] =
        (jwt.resource_access as any)?.[requireClientRole.clientId]?.roles || [];
      if (!clientRoles.includes(requireClientRole.role)) {
        return NextResponse.json(
          {
            allowed: false,
            error: "TIDE_RBAC_CLIENT_ROLE_FORBIDDEN",
            resourceName,
            required: `${requireClientRole.clientId}:${requireClientRole.role}`,
            callerRoles: (jwt.realm_access as any)?.roles || [],
            message: `Access denied to "${resourceName}": Missing required client role '${requireClientRole.role}' on '${requireClientRole.clientId}'.`,
          },
          { status: 403 }
        );
      }
    }

    // 4. Check Realm / Permission Roles if specified
    if (Array.isArray(requiredRoles) && requiredRoles.length > 0) {
      const matched = requiredRoles.some((r) => hasRole(jwt, r));
      if (!matched) {
        return NextResponse.json(
          {
            allowed: false,
            error: "TIDE_RBAC_FORBIDDEN",
            resourceName,
            requiredRoles,
            callerRoles: (jwt.realm_access as any)?.roles || [],
            message: `Access denied to "${resourceName}": Caller lacks required TideCloak role (${requiredRoles.join(" OR ")}).`,
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      allowed: true,
      resourceName,
      verifiedBy: "Embedded VVK JWKS (kid: nexus-lms-vvk-01, alg: ES256)",
      dpopThumbprint: cnf.jkt,
      subject: jwt.sub,
      principal: jwt.preferred_username,
      realmRoles: (jwt.realm_access as any)?.roles || [],
      clientRoles: jwt.resource_access || {},
      message: `Access GRANTED to "${resourceName}" via TideCloak VVK + DPoP + RBAC verification.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        allowed: false,
        error: "TIDE_JWT_VERIFICATION_FAILED",
        message: err.message || "Invalid or expired TideCloak token.",
      },
      { status: 401 }
    );
  }
}
