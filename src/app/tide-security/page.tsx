"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "../../components/Navbar";
import { useAuth } from "../../lib/authContext";
import {
  ShieldCheck,
  Key,
  Lock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Layers,
  Terminal,
  FileCode,
} from "lucide-react";

export default function TideSecurityPage() {
  const { currentUser, activeRole } = useAuth();

  const [tokenData, setTokenData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);

  // Fetch a live synthetic token for the current role
  const fetchToken = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/token?role=${activeRole}`);
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

  // Test live server verification
  const runVerificationTest = async (testType: "valid" | "tampered" | "collusion") => {
    setTestLoading(true);
    setTestResult(null);

    try {
      let tokenToSend = tokenData?.token;
      let existingSignatures: any[] = [];

      if (testType === "tampered") {
        // Invalidate token signature
        tokenToSend = tokenToSend.slice(0, -6) + "TAMPER";
      } else if (testType === "collusion") {
        // Pretend this role has already signed
        existingSignatures = [
          {
            role: activeRole,
            signerName: currentUser?.name || "BS. Nguyễn Văn Hùng",
            timestamp: new Date().toISOString(),
          },
        ];
      }

      const res = await fetch("/api/quorum/validate-shard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `DPoP ${tokenToSend}`,
        },
        body: JSON.stringify({
          requestId: "req_test_001",
          existingSignatures,
          requiredThreshold: 2,
        }),
      });

      const body = await res.json();
      setTestResult({
        status: res.status,
        ok: res.ok,
        body,
        testType,
      });
    } catch (err: any) {
      setTestResult({
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold">
              <Key className="w-3.5 h-3.5 text-blue-400" />
              <span>Synthetic TideCloak Cryptographic Testbed</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              TideCloak Architecture & Rule Verification
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Verify how PRISM threshold authentication, sender-constrained DPoP proofs, and server-side VVK JWT verification enforce the academic governance rules.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs space-y-2 text-right">
            <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              Realm Status
            </div>
            <div className="font-bold text-emerald-400 flex items-center justify-end space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Adapter Loaded: nexus-lms</span>
            </div>
            <div className="text-indigo-200 text-[11px]">
              JWKS Mode: <strong>Embedded Local ES256</strong>
            </div>
          </div>
        </section>

        {/* 2-Column Grid: Token Inspector & Rules */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Synthetic Token & JWKS Inspector */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Synthetic VVK Token (Current Operator)</h3>
                  <p className="text-xs text-slate-500">Mints real ES256 tokens matching the embedded JWKS</p>
                </div>
              </div>
              <button
                onClick={fetchToken}
                disabled={loading}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {tokenData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Signing Alg</span>
                    <div className="font-bold text-slate-800">{tokenData.signingAlgorithm}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Token Scheme</span>
                    <div className="font-bold text-blue-600">{tokenData.tokenType} (Proof of Possession)</div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>Raw Encoded Token (DPoP / Bearer Payload):</span>
                    <span className="text-[10px] text-slate-400">P-256 Elliptic Curve</span>
                  </div>
                  <pre className="p-3 bg-slate-950 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto whitespace-pre-wrap break-all max-h-36">
                    {tokenData.token}
                  </pre>
                </div>

                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs space-y-1 text-indigo-950">
                  <div className="font-bold">Token Invariants Included:</div>
                  <div className="text-[11px] text-indigo-800">
                    • <code>cnf.jkt</code>: Binds token to client cryptographic key (anti-replay).<br />
                    • <code>resource_access['nexus-lms-client'].roles</code>: Scoped strictly to [{activeRole}].
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">Generating synthetic token...</div>
            )}
          </div>

          {/* Right: Live Cryptographic Verification Sandbox */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-4">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Server-Side Cryptographic Verifier Sandbox</h3>
                <p className="text-xs text-slate-500">Test live server endpoint <code>/api/quorum/validate-shard</code></p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Test how the backend protects against stolen tokens, tampered signatures, and unauthorized role collusion:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => runVerificationTest("valid")}
                disabled={testLoading}
                className="px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
              >
                1. Test Valid Token
              </button>
              <button
                onClick={() => runVerificationTest("tampered")}
                disabled={testLoading}
                className="px-3 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition"
              >
                2. Test Tampered Token
              </button>
              <button
                onClick={() => runVerificationTest("collusion")}
                disabled={testLoading}
                className="px-3 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition"
              >
                3. Test Role Collusion
              </button>
            </div>

            {/* Test Result Display */}
            {testResult && (
              <div
                className={`p-4 rounded-xl border text-xs space-y-2 animate-in fade-in ${
                  testResult.ok
                    ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                    : "bg-rose-50 border-rose-200 text-rose-950"
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center space-x-1.5">
                    {testResult.ok ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                    )}
                    <span>
                      HTTP {testResult.status} {testResult.ok ? "Success" : "Denied by Invariant"}
                    </span>
                  </span>
                  <span className="text-[10px] uppercase tracking-wider bg-white px-2 py-0.5 rounded border">
                    Test: {testResult.testType}
                  </span>
                </div>

                <pre className="font-mono text-[11px] p-2 bg-white/80 rounded border border-current/20 overflow-x-auto">
                  {JSON.stringify(testResult.body, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* 6 Quy tắc Bất biến Y khoa của AegisMed */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
            <div className="p-2.5 bg-cyan-50 text-cyan-700 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">6 Quy tắc Bất biến Bảo mật Y tế của AegisMed</h2>
              <p className="text-xs text-slate-500">Tiêu chuẩn bảo mật HIPAA & TideCloak Threshold Cryptography</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="text-xs font-bold text-cyan-700 uppercase tracking-wider">Quy tắc 1</div>
              <h4 className="text-sm font-bold text-slate-900">Emergent Authority ($M$-of-$N$)</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Không một cá nhân nào (kể cả Bác sĩ điều trị hay Giám đốc bệnh viện) có quyền đơn phương cấp phát thuốc gây nghiện (Opioid/Morphine) hoặc niêm phong xuất viện cho ca hồi sức cấp cứu. Bắt buộc phải có sự đồng thuận từ $M$-of-$N$ vai trò độc lập.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="text-xs font-bold text-purple-600 uppercase tracking-wider">Quy tắc 2</div>
              <h4 className="text-sm font-bold text-slate-900">Chống Thông đồng (Non-Collusion)</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Một tài khoản không thể ký 2 lần để tự thỏa mãn cổng kiểm soát. Hệ thống bắt buộc phải có ít nhất 2 vai trò riêng biệt (Bác sĩ + Dược sĩ, hoặc Bác sĩ + Giám đốc Y khoa). Submitting trùng vai trò sẽ bị từ chối với mã <code>QUORUM_COLLUSION_REJECTED</code>.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Quy tắc 3</div>
              <h4 className="text-sm font-bold text-slate-900">Token Ràng buộc DPoP</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Token truy cập được gắn chặt với khóa mật mã của trình duyệt người dùng (<code>cnf.jkt</code>). Kẻ tấn công đánh cắp token trên đường truyền mạng không thể phát lại (replay) nếu không sở hữu khóa riêng Secure Web Enclave.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">Quy tắc 4</div>
              <h4 className="text-sm font-bold text-slate-900">Giới hạn Quyền Hạn AI Y tế</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nút AI Gemini Clinical Safety hoạt động với vai trò nguyên tử duy nhất (<code>ai_auditor</code>). AI kiểm tra tương tác dược lý và tiền sử dị ứng, đóng góp 1 chữ ký xác thực an toàn nhưng không thể tự ý ra quyết định lâm sàng thay con người.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="text-xs font-bold text-rose-600 uppercase tracking-wider">Quy tắc 5</div>
              <h4 className="text-sm font-bold text-slate-900">Xác thực Bằng Khóa Nhúng JWKS</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hệ thống backend kiểm tra chữ ký token bằng các khóa công khai cục bộ nhúng trong tệp <code>tidecloak.json</code> (không tải chứng chỉ từ xa lúc runtime), ngăn chặn tấn công Man-in-the-Middle vào máy chủ xác thực.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Quy tắc 6</div>
              <h4 className="text-sm font-bold text-slate-900">Niêm phong Bệnh án Mật mã VVK</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hồ sơ phẫu thuật và xuất viện khi được phê duyệt sẽ tạo ra chuỗi hash chứng thực (VVK Attestation Hash). Bất kỳ hành vi sửa đổi dữ liệu nào trong cơ sở dữ liệu sau đó đều sẽ lập tức bị phát hiện do sai lệch chữ ký.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
