"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { useTideCloak } from "../../lib/authContext";
import {
  ShieldCheck,
  Key,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Terminal,
  Layers,
  UserCheck,
  ArrowRight,
  Fingerprint,
  FileKey,
  XCircle,
} from "lucide-react";

const TIDE_MCP_ARCHITECTURE_MAP = [
  {
    module: "1. PRISM Sign-In & Staff Onboarding (/login)",
    mcpPlaybook: "add-auth-nextjs-fresh • initialize-admin-and-link-account",
    tideMechanism: "PRISM Threshold Passwordless/Zero-Hash Auth + IGA Draft User Creation",
    howItFits:
      "Passwords are verified across distributed ORK nodes without storing password hashes. Patient accounts activate immediately, while non-patient roles (Doctor, Pharmacist, Director) require CCHN medical license evidence and enter an IGA pending state awaiting multi-party Quorum verification.",
    href: "/login",
  },
  {
    module: "2. PII Governance & 1-Time SPII Vault (/profile)",
    mcpPlaybook: "setup-forseti-e2ee • configure-e2ee-roles-and-policies",
    tideMechanism: "Forseti E2EE Decryption Policy + 2FA OTP Self-Service Guard",
    howItFits:
      "Username/Password updates require multi-channel 2FA OTP verification. Modifying any PII field queues an IGA change request. Sensitive SPII (National ID, Genetics, Biometrics) is E2EE-locked; once Quorum-approved, the exported JSON file can be downloaded once before the grant self-destructs.",
    href: "/profile",
  },
  {
    module: "3. Emergent Authority Quorum Console (/quorum)",
    mcpPlaybook: "iga-admin-governance • policy-governed-signing",
    tideMechanism: "M-of-N Role-Distinct Threshold Signatures (Non-Collusion)",
    howItFits:
      "Every high-risk action (staff credential verification, PII profile edits, 1-time SPII export, controlled opioid prescriptions) requires 2 distinct role shards (e.g. Doctor + Pharmacist or Director) verified against realm-management:tide-realm-admin.",
    href: "/quorum",
  },
  {
    module: "4. Inpatient EHR & Server API Guard (/patients & /api/*)",
    mcpPlaybook: "protect-api-nextjs • verify-jwt-server-side • add-rbac-nextjs",
    tideMechanism: "Embedded VVK JWKS (ES256) + Sender-Constrained DPoP (cnf.jkt) + RBAC",
    howItFits:
      "Protected API routes (/api/tide/access-check, /api/quorum/validate-shard) verify JWT signatures locally against the embedded Vendor-Verifiable Key (jwk) in data/tidecloak.json, validate cnf.jkt DPoP binding, and enforce realm/client roles.",
    href: "/patients",
  },
];

const RBAC_CAPABILITY_CHECKS = [
  {
    id: "tide_voucher",
    label: "Tide Voucher Enabled (_tide_enabled)",
    checkType: "hasRealmRole('_tide_enabled')",
    role: "_tide_enabled",
    isClient: false,
  },
  {
    id: "iga_admin",
    label: "IGA Quorum Governance (tide-realm-admin)",
    checkType: "hasClientRole('tide-realm-admin', 'realm-management')",
    role: "tide-realm-admin",
    clientId: "realm-management",
    isClient: true,
  },
  {
    id: "ehr_write",
    label: "Modify Inpatient EHR & Vitals (ehr:write)",
    checkType: "hasClientRole('ehr:write', 'nexus-lms-client')",
    role: "ehr:write",
    clientId: "nexus-lms-client",
    isClient: true,
  },
  {
    id: "rx_propose",
    label: "Propose Controlled Prescription (prescription:propose)",
    checkType: "hasClientRole('prescription:propose', 'nexus-lms-client')",
    role: "prescription:propose",
    clientId: "nexus-lms-client",
    isClient: true,
  },
  {
    id: "rx_verify",
    label: "Pharmacist Clinical Verification (prescription:verify)",
    checkType: "hasClientRole('prescription:verify', 'nexus-lms-client')",
    role: "prescription:verify",
    clientId: "nexus-lms-client",
    isClient: true,
  },
  {
    id: "staff_verify",
    label: "Director Staff License Approval (staff:verify-evidence)",
    checkType: "hasClientRole('staff:verify-evidence', 'nexus-lms-client')",
    role: "staff:verify-evidence",
    clientId: "nexus-lms-client",
    isClient: true,
  },
  {
    id: "quorum_sign",
    label: "Sign M-of-N Quorum Shard (quorum:sign)",
    checkType: "hasClientRole('quorum:sign', 'nexus-lms-client')",
    role: "quorum:sign",
    clientId: "nexus-lms-client",
    isClient: true,
  },
  {
    id: "spii_export",
    label: "Request 1-Time SPII Export (spii:request-once)",
    checkType: "hasClientRole('spii:request-once', 'nexus-lms-client')",
    role: "spii:request-once",
    clientId: "nexus-lms-client",
    isClient: true,
  },
];

