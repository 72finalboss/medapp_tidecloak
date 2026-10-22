"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/lib/authContext';
import { useHospital } from '@/lib/hospitalContext';
import {
  UserCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Download,
  KeyRound,
  FileWarning,
  Edit3,
  CheckCircle2,
  Clock,
  RefreshCw,
  Shield,
  FileJson,
  AlertTriangle,
  ArrowRight,
  User as UserIcon,
  Phone,
  MapPin,
  Calendar,
  HeartPulse,
  Building2,
} from 'lucide-react';

export default function ProfilePage() {
  const { currentUser, activeRole, updateCredentialsSelfService } = useAuth();
  const {
    quorumRequests,
    spiiGrants,
    requestSPIIAccess,
    consumeSPIIDownload,
    requestProfileUpdate,
  } = useHospital();

  // State for Self-Service Credentials (Exempt from Quorum)
  const [newUsername, setNewUsername] = useState(currentUser?.username || '');
  const [newPassword, setNewPassword] = useState('');
  const [credFeedback, setCredFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // State for Profile PII Update (Requires Multi-Party Quorum)
  const [isEditingPII, setIsEditingPII] = useState(false);
  const [piiName, setPiiName] = useState(currentUser?.name || '');
  const [piiEmail, setPiiEmail] = useState(currentUser?.email || '');
  const [piiDepartment, setPiiDepartment] = useState(currentUser?.department || '');
  const [piiTitle, setPiiTitle] = useState(currentUser?.title || '');
  const [piiLicense, setPiiLicense] = useState(currentUser?.licenseNumber || '');
  const [piiPhone, setPiiPhone] = useState(currentUser?.pii?.phone || '');
  const [piiDob, setPiiDob] = useState(currentUser?.pii?.dateOfBirth || '');
  const [piiAddress, setPiiAddress] = useState(currentUser?.pii?.address || '');
  const [piiEmergency, setPiiEmergency] = useState(currentUser?.pii?.emergencyContact || '');
  const [piiUpdateReason, setPiiUpdateReason] = useState(
    'Cập nhật thông tin liên hệ và định danh hành chính định kỳ'
  );
  const [piiFeedback, setPiiFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // State for SPII Request
  const [spiiReason, setSpiiReason] = useState(
    'Trích xuất hồ sơ bảo hiểm & sinh trắc học phục vụ đối chiếu y khoa cá nhân'
  );
  const [spiiFeedback, setSpiiFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (currentUser) {
      setNewUsername(currentUser.username);
      setPiiName(currentUser.name);
      setPiiEmail(currentUser.email);
      setPiiDepartment(currentUser.department);
      setPiiTitle(currentUser.title);
      setPiiLicense(currentUser.licenseNumber || '');
      setPiiPhone(currentUser.pii?.phone || '');
      setPiiDob(currentUser.pii?.dateOfBirth || '');
      setPiiAddress(currentUser.pii?.address || '');
      setPiiEmergency(currentUser.pii?.emergencyContact || '');
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-2xl mx-auto px-6 py-20 text-center">
          <div className="bg-white border border-slate-200 rounded-2xl p-10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F5F2] text-[#087F8C] flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Chưa đăng nhập phiên làm việc</h2>
            <p className="text-slate-600 text-sm">
              Vui lòng đăng nhập qua cổng xác thực để xem Hồ sơ Cá nhân (PII & SPII).
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#087F8C] text-white font-semibold text-sm hover:bg-[#066670] transition"
            >
              Đi tới trang Đăng nhập
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const userSpiiGrants = spiiGrants.filter((g) => g.username === currentUser.username);
  const latestGrant = userSpiiGrants[0] || null;
  const linkedSpiiQuorum = latestGrant
    ? quorumRequests.find((r) => r.id === latestGrant.quorumRequestId)
    : null;

  const userProfileQuorums = quorumRequests.filter(
    (r) => r.type === 'CẬP_NHẬT_THÔNG_TIN_CÁ_NHÂN' && r.targetUserId === currentUser.username
  );

  const handleSelfServiceCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    const res = updateCredentialsSelfService(newUsername, newPassword);
    if (res.success) {
      setCredFeedback({ type: 'success', text: res.message });
      setNewPassword('');
    } else {
      setCredFeedback({ type: 'error', text: res.message });
    }
  };

  const handleProposePIIUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const res = requestProfileUpdate(
      {
        name: piiName.trim(),
        email: piiEmail.trim(),
        department: piiDepartment.trim(),
        title: piiTitle.trim(),
        licenseNumber: piiLicense.trim() || undefined,
        phone: piiPhone.trim(),
        dateOfBirth: piiDob.trim(),
        address: piiAddress.trim(),
        emergencyContact: piiEmergency.trim(),
      },
      piiUpdateReason
    );

    if (res.success) {
      setPiiFeedback({ type: 'success', text: res.message });
      setIsEditingPII(false);
    } else {
      setPiiFeedback({ type: 'error', text: res.message });
    }
  };

  const handleRequestSPII = (e: React.FormEvent) => {
    e.preventDefault();
    const res = requestSPIIAccess(spiiReason);
    if (res.success) {
      setSpiiFeedback({ type: 'success', text: res.message });
    } else {
      setSpiiFeedback({ type: 'error', text: res.message });
    }
  };

  const handleOneTimeDownloadSPII = () => {
    if (!latestGrant || latestGrant.status !== 'APPROVED_READY_ONCE') return;

    const exportPayload = {
      documentType: 'AEGISMED_HERMETIC_SPII_EXPORT_ONCE',
      warning: 'TÀI LIỆU TỐI MẬT (SPII) - CHỈ XUẤT 1 LẦN DUY NHẤT. QUYỀN TRUY CẬP ĐÃ TỰ HỦY SAU KHI TẢI.',
      exportedAt: new Date().toISOString(),
      grantId: latestGrant.id,
      quorumRequestId: latestGrant.quorumRequestId,
      quorumSignatures: linkedSpiiQuorum?.signatures || [],
      ownerProfile: {
        id: currentUser.id,
        username: currentUser.username,
        name: currentUser.name,
        role: currentUser.role,
        department: currentUser.department,
      },
      sensitivePII: {
        nationalIdCCCD: currentUser.spii?.nationalId,
        healthInsuranceNumber: currentUser.spii?.healthInsuranceCode,
        taxAndSocialSecurityId: currentUser.spii?.taxOrSocialSecurityId,
        geneticAndSensitiveHistory: currentUser.spii?.geneticAndSensitiveHistory,
        biometricKeyFingerprint: currentUser.spii?.biometricEnclaveKeyFingerprint,
      },
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SPII_TOI_MAT_${currentUser.username}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    consumeSPIIDownload(latestGrant.id);
    setSpiiFeedback({
      type: 'success',
      text: 'Đã tải xuống tệp SPII thành công! Khóa giải mã 1 lần đã tự hủy. Bạn cần gửi yêu cầu Quorum mới nếu muốn tải lại.',
    });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-up">
        {/* Clean Minimalist Header Banner */}
        <div className="bg-[#E8F5F2]/60 border border-[#087F8C]/20 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
              />
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl font-bold text-slate-900">{currentUser.name}</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-white text-[#087F8C] border border-[#087F8C]/20">
                    @{currentUser.username}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#087F8C] text-white flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" /> Đã xác thực
                  </span>
                </div>
                <p className="text-slate-600 text-sm mt-1">
                  {currentUser.title} • <span className="text-[#087F8C] font-medium">{currentUser.department}</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Mọi chỉnh sửa thông tin cá nhân (trừ Username/Mật khẩu) và mọi lượt trích xuất SPII đều bắt buộc thông qua Hội đồng Quorum đa chữ ký.
                </p>
              </div>
            </div>

            <Link
              href="/quorum"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#087F8C] hover:bg-[#066670] text-white text-xs font-semibold transition self-start md:self-center shrink-0"
            >
              <Shield className="w-4 h-4" />
              <span>Hội đồng Quorum ({quorumRequests.filter((r) => r.status === 'PENDING').length} chờ ký)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN (7 cols): Standard PII & Self-Service Credentials */}
          <div className="lg:col-span-7 space-y-8">
            {/* SECTION 1: PII */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-[#087F8C]" />
                    <h2 className="text-lg font-bold text-slate-900">
                      1. Thông tin Cá nhân Định danh (PII)
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Để sửa bất kỳ trường thông tin nào dưới đây, cần gửi yêu cầu và được nhiều bên phê duyệt.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsEditingPII(!isEditingPII);
                    setPiiFeedback(null);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition whitespace-nowrap shrink-0 cursor-pointer ${
                    isEditingPII
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30 hover:bg-rose-600 hover:text-white'
                      : 'bg-[#E8F5F2] text-[#087F8C] border-[#087F8C]/30 hover:bg-[#087F8C] hover:text-white'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5 shrink-0" />
                  <span>{isEditingPII ? 'Hủy chỉnh sửa' : 'Yêu cầu Sửa thông tin (Cần Quorum)'}</span>
                </button>
              </div>

              {piiFeedback && (
                <div
                  className={`mb-5 p-4 rounded-xl border text-xs flex items-start gap-2.5 ${
                    piiFeedback.type === 'success'
                      ? 'bg-[#E8F5F2] border-[#087F8C]/30 text-slate-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#087F8C]" />
                  <div className="space-y-1">
                    <p className="font-semibold">{piiFeedback.text}</p>
                    {piiFeedback.type === 'success' && (
                      <p className="text-slate-600">
                        👉 Hãy chuyển sang trang{' '}
                        <Link href="/quorum" className="text-[#087F8C] underline font-semibold">
                          Hội đồng Quorum
                        </Link>{' '}
                        và dùng menu tài khoản góc phải trên cùng để ký duyệt đủ 2 chữ ký.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {!isEditingPII ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs text-slate-500 block">Họ và Tên đầy đủ</span>
                    <span className="font-semibold text-slate-900 mt-0.5 block">{currentUser.name}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs text-slate-500 block">Địa chỉ Email</span>
                    <span className="font-semibold text-slate-900 mt-0.5 block">{currentUser.email}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-[#087F8C]" /> Khoa / Phòng ban
                    </span>
                    <span className="font-semibold text-slate-900 mt-0.5 block">
                      {currentUser.department}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs text-slate-500 block">Chức danh / Vai trò</span>
                    <span className="font-semibold text-slate-900 mt-0.5 block">
                      {currentUser.title} ({activeRole})
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-[#087F8C]" /> Số điện thoại liên hệ
                    </span>
                    <span className="font-semibold text-slate-900 mt-0.5 block">
                      {currentUser.pii?.phone}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#087F8C]" /> Ngày sinh
                    </span>
                    <span className="font-semibold text-slate-900 mt-0.5 block">
                      {currentUser.pii?.dateOfBirth}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-2">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#087F8C]" /> Địa chỉ thường trú
                    </span>
                    <span className="font-semibold text-slate-900 mt-0.5 block">
                      {currentUser.pii?.address}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <HeartPulse className="w-3.5 h-3.5 text-[#087F8C]" /> Liên hệ khẩn cấp (SOS)
                    </span>
                    <span className="font-semibold text-slate-900 mt-0.5 block">
                      {currentUser.pii?.emergencyContact}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs text-slate-500 block">
                      Số Chứng chỉ Hành nghề (nếu có)
                    </span>
                    <span className="font-semibold text-[#087F8C] mt-0.5 block">
                      {currentUser.licenseNumber ? `CCHN: ${currentUser.licenseNumber}` : 'Bệnh nhân / Không áp dụng'}
                    </span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleProposePIIUpdate} className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Kiểm soát Thay đổi Đa phương:</strong> Mọi chỉnh sửa thông tin dưới đây sẽ được tạo thành <strong>Yêu cầu Phê duyệt Hồ sơ</strong> và chỉ có hiệu lực sau khi được tối thiểu <strong>2 vai trò độc lập</strong> ký xác nhận.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Họ và Tên</label>
                      <input
                        type="text"
                        value={piiName}
                        onChange={(e) => setPiiName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm text-slate-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={piiEmail}
                        onChange={(e) => setPiiEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm text-slate-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Khoa / Phòng ban</label>
                      <input
                        type="text"
                        value={piiDepartment}
                        onChange={(e) => setPiiDepartment(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm text-slate-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Chức danh</label>
                      <input
                        type="text"
                        value={piiTitle}
                        onChange={(e) => setPiiTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm text-slate-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Số điện thoại</label>
                      <input
                        type="text"
                        value={piiPhone}
                        onChange={(e) => setPiiPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm text-slate-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Ngày sinh</label>
                      <input
                        type="date"
                        value={piiDob}
                        onChange={(e) => setPiiDob(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm text-slate-900"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">Địa chỉ thường trú</label>
                      <input
                        type="text"
                        value={piiAddress}
                        onChange={(e) => setPiiAddress(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm text-slate-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Liên hệ khẩn cấp</label>
                      <input
                        type="text"
                        value={piiEmergency}
                        onChange={(e) => setPiiEmergency(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm text-slate-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Số Chứng chỉ Hành nghề (nếu có)
                      </label>
                      <input
                        type="text"
                        value={piiLicense}
                        onChange={(e) => setPiiLicense(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm text-slate-900"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Lý do đề xuất chỉnh sửa thông tin (Gửi tới Hội đồng Quorum)
                      </label>
                      <input
                        type="text"
                        value={piiUpdateReason}
                        onChange={(e) => setPiiUpdateReason(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm text-slate-900"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingPII(false)}
                      className="px-4 py-2.5 rounded-xl bg-[#E8F5F2] hover:bg-[#087F8C] text-[#087F8C] hover:text-white border border-[#087F8C]/30 text-xs font-semibold whitespace-nowrap transition cursor-pointer"
                    >
                      Đóng
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#087F8C] hover:bg-[#066670] text-white font-semibold text-xs whitespace-nowrap transition cursor-pointer"
                    >
                      Gửi Yêu cầu Phê duyệt Thay đổi (Quorum 2/3)
                    </button>
                  </div>
                </form>
              )}

              {userProfileQuorums.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Lịch sử Yêu cầu Chỉnh sửa Thông tin Cá nhân ({userProfileQuorums.length})
                  </h3>
                  <div className="space-y-2.5">
                    {userProfileQuorums.map((q) => (
                      <div
                        key={q.id}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <span className="font-semibold text-slate-900">{q.title}</span>
                          <p className="text-slate-500 mt-0.5">
                            Chữ ký đạt được: {q.signatures.length}/{q.requiredThreshold} • Trạng thái:{' '}
                            <span
                              className={
                                q.status === 'COMMITTED'
                                  ? 'text-[#087F8C] font-bold'
                                  : 'text-amber-600 font-bold'
                              }
                            >
                              {q.status === 'COMMITTED' ? 'ĐÃ PHÊ DUYỆT & ÁP DỤNG' : 'ĐANG CHỜ DUYỆT'}
                            </span>
                          </p>
                        </div>
                        <Link
                          href="/quorum"
                          className="px-3 py-1.5 rounded-lg bg-[#E8F5F2] text-[#087F8C] font-semibold shrink-0"
                        >
                          Xem tại Quorum
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2: Self-Service Username & Password Change */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-[#087F8C]" />
                    <h2 className="text-lg font-bold text-slate-900">
                      2. Đổi Username & Mật khẩu (Tự phục vụ — Hiệu lực ngay)
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ngoại lệ duy nhất không cần chờ Hội đồng Quorum phê duyệt.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E8F5F2] text-[#087F8C]">
                  Miễn Quorum
                </span>
              </div>

              {credFeedback && (
                <div
                  className={`mb-4 p-3.5 rounded-xl border text-xs ${
                    credFeedback.type === 'success'
                      ? 'bg-[#E8F5F2] border-[#087F8C]/30 text-slate-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {credFeedback.text}
                </div>
              )}

              <form onSubmit={handleSelfServiceCredentials} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Tên đăng nhập (Username)
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Mật khẩu PRISM mới (Để trống nếu giữ nguyên)
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới..."
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-900"
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#087F8C] hover:bg-[#066670] text-white font-semibold text-xs transition"
                  >
                    Cập nhật Username / Mật khẩu Ngay lập tức
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN (5 cols): Hermetic SPII Vault */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F5F2] text-[#087F8C] flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      3. Kho Dữ liệu Nhạy cảm Tối mật (SPII)
                    </h2>
                    <p className="text-[11px] text-[#087F8C] font-medium">
                      Xuất File 1 Lần Duy Nhất • Tự Hủy Sau Khi Tải
                    </p>
                  </div>
                </div>
              </div>

              {/* Masked SPII Preview */}
              <div className="space-y-2.5 mb-6">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600">Số CCCD / Định danh Quốc gia:</span>
                  <span className="font-mono text-[#087F8C] bg-[#E8F5F2] px-2 py-0.5 rounded font-semibold">
                    •••••••••••• (Khóa E2EE)
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600">Mã số Bảo hiểm Y tế Quốc gia:</span>
                  <span className="font-mono text-[#087F8C] bg-[#E8F5F2] px-2 py-0.5 rounded font-semibold">
                    ••-•-••-••••••••••
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600">Mã số Thuế & BHXH:</span>
                  <span className="font-mono text-[#087F8C] bg-[#E8F5F2] px-2 py-0.5 rounded font-semibold">
                    MST-••••••••••
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600">Hồ sơ Gen & Bệnh lý nhạy cảm:</span>
                  <span className="font-mono text-[#087F8C] bg-[#E8F5F2] px-2 py-0.5 rounded font-semibold">
                    [CHỈ XUẤT TỆP 1 LẦN]
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600">Vân tay Khóa Sinh trắc học:</span>
                  <span className="font-mono text-[#087F8C] bg-[#E8F5F2] px-2 py-0.5 rounded font-semibold">
                    SHA256:••••••••••••
                  </span>
                </div>
              </div>

              {spiiFeedback && (
                <div className="mb-5 p-3.5 rounded-xl bg-[#E8F5F2] border border-[#087F8C]/30 text-xs text-slate-800">
                  {spiiFeedback.text}
                </div>
              )}

              {!latestGrant && (
                <form onSubmit={handleRequestSPII} className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-[#087F8C]" /> Quy trình Trích xuất SPII (3 bước):
                    </p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Gửi yêu cầu giải mã SPII kèm lý do chính đáng.</li>
                      <li>Được thông qua bởi nhiều bên (tối thiểu 2 chữ ký tại Quorum).</li>
                      <li>Tải về dưới dạng tệp (`.json`) đúng 1 lần duy nhất. Sau khi bấm tải về 1 lần, quyền xem/tải sẽ tự hủy ngay lập tức.</li>
                    </ol>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Lý do yêu cầu trích xuất tệp SPII
                    </label>
                    <textarea
                      rows={2}
                      value={spiiReason}
                      onChange={(e) => setSpiiReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#087F8C] hover:bg-[#066670] text-white font-semibold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <FileWarning className="w-4 h-4" />
                    Gửi Yêu cầu Mở khóa & Xuất tệp SPII
                  </button>
                </form>
              )}

              {latestGrant && latestGrant.status === 'PENDING_QUORUM' && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800">
                      <Clock className="w-4 h-4" /> ĐANG CHỜ ĐA BÊN PHÊ DUYỆT
                    </span>
                    <span className="text-xs font-mono text-amber-900 bg-white px-2 py-0.5 rounded border border-amber-200">
                      {linkedSpiiQuorum?.signatures.length || 0}/
                      {linkedSpiiQuorum?.requiredThreshold || 2} Chữ ký
                    </span>
                  </div>
                  <p className="text-xs text-amber-900">
                    Yêu cầu trích xuất SPII của bạn đang chờ Hội đồng phê duyệt. Tệp SPII sẽ xuất hiện tại đây ngay khi đủ{' '}
                    <strong>{linkedSpiiQuorum?.requiredThreshold || 2} chữ ký</strong> từ các vai trò khác nhau.
                  </p>
                  <Link
                    href="/quorum"
                    className="w-full py-2.5 rounded-xl bg-[#087F8C] hover:bg-[#066670] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    Đi tới Hội đồng Quorum để Ký duyệt ngay <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {latestGrant && latestGrant.status === 'APPROVED_READY_ONCE' && (
                <div className="p-5 rounded-xl bg-[#E8F5F2] border border-[#087F8C]/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#087F8C]">
                      <Unlock className="w-4 h-4" /> ĐÃ ĐƯỢC QUORUM THÔNG QUA
                    </span>
                    <span className="text-[11px] font-mono bg-white text-[#087F8C] px-2 py-0.5 rounded border border-[#087F8C]/20">
                      Hiệu lực: 1 lần tải
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    Hội đồng đã thông qua yêu cầu của bạn. Tệp dữ liệu <strong>SPII_{currentUser.username}.json</strong> đã sẵn sàng.{' '}
                    <span className="text-rose-700 font-semibold">
                      Lưu ý: Ngay sau khi bạn bấm tải về 1 lần, khóa truy cập sẽ tự hủy vĩnh viễn!
                    </span>
                  </p>

                  <button
                    onClick={handleOneTimeDownloadSPII}
                    className="w-full py-3.5 rounded-xl bg-[#087F8C] hover:bg-[#066670] text-white font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <Download className="w-4 h-4" />
                    Tải về Tệp SPII (.json) — Duy nhất 1 Lần
                  </button>
                </div>
              )}

              {latestGrant && latestGrant.status === 'DOWNLOADED_EXPIRED' && (
                <div className="p-5 rounded-xl bg-rose-50 border border-rose-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-800">
                      <Lock className="w-4 h-4" /> ĐÃ TẢI VỀ 1 LẦN — QUYỀN XEM ĐÃ TỰ HỦY
                    </span>
                    <FileJson className="w-4 h-4 text-rose-600" />
                  </div>

                  <p className="text-xs text-rose-900 leading-relaxed">
                    Bạn đã tải xuống tệp SPII vào lúc{' '}
                    <span className="font-mono font-semibold">
                      {latestGrant.downloadedAt
                        ? new Date(latestGrant.downloadedAt).toLocaleTimeString('vi-VN')
                        : 'vừa xong'}
                    </span>
                    . Theo quy định bảo mật SPII, tệp chỉ được tải đúng <strong>1 lần duy nhất</strong> và không thể xem hoặc tải lại.
                  </p>

                  <div className="pt-2 border-t border-rose-200">
                    <p className="text-[11px] text-rose-800 mb-2.5">
                      Nếu bạn cần trích xuất lại SPII, bạn bắt buộc phải gửi một yêu cầu mới và xin phê duyệt lại từ Hội đồng Quorum:
                    </p>
                    <button
                      onClick={handleRequestSPII}
                      className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-50 text-rose-700 border border-rose-300 font-semibold text-xs flex items-center justify-center gap-2 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Gửi Yêu cầu Mới để Xem/Tải lại SPII
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
