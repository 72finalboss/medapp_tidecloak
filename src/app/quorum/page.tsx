"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { useAuth } from '../../lib/authContext';
import { useHospital } from '../../lib/hospitalContext';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Fingerprint,
  Sparkles,
  FileBadge,
  Lock,
  UserCheck,
  ArrowRight,
} from 'lucide-react';

export default function ClinicalQuorumPage() {
  const { currentUser, activeRole } = useAuth();
  const { quorumRequests, signQuorumRequest } = useHospital();

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSign = (requestId: string) => {
    const res = signQuorumRequest(requestId);
    setNotification({
      type: res.success ? 'success' : 'error',
      text: res.message,
    });
    setTimeout(() => {
      setNotification(null);
    }, 6000);
  };

  const pendingRequests = quorumRequests.filter((r) => r.status === 'PENDING');
  const committedRequests = quorumRequests.filter((r) => r.status === 'COMMITTED');

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-up">
        {/* Clean Minimalist Header Banner */}
        <section className="bg-[#E8F5F2]/60 border border-[#087F8C]/20 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white border border-[#087F8C]/20 text-[#087F8C] text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Phòng Hội Chẩn Đa Bên • Emergent Authority M-of-N</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Trung tâm Hội đồng Thẩm định & Phê duyệt Đa bên
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Mọi tác vụ nhạy cảm: (1) Xác minh minh chứng tài khoản nhân sự y tế mới, (2) Phê duyệt xuất tệp SPII 1 lần, (3) Sửa thông tin cá nhân PII, và (4) Kê đơn thuốc kiểm soát đặc biệt đều bắt buộc đạt ngưỡng chữ ký đồng thuận từ các vai trò độc lập.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5 text-right shrink-0">
            <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              Phiên Ký duyệt Hiện tại
            </div>
            <div className="font-bold text-slate-900 flex items-center justify-end space-x-1.5">
              <Fingerprint className="w-4 h-4 text-[#087F8C]" />
              <span>{currentUser?.name}</span>
            </div>
            <div className="text-[#087F8C] text-[11px] capitalize font-semibold">
              Vai trò: {activeRole}
            </div>
          </div>
        </section>

        {/* Live Notification Feedback */}
        {notification && (
          <div
            className={`p-4 rounded-2xl text-xs font-medium border flex items-center space-x-2.5 transition-all ${
              notification.type === 'success'
                ? 'bg-[#E8F5F2] text-slate-900 border-[#087F8C]/30'
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-[#087F8C] shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{notification.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Yêu cầu Đang chờ Hội đồng Ký duyệt ({pendingRequests.length})
              </h2>
              <span className="text-xs text-slate-500">Ngưỡng 2/3 Vai trò Riêng biệt</span>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                Hiện tại không có yêu cầu nào đang chờ hội chẩn. Tất cả yêu cầu đã được niêm phong.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((req) => {
                  const percent = Math.min(
                    100,
                    Math.round((req.signatures.length / req.requiredThreshold) * 100)
                  );
                  const alreadySignedByMe = req.signatures.some((s) => s.role === activeRole);

                  return (
                    <div
                      key={req.id}
                      className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
                        <div>
                          <div className="flex items-center flex-wrap gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5F2] text-[#087F8C]">
                              {req.type.replace(/_/g, ' ')}
                            </span>
                            {req.patientName && (
                              <span className="text-xs font-semibold text-slate-500">
                                BN: <strong>{req.patientName}</strong> ({req.patientId})
                              </span>
                            )}
                            {req.targetUserName && (
                              <span className="text-xs font-semibold text-slate-500">
                                Tài khoản: <strong>{req.targetUserName}</strong> (@{req.targetUserId})
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-base text-slate-900 mt-1">{req.title}</h3>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-extrabold text-[#087F8C]">
                            {req.signatures.length} / {req.requiredThreshold} Chữ ký Shard
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">{req.description}</p>

                      {/* Specialized Block 1: Staff Evidence Verification */}
                      {req.type === 'XÁC_MINH_NHÂN_SỰ_Y_TẾ' && req.evidence && (
                        <div className="p-4 bg-[#E8F5F2]/50 rounded-2xl border border-[#087F8C]/20 text-xs space-y-2">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <FileBadge className="w-4 h-4 text-[#087F8C]" />
                            Hồ sơ Minh chứng Hành nghề Y tế Đính kèm:
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                            <div>
                              <strong>Số CCHN Quốc gia:</strong>{' '}
                              <span className="font-mono text-[#087F8C] font-semibold">
                                {req.evidence.licenseNumber}
                              </span>
                            </div>
                            <div>
                              <strong>Văn bằng chuyên môn:</strong> {req.evidence.degree}
                            </div>
                            <div>
                              <strong>Cơ quan cấp:</strong> {req.evidence.issuePlace}
                            </div>
                            <div>
                              <strong>Ngày cấp:</strong> {req.evidence.issueDate}
                            </div>
                            <div className="sm:col-span-2">
                              <strong>Tệp bản sao công chứng:</strong>{' '}
                              <span className="underline text-[#087F8C] font-medium">
                                {req.evidence.documentFileName}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Specialized Block 2: Profile PII Update Diff */}
                      {req.type === 'CẬP_NHẬT_THÔNG_TIN_CÁ_NHÂN' && req.profileUpdateDiff && (
                        <div className="p-4 bg-[#E8F5F2]/50 rounded-2xl border border-[#087F8C]/20 text-xs space-y-2.5">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <UserCheck className="w-4 h-4 text-[#087F8C]" />
                            Chi tiết Các trường Thông tin Cá nhân (PII) Đề xuất Thay đổi:
                          </div>
                          <div className="space-y-1.5">
                            {Object.keys(req.profileUpdateDiff.newValues).map((fieldKey) => {
                              const k = fieldKey as keyof typeof req.profileUpdateDiff.newValues;
                              return (
                                <div
                                  key={fieldKey}
                                  className="p-2.5 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                                >
                                  <span className="font-bold text-slate-700 uppercase text-[10px]">
                                    Trường [{fieldKey}]:
                                  </span>
                                  <div className="flex items-center gap-2 text-xs">
                                    <span className="line-through text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                                      {req.profileUpdateDiff?.oldValues[k] || '(Trống)'}
                                    </span>
                                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="font-bold text-[#087F8C] bg-[#E8F5F2] px-2 py-0.5 rounded">
                                      {req.profileUpdateDiff?.newValues[k]}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Specialized Block 3: SPII One-Time Export Request */}
                      {req.type === 'TRUY_XUẤT_SPII' && (
                        <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-200 text-xs space-y-1.5">
                          <div className="font-bold text-rose-900 flex items-center gap-1.5">
                            <Lock className="w-4 h-4 text-rose-600" />
                            Cảnh báo Dữ liệu Tối mật (SPII 1-Time Export):
                          </div>
                          <p className="text-rose-800">
                            Khi đạt đủ {req.requiredThreshold} chữ ký, hệ thống sẽ tạo khóa giải mã tạm thời cho phép người dùng tải xuống tệp{' '}
                            <code className="font-mono font-bold">SPII_{req.targetUserId}.json</code> đúng{' '}
                            <strong>1 lần duy nhất</strong>. Ngay sau khi bấm tải, quyền truy cập sẽ tự hủy.
                          </p>
                        </div>
                      )}

                      {/* Standard Payload Rationale */}
                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs space-y-1.5">
                        {req.payload.diagnosis && (
                          <div className="text-slate-700">
                            <strong>Chẩn đoán:</strong> {req.payload.diagnosis}
                          </div>
                        )}
                        <div className="text-slate-700">
                          <strong>Lý do / Thuyết minh:</strong> {req.payload.clinicalRationale}
                        </div>
                        <div className="text-slate-700">
                          <strong>Hành động Thực thi Tự động khi đủ chữ ký:</strong>{' '}
                          {req.payload.proposedAction}
                        </div>
                      </div>

                      {/* Signatures List */}
                      <div className="space-y-2">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Chữ ký Mật mã Đã Đóng Góp ({req.signatures.length}/{req.requiredThreshold})
                        </div>
                        {req.signatures.length === 0 ? (
                          <div className="p-3 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-400">
                            Chưa có chữ ký nào. Hãy bấm nút &quot;Ký duyệt&quot; bên dưới và chuyển đổi sang vai trò khác trên thanh menu để ký chữ ký thứ 2.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {req.signatures.map((sig, idx) => (
                              <div
                                key={idx}
                                className="p-3 bg-[#E8F5F2]/50 border border-[#087F8C]/20 rounded-xl text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-900">{sig.signerName}</span>
                                  <span className="text-[10px] uppercase font-bold text-[#087F8C] bg-white px-2 py-0.5 rounded-full border border-[#087F8C]/20">
                                    {sig.role}
                                  </span>
                                </div>
                                <div className="font-mono text-[10px] text-slate-600 truncate">
                                  {sig.signatureHash}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Bar */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div className="w-1/2">
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#087F8C] transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>

                        {alreadySignedByMe ? (
                          <span className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
                            <CheckCircle2 className="w-4 h-4 text-[#087F8C]" />
                            <span>Vai trò [{activeRole}] đã ký (Đổi vai trò trên Navbar để ký tiếp)</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSign(req.id)}
                            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#087F8C] hover:bg-[#066670] text-white text-xs font-semibold transition"
                          >
                            <Fingerprint className="w-4 h-4" />
                            <span>Ký duyệt với vai trò [{activeRole}]</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Committed Requests */}
            <div className="space-y-4 pt-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Yêu cầu Đã Đạt Ngưỡng Đồng Thuận & Thực Thi ({committedRequests.length})
              </h2>

              <div className="space-y-3">
                {committedRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="p-2.5 rounded-xl bg-[#E8F5F2] text-[#087F8C]">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-[#087F8C]">
                          {req.type.replace(/_/g, ' ')}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{req.title}</h4>
                        <div className="text-xs text-slate-500">
                          Đã đủ {req.signatures.length}/{req.requiredThreshold} chữ ký đồng thuận • Trạng thái: COMMITTED
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {(req.type === 'TRUY_XUẤT_SPII' || req.type === 'CẬP_NHẬT_THÔNG_TIN_CÁ_NHÂN') && (
                        <Link
                          href="/profile"
                          className="px-3 py-1.5 bg-[#087F8C] hover:bg-[#066670] text-white rounded-xl text-xs font-semibold"
                        >
                          Về trang Hồ sơ (PII/SPII)
                        </Link>
                      )}
                      <div className="px-3 py-1 bg-[#E8F5F2] rounded-full text-xs font-bold text-[#087F8C]">
                        Đã Niêm Phong VVK
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Educational Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center space-x-2 text-[#087F8C]">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-bold text-sm text-slate-900">4 Cơ chế Bảo vệ Đa bên</h3>
              </div>

              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <p>
                  <strong>1. Thẩm định Nhân sự Y tế Mới:</strong> Khi Bác sĩ, Dược sĩ hoặc Giám đốc đăng ký tại trang Sign-up, tài khoản bắt buộc đính kèm minh chứng CCHN và chờ Hội đồng ký duyệt mới được kích hoạt.
                </p>
                <p>
                  <strong>2. SPII Xuất File 1 Lần Duy Nhất:</strong> Mọi thông tin nhạy cảm (CCCD, BHYT, Gen, Sinh trắc) bị khóa kín. Khi cần xem phải tạo yêu cầu Quorum; sau khi được duyệt sẽ xuất dưới dạng tệp tải về <strong>đúng 1 lần</strong> rồi tự hủy.
                </p>
                <p>
                  <strong>3. Kiểm soát Sửa đổi Hồ sơ (PII):</strong> Bất kỳ thay đổi nào về Họ tên, SĐT, Địa chỉ, Khoa phòng đều phải qua Quorum phê duyệt (ngoại trừ tự đổi Username/Password).
                </p>
                <p>
                  <strong>4. Chống Thông đồng (Role-Distinct):</strong> Một vai trò không thể ký 2 lần cho cùng một yêu cầu.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#E8F5F2]/60 border border-[#087F8C]/20 text-xs text-slate-800 space-y-1">
                <div className="font-bold flex items-center space-x-1 text-[#087F8C]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Mẹo thử nghiệm nhanh</span>
                </div>
                <p>
                  Sau khi bấm ký bằng tài khoản hiện tại, hãy mở menu góc phải trên cùng để chuyển nhanh sang <strong>Dược sĩ (pharm.thao)</strong> hoặc <strong>Giám đốc (cmo.quan)</strong> và ký chữ ký thứ 2!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