export default function TideSecurityPage() {
  const {
    currentUser,
    activeRole,
    quickLogin,
    hasRealmRole,
    hasClientRole,
    tokenClaims,
  } = useTideCloak();

  const [tokenData, setTokenData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);

  // Fetch a live ES256 signed JWT from /api/auth/token matching data/tidecloak.json
  const fetchToken = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/token?role=${activeRole || "doctor"}`);
      const data = await res.json();
      setTokenData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToken();
  }, [activeRole]);

  // Run server-side JWT, DPoP, RBAC, and Quorum tests
  const runServerAccessTest = async (
    testType: "ehr_write" | "iga_admin" | "tampered_jwt" | "quorum_collusion"
  ) => {
    setTestLoading(true);
    setTestResult(null);

    try {
      let tokenToSend = tokenData?.token || "";

      if (testType === "tampered_jwt") {
        tokenToSend = tokenToSend.slice(0, -6) + "TAMPER";
      }

      if (testType === "quorum_collusion") {
        const res = await fetch("/api/quorum/validate-shard", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `DPoP ${tokenToSend}`,
          },
          body: JSON.stringify({
            requestId: "req_quorum_test_01",
            existingSignatures: [
              {
                role: activeRole,
                signerName: currentUser?.name || "Current Operator",
                timestamp: new Date().toISOString(),
              },
            ],
            requiredThreshold: 2,
          }),
        });
        const body = await res.json();
        setTestResult({
          endpoint: "POST /api/quorum/validate-shard",
          status: res.status,
          ok: res.ok,
          body,
          testType,
        });
        return;
      }

      const payload =
        testType === "ehr_write"
          ? {
              resourceName: "Inpatient EHR Clinical Write (/patients/[id])",
              requiredRoles: ["doctor", "ehr:write"],
            }
          : {
              resourceName: "IGA Quorum Governance Console (/quorum)",
              requiredRoles: ["doctor", "pharmacist", "director", "ai_auditor"],
              requireClientRole: {
                clientId: "realm-management",
                role: "tide-realm-admin",
              },
            };

      const res = await fetch("/api/tide/access-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `DPoP ${tokenToSend}`,
        },
        body: JSON.stringify(payload),
      });

      const body = await res.json();
      setTestResult({
        endpoint: "POST /api/tide/access-check",
        status: res.status,
        ok: res.ok,
        body,
        testType,
      });
    } catch (err: any) {
      setTestResult({
        endpoint: "/api/tide/access-check",
        status: 500,
        ok: false,
        body: { error: err.message },
        testType,
      });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fade-up">
        {/* Header Banner */}
        <section className="bg-[#E8F5F2]/70 border border-[#087F8C]/25 rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#087F8C]/20 text-[#087F8C] text-xs font-semibold">
              <Key className="w-3.5 h-3.5" />
              <span>Tide MCP Architecture Plan • Simulated Sign-In, Roles & Access Checks</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Trung tâm Kiến trúc TideCloak & Kiểm thử Phân quyền (RBAC / DPoP / VVK)
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Được hoạch định theo <strong>Tide MCP</strong> (<code>iga-admin-governance</code>,{" "}
              <code>add-auth-nextjs-fresh</code>, <code>protect-api-nextjs</code>,{" "}
              <code>add-rbac-nextjs</code>, <code>setup-forseti-e2ee</code>). Kiểm tra trực tiếp phiên đăng nhập giả lập, quyền hạn theo vai trò (<code>hasRealmRole</code> /{" "}
              <code>hasClientRole</code>) và xác thực JWT ES256 phía Server bằng khóa nhúng{" "}
              <code>data/tidecloak.json</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5 shrink-0">
            <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              TideCloak Adapter Status
            </div>
            <div className="font-bold text-[#087F8C] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#087F8C] animate-pulse" />
              <span>data/tidecloak.json (Loaded)</span>
            </div>
            <div className="text-slate-600 text-[11px] font-mono">
              VVK Kid: <strong>nexus-lms-vvk-01 (ES256)</strong>
            </div>
            <div className="text-slate-500 text-[11px]">
              Active Principal: <strong>@{currentUser?.username}</strong> ({activeRole})
            </div>
          </div>
        </section>

        {/* SECTION 1: Where TideCloak Fits (Planned via Tide MCP) */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#087F8C]" />
                <span>1. Quy hoạch Kiến trúc TideCloak trong MediCare (Tide MCP Plan)</span>
              </h2>
              <p className="text-xs text-slate-500">
                Ánh xạ từng phân hệ của ứng dụng với các Scenario & Playbook chuẩn từ Tide MCP Server.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {TIDE_MCP_ARCHITECTURE_MAP.map((item) => (
              <div
                key={item.module}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between gap-4 hover:border-[#087F8C]/40 transition"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[#E8F5F2] text-[#087F8C]">
                      {item.mcpPlaybook}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{item.module}</h3>
                  <div className="text-xs font-semibold text-[#087F8C]">{item.tideMechanism}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.howItFits}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#E8F5F2] hover:bg-[#087F8C] text-[#087F8C] hover:text-white text-xs font-semibold transition whitespace-nowrap"
                  >
                    <span>Mở phân hệ này</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: Interactive Role Switcher & Live Client-Side RBAC Access Checks */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#087F8C]" />
                <span>
                  2. Giả lập Đăng nhập & Kiểm tra Quyền truy cập theo Vai trò (useTideCloak RBAC)
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Chuyển đổi nhanh giữa 5 vai trò để kiểm tra kết quả của{" "}
                <code>hasRealmRole()</code> và <code>hasClientRole()</code> theo chuẩn{" "}
                <code>add-rbac-nextjs</code>.
              </p>
            </div>

            {/* 1-Click Role Switcher Bar */}
            <div className="flex items-center gap-2 flex-wrap">
              {(["doctor", "pharmacist", "director", "patient", "ai_auditor"] as const).map(
                (r) => {
                  const isActive = activeRole === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => quickLogin(r)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                        isActive
                          ? "bg-[#087F8C] text-white shadow-xs"
                          : "bg-[#E8F5F2] text-[#087F8C] hover:bg-[#087F8C] hover:text-white"
                      }`}
                    >
                      Vai trò: {r.toUpperCase()}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Capability Evaluation Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {RBAC_CAPABILITY_CHECKS.map((cap) => {
              const allowed = cap.isClient
                ? hasClientRole(cap.role, cap.clientId)
                : hasRealmRole(cap.role);

              return (
                <div
                  key={cap.id}
                  className={`p-4 rounded-xl border text-xs space-y-2 transition ${
                    allowed
                      ? "bg-[#E8F5F2]/60 border-[#087F8C]/30"
                      : "bg-slate-50 border-slate-200 opacity-75"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        allowed
                          ? "bg-[#087F8C] text-white"
                          : "bg-rose-500/15 text-rose-700 border border-rose-500/30"
                      }`}
                    >
                      {allowed ? (
                        <>
                          <Unlock className="w-3 h-3" /> ALLOWED
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3" /> DENIED (403)
                        </>
                      )}
                    </span>
                  </div>
                  <div className="font-bold text-slate-900">{cap.label}</div>
                  <div className="font-mono text-[10px] text-slate-500 break-all">
                    {cap.checkType}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: 2-Column Live Token Inspector & Server-Side Access Verification */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Synthetic Token & JWKS Inspector */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-[#E8F5F2] text-[#087F8C] rounded-xl">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    3. Token ES256 & Claims Hiện tại (VVK + DPoP)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ký bằng khóa ES256 khớp với <code>data/tidecloak.json</code>
                  </p>
                </div>
              </div>
              <button
                onClick={fetchToken}
                disabled={loading}
                className="p-2 rounded-xl bg-[#E8F5F2] text-[#087F8C] hover:bg-[#087F8C] hover:text-white transition cursor-pointer"
                title="Cấp lại Token mới"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {tokenData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">
                      Signing Algorithm
                    </span>
                    <div className="font-bold text-slate-900">
                      {tokenData.signingAlgorithm} (P-256 VVK)
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">
                      Sender Constraint
                    </span>
                    <div className="font-bold text-[#087F8C]">
                      {tokenData.tokenType} (cnf.jkt Bound)
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>Decoded TideCloak ID/Access Token Claims:</span>
                    <span className="text-[10px] font-mono text-[#087F8C]">
                      kid: nexus-lms-vvk-01
                    </span>
                  </div>
                  <pre className="p-3.5 bg-slate-950 text-teal-300 rounded-xl font-mono text-[11px] overflow-x-auto max-h-52">
                    {JSON.stringify(tokenClaims, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                Đang khởi tạo token ES256...
              </div>
            )}
          </div>

          {/* Right: Live Server-Side Cryptographic Verifier Sandbox */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <div className="p-2.5 bg-[#E8F5F2] text-[#087F8C] rounded-xl">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  4. Kiểm thử Xác thực Server-Side (/api/tide/access-check)
                </h3>
                <p className="text-xs text-slate-500">
                  Thực thi <code>verifyTideJWT()</code> + <code>hasRole()</code> trên Backend
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Theo nguyên tắc cốt lõi của Tide MCP (<em>&ldquo;UI gating is NOT authorization&rdquo;</em>), mọi API bên dưới đều xác thực chữ ký JWT bằng khóa nhúng cục bộ trong{" "}
              <code>data/tidecloak.json</code> và kiểm tra quyền trước khi xử lý:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => runServerAccessTest("ehr_write")}
                disabled={testLoading}
                className="px-3.5 py-2.5 rounded-xl bg-[#087F8C] hover:bg-[#066670] text-white text-xs font-semibold transition cursor-pointer whitespace-nowrap"
              >
                1. Test Quyền Ghi Bệnh Án (ehr:write)
              </button>
              <button
                type="button"
                onClick={() => runServerAccessTest("iga_admin")}
                disabled={testLoading}
                className="px-3.5 py-2.5 rounded-xl bg-[#E8F5F2] hover:bg-[#087F8C] text-[#087F8C] hover:text-white border border-[#087F8C]/30 text-xs font-semibold transition cursor-pointer whitespace-nowrap"
              >
                2. Test Quyền IGA Quorum (tide-realm-admin)
              </button>
              <button
                type="button"
                onClick={() => runServerAccessTest("tampered_jwt")}
                disabled={testLoading}
                className="px-3.5 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-500/30 text-xs font-semibold transition cursor-pointer whitespace-nowrap"
              >
                3. Test Token Bị Giả Mạo Chữ Ký (401)
              </button>
              <button
                type="button"
                onClick={() => runServerAccessTest("quorum_collusion")}
                disabled={testLoading}
                className="px-3.5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-600 text-amber-800 hover:text-white border border-amber-500/30 text-xs font-semibold transition cursor-pointer whitespace-nowrap"
              >
                4. Test Chống Thông Đồng Quorum (400)
              </button>
            </div>

            {testResult && (
              <div
                className={`p-4 rounded-xl border text-xs space-y-2 ${
                  testResult.ok
                    ? "bg-[#E8F5F2] border-[#087F8C]/30 text-slate-900"
                    : "bg-rose-50 border-rose-200 text-rose-900"
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    {testResult.ok ? (
                      <CheckCircle2 className="w-4 h-4 text-[#087F8C]" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600" />
                    )}
                    <span>
                      HTTP {testResult.status} —{" "}
                      {testResult.ok ? "ACCESS GRANTED" : "REJECTED BY TIDE GUARD"}
                    </span>
                  </span>
                  <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                    {testResult.endpoint}
                  </span>
                </div>

                <pre className="font-mono text-[11px] p-3 bg-slate-950 text-slate-100 rounded-xl overflow-x-auto">
                  {JSON.stringify(testResult.body, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
