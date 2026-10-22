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
  RefreshCw,
  Cpu,
  Terminal,
  Layers,
  UserCheck,
  ArrowRight,
  XCircle,
} from "lucide-react";

const TIDE_MCP_ARCHITECTURE_MAP = [
  {
    module: "1. Xác thực Đăng nhập & Thẩm định Nhân sự Y tế",
    badge: "Xác thực Ngưỡng PRISM & Quản trị Danh tính",
    tideMechanism: "Xác thực không lưu mật khẩu (Zero-Hash) & Phê duyệt Hồ sơ Hành nghề",
    howItFits:
      "Mật khẩu được xác thực phân tán qua mạng lưới nút mật mã mà không lưu trữ bản băm mật khẩu. Tài khoản Bệnh nhân được kích hoạt ngay, trong khi tài khoản Bác sĩ, Dược sĩ và Giám đốc bắt buộc đính kèm Chứng chỉ Hành nghề (CCHN) và chờ Hội đồng thẩm định đa bên kích hoạt.",
    href: "/login",
  },
  {
    module: "2. Quản trị Hồ sơ Cá nhân (PII) & Kho Dữ liệu Tối mật (SPII)",
    badge: "Mã hóa Đầu-Cuối & Bảo vệ Đa lớp (2FA)",
    tideMechanism: "Kiểm soát Thay đổi Đa bên & Cấp quyền Giải mã SPII 1 Lần Duy Nhất",
    howItFits:
      "Đổi Username hoặc Mật khẩu yêu cầu mã xác thực OTP 6 chữ số qua Email, SMS hoặc Ứng dụng. Sửa bất kỳ thông tin cá nhân (PII) nào đều phải chờ Hội đồng phê duyệt. Dữ liệu nhạy cảm tối mật (SPII) chỉ được tải về dạng tệp đúng 1 lần duy nhất trước khi khóa truy cập tự hủy.",
    href: "/profile",
  },
  {
    module: "3. Hội đồng Thẩm định & Ký duyệt Đa bên (Emergent Authority)",
    badge: "Đồng thuận Đa Chữ Ký M-of-N",
    tideMechanism: "Chữ ký Ngưỡng từ Các Vai trò Độc lập (Chống Thông đồng)",
    howItFits:
      "Mọi tác vụ nhạy cảm (kích hoạt tài khoản nhân sự mới, sửa thông tin cá nhân PII, trích xuất tệp SPII 1 lần, kê đơn thuốc kiểm soát đặc biệt) đều bắt buộc thu thập đủ chữ ký từ tối thiểu 2 vai trò độc lập (ví dụ: Bác sĩ + Dược sĩ hoặc Giám đốc Y khoa).",
    href: "/quorum",
  },
  {
    module: "4. Bảo vệ Hồ sơ Bệnh án Nội trú & Xác thực Phía Máy chủ",
    badge: "Chữ ký số VVK & Ràng buộc Khóa Thiết bị",
    tideMechanism: "Kiểm tra Quyền truy cập Thực tế phía Máy chủ theo Từng Vai trò",
    howItFits:
      "Mọi thao tác truy xuất hoặc cập nhật bệnh án đều được máy chủ xác thực chữ ký số, kiểm tra khóa thiết bị chống đánh cắp phiên làm việc (DPoP) và đối chiếu quyền hạn y khoa trước khi cho phép thực thi.",
    href: "/patients",
  },
];

const RBAC_CAPABILITY_CHECKS = [
  {
    id: "tide_voucher",
    label: "Chứng thực Danh tính Mật mã TideCloak",
    description: "Cho phép sử dụng phiên đăng nhập bảo mật phân tán",
    role: "_tide_enabled",
    isClient: false,
  },
  {
    id: "iga_admin",
    label: "Thành viên Hội đồng Quản trị & Thẩm định",
    description: "Quyền tham gia xem xét và phê duyệt các yêu cầu tại Hội đồng",
    role: "tide-realm-admin",
    clientId: "realm-management",
    isClient: true,
  },
  {
    id: "ehr_write",
    label: "Cập nhật Bệnh án & Chỉ số Sinh tồn",
    description: "Quyền ghi nhận chẩn đoán và cập nhật hồ sơ bệnh nhân nội trú",
    role: "ehr:write",
    clientId: "nexus-lms-client",
    isClient: true,
  },
  {
    id: "rx_propose",
    label: "Khởi tạo & Kê đơn Thuốc Kiểm soát Đặc biệt",
    description: "Quyền đề xuất phác đồ điều trị và thuốc cần hội chẩn",
    role: "prescription:propose",
    clientId: "nexus-lms-client",
    isClient: true,
  },
  {
    id: "rx_verify",
    label: "Thẩm định Dược lâm sàng & Tương tác Thuốc",
    description: "Quyền kiểm duyệt liều lượng và cảnh báo dị ứng thuốc",
    role: "prescription:verify",
    clientId: "nexus-lms-client",
    isClient: true,
  },
  {
    id: "staff_verify",
    label: "Phê duyệt Chứng chỉ Hành nghề Nhân sự Mới",
    description: "Quyền thẩm định hồ sơ CCHN và kích hoạt tài khoản y tế",
    role: "staff:verify-evidence",
    clientId: "nexus-lms-client",
    isClient: true,
  },
  {
    id: "quorum_sign",
    label: "Ký duyệt Chữ ký Ngưỡng (M-of-N Quorum)",
    description: "Quyền đóng góp chữ ký số độc lập vào quyết định chung",
    role: "quorum:sign",
    clientId: "nexus-lms-client",
    isClient: true,
  },
  {
    id: "spii_export",
    label: "Yêu cầu Mở khóa & Trích xuất Hồ sơ SPII 1 Lần",
    description: "Quyền gửi yêu cầu giải mã dữ liệu cá nhân tối mật của chính mình",
    role: "spii:request-once",
    clientId: "nexus-lms-client",
    isClient: true,
  },
];

const ROLE_DISPLAY_NAMES: Record<string, string> = {
  doctor: "Bác sĩ Điều trị",
  pharmacist: "Dược sĩ Lâm sàng",
  director: "Giám đốc Y khoa",
  patient: "Bệnh nhân",
  ai_auditor: "Trợ lý Kiểm toán AI",
};

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
          scenarioLabel: "Kiểm tra Chống Thông đồng Chữ ký",
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
              resourceName: "Cập nhật Hồ sơ Bệnh án Nội trú",
              requiredRoles: ["doctor", "ehr:write"],
            }
          : {
              resourceName: "Ký duyệt tại Hội đồng Thẩm định Quorum",
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
        scenarioLabel:
          testType === "tampered_jwt"
            ? "Kiểm tra Phát hiện Chữ ký Token Bị Giả mạo"
            : payload.resourceName,
        status: res.status,
        ok: res.ok,
        body,
        testType,
      });
    } catch (err: any) {
      setTestResult({
        scenarioLabel: "Kiểm tra Xác thực Máy chủ",
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
              <span>Kiến trúc Bảo mật TideCloak • Phân quyền & Đồng thuận Đa bên</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Trung tâm Bảo mật TideCloak & Kiểm thử Quyền truy cập Y tế
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Mô phỏng trực tiếp cách <strong>TideCloak</strong> bảo vệ toàn diện hệ thống bệnh viện: từ đăng nhập không lưu mật khẩu, kiểm soát quyền hạn theo từng chức danh y tế, cho tới xác thực chữ ký số đa bên (Emergent Authority Quorum) trước khi cho phép truy xuất dữ liệu nhạy cảm.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5 shrink-0">
            <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              Trạng thái Bảo mật Hệ thống
            </div>
            <div className="font-bold text-[#087F8C] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#087F8C] animate-pulse" />
              <span>Khóa xác thực cục bộ đã kích hoạt</span>
            </div>
            <div className="text-slate-600 text-[11px]">
              Chuẩn mã hóa: <strong>Chữ ký số ES256 & Ràng buộc DPoP</strong>
            </div>
            <div className="text-slate-500 text-[11px]">
              Phiên hiện tại: <strong>{currentUser?.name}</strong> (
              {activeRole ? ROLE_DISPLAY_NAMES[activeRole] || activeRole : ""})
            </div>
          </div>
        </section>

        {/* SECTION 1: Where TideCloak Fits */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#087F8C]" />
              <span>1. Các Lớp Bảo vệ của TideCloak trong Hệ thống Bệnh viện</span>
            </h2>
            <p className="text-xs text-slate-500">
              Vai trò của TideCloak tại từng phân hệ nghiệp vụ từ lúc đăng ký tài khoản đến khi trích xuất hồ sơ tối mật.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {TIDE_MCP_ARCHITECTURE_MAP.map((item) => (
              <div
                key={item.module}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between gap-4 hover:border-[#087F8C]/40 transition"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E8F5F2] text-[#087F8C]">
                      {item.badge}
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
                    <span>Trải nghiệm phân hệ này</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: Interactive Role Switcher & Live Access Matrix */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#087F8C]" />
                <span>2. Bảng Kiểm tra Quyền hạn Trực tiếp theo Vai trò Y tế</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Chọn một vai trò bên phải để xem ngay các quyền hạn được cấp phát hoặc bị khóa đối với vai trò đó.
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
                      {ROLE_DISPLAY_NAMES[r]}
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
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        allowed
                          ? "bg-[#087F8C] text-white"
                          : "bg-rose-500/15 text-rose-700 border border-rose-500/30"
                      }`}
                    >
                      {allowed ? (
                        <>
                          <Unlock className="w-3 h-3" /> ĐƯỢC CẤP QUYỀN
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3" /> TỪ CHỐI TRUY CẬP
                        </>
                      )}
                    </span>
                  </div>
                  <div className="font-bold text-slate-900">{cap.label}</div>
                  <div className="text-[11px] text-slate-500 leading-relaxed">
                    {cap.description}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: 2-Column Live Token Inspector & Server-Side Access Verification */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Synthetic Token & Claims Inspector */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-[#E8F5F2] text-[#087F8C] rounded-xl">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    3. Thông tin Chứng thực Phiên làm việc Hiện tại
                  </h3>
                  <p className="text-xs text-slate-500">
                    Thẻ căn cước mật mã (Token) được cấp riêng cho vai trò đang đăng nhập
                  </p>
                </div>
              </div>
              <button
                onClick={fetchToken}
                disabled={loading}
                className="p-2 rounded-xl bg-[#E8F5F2] text-[#087F8C] hover:bg-[#087F8C] hover:text-white transition cursor-pointer"
                title="Làm mới chứng thực phiên"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {tokenData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">
                      Thuật toán Chữ ký số
                    </span>
                    <div className="font-bold text-slate-900">
                      {tokenData.signingAlgorithm} (Đường cong Elliptic P-256)
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">
                      Cơ chế Chống Đánh cắp Phiên
                    </span>
                    <div className="font-bold text-[#087F8C]">
                      Ràng buộc Khóa Thiết bị ({tokenData.tokenType})
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>Chi tiết Chứng nhận Quyền hạn trong Token:</span>
                    <span className="text-[10px] font-semibold text-[#087F8C]">
                      Đã xác thực chữ ký VVK
                    </span>
                  </div>
                  <pre className="p-3.5 bg-slate-950 text-teal-300 rounded-xl font-mono text-[11px] overflow-x-auto max-h-52">
                    {JSON.stringify(tokenClaims, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                Đang khởi tạo chứng thực phiên...
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
                  4. Mô phỏng Kiểm tra Bảo mật Phía Máy chủ
                </h3>
                <p className="text-xs text-slate-500">
                  Kiểm chứng cách máy chủ tự động chặn các truy cập trái phép hoặc giả mạo
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Mọi yêu cầu gửi lên máy chủ đều được kiểm tra chữ ký mật mã và đối chiếu đúng vai trò trước khi thực thi. Hãy bấm thử 4 kịch bản kiểm tra dưới đây:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => runServerAccessTest("ehr_write")}
                disabled={testLoading}
                className="px-3.5 py-2.5 rounded-xl bg-[#087F8C] hover:bg-[#066670] text-white text-xs font-semibold transition cursor-pointer whitespace-nowrap"
              >
                1. Kiểm tra Quyền Ghi Bệnh Án
              </button>
              <button
                type="button"
                onClick={() => runServerAccessTest("iga_admin")}
                disabled={testLoading}
                className="px-3.5 py-2.5 rounded-xl bg-[#E8F5F2] hover:bg-[#087F8C] text-[#087F8C] hover:text-white border border-[#087F8C]/30 text-xs font-semibold transition cursor-pointer whitespace-nowrap"
              >
                2. Kiểm tra Quyền Ký Duyệt Hội Đồng
              </button>
              <button
                type="button"
                onClick={() => runServerAccessTest("tampered_jwt")}
                disabled={testLoading}
                className="px-3.5 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-500/30 text-xs font-semibold transition cursor-pointer whitespace-nowrap"
              >
                3. Thử Gửi Token Bị Sửa Đổi Trái Phép
              </button>
              <button
                type="button"
                onClick={() => runServerAccessTest("quorum_collusion")}
                disabled={testLoading}
                className="px-3.5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-600 text-amber-800 hover:text-white border border-amber-500/30 text-xs font-semibold transition cursor-pointer whitespace-nowrap"
              >
                4. Thử Tự Ký Duyệt 2 Lần Cùng Vai Trò
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
                <div className="flex items-center justify-between font-bold gap-2 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    {testResult.ok ? (
                      <CheckCircle2 className="w-4 h-4 text-[#087F8C]" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600" />
                    )}
                    <span>
                      Mã phản hồi {testResult.status} —{" "}
                      {testResult.ok ? "ĐƯỢC PHÉP THỰC THI" : "BỊ CHẶN BỞI HỆ THỐNG BẢO MẬT"}
                    </span>
                  </span>
                  <span className="text-[10px] font-semibold bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                    {testResult.scenarioLabel}
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
