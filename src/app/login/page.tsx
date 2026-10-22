"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/authContext';
import { useHospital } from '../../lib/hospitalContext';
import { UserRole, StaffEvidence } from '../../lib/types';
import {
  QrCode,
  Settings,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Lock,
  User,
  Mail,
  Building2,
  Stethoscope,
  Pill,
  HeartPulse,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  X,
  FileBadge,
  Upload,
  Calendar,
  Clock,
  FileCheck,
} from 'lucide-react';

export default function TideCloakAuthPage() {
  const router = useRouter();
  const {
    continueSignIn,
    loginWithCredentials,
    signUp,
    rememberedUsername,
    setRememberedUsername,
    availableUsers,
    quickLogin,
  } = useAuth();

  const { createStaffVerificationRequest } = useHospital();

  // Mode: 'continue' (screenshot) | 'credentials' | 'signup'
  const [authMode, setAuthMode] = useState<'continue' | 'credentials' | 'signup'>('continue');
  const [showSettings, setShowSettings] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [pendingModal, setPendingModal] = useState<{
    show: boolean;
    name: string;
    username: string;
    role: string;
    evidence: StaffEvidence;
    reqId?: string;
  } | null>(null);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Credentials sign in state
  const [loginUsername, setLoginUsername] = useState(rememberedUsername || 'truongnguyenxuanvinh');
  const [loginPassword, setLoginPassword] = useState('Password123!');

  // Sign up state
  const [signUpData, setSignUpData] = useState({
    name: '',
    username: '',
    email: '',
    role: 'doctor' as UserRole,
    department: 'Khoa Hồi Sức Tích Cực',
    title: 'Bác sĩ Chuyên khoa',
    password: '',
    confirmPassword: '',
    // Staff evidence fields
    licenseNumber: 'CCHN-09552/BYT',
    degree: 'Bác sĩ Chuyên khoa I - Hồi sức Cấp cứu',
    issuePlace: 'Cục Quản lý Khám, Chữa bệnh - Bộ Y Tế',
    issueDate: '2023-08-15',
    documentFileName: 'ChungChi_HanhNghe_Scan_2026.pdf',
  });

  const isPatientRole = signUpData.role === 'patient';

  // Handle Continue button
  const handleContinue = () => {
    setLoading(true);
    setTimeout(() => {
      const res = continueSignIn(rememberedUsername);
      setLoading(false);
      if (res && res.success === false) {
        setErrorMsg(res.message || 'Tài khoản chưa được kích hoạt.');
      } else {
        router.push('/');
      }
    }, 350);
  };

  // Handle Credentials login
  const handleCredentialsLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    setTimeout(() => {
      const res = loginWithCredentials(loginUsername, loginPassword);
      setLoading(false);
      if (res.success) {
        router.push('/');
      } else {
        setErrorMsg(res.message || 'Xác thực thất bại.');
      }
    }, 350);
  };

  // Handle Sign up
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (signUpData.password !== signUpData.confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không trùng khớp.');
      return;
    }
    if (signUpData.password.length < 6) {
      setErrorMsg('Mật khẩu cần tối thiểu 6 ký tự.');
      return;
    }

    if (!isPatientRole && !signUpData.licenseNumber.trim()) {
      setErrorMsg('Vui lòng cung cấp Số chứng chỉ hành nghề y tế (CCHN) để thẩm định.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const evidence: StaffEvidence | undefined = isPatientRole
        ? undefined
        : {
            licenseNumber: signUpData.licenseNumber,
            degree: signUpData.degree,
            issuePlace: signUpData.issuePlace,
            issueDate: signUpData.issueDate,
            documentFileName: signUpData.documentFileName,
            submittedAt: new Date().toISOString(),
          };

      const res = signUp({
        name: signUpData.name,
        username: signUpData.username,
        email: signUpData.email,
        role: signUpData.role,
        department: signUpData.department,
        title: signUpData.title,
        password: signUpData.password,
        evidence,
      });

      setLoading(false);

      if (res.success) {
        if (res.isPendingVerification && res.user && evidence) {
          // Create Quorum Request for staff verification
          const reqId = createStaffVerificationRequest(res.user, evidence);

          // Open the Pending Verification Modal
          setPendingModal({
            show: true,
            name: res.user.name,
            username: res.user.username,
            role: res.user.role,
            evidence,
            reqId,
          });
        } else {
          // Patient: Activated immediately!
          setSuccessMsg('Đăng ký tài khoản Bệnh nhân thành công! Đang chuyển hướng...');
          setTimeout(() => {
            router.push('/');
          }, 600);
        }
      } else {
        setErrorMsg(res.message || 'Đăng ký thất bại.');
      }
    }, 450);
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#0066ee]">
      {/* Background Graphic: Diagonal angled blue banners matching TideCloak screenshot */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#0052cc] via-[#0070f3] to-[#00b4d8] pointer-events-none" />

      {/* Diagonal Geometric Light Bands */}
      <div className="absolute -inset-x-20 -inset-y-40 opacity-40 pointer-events-none">
        <div className="w-[140%] h-48 bg-gradient-to-r from-transparent via-white/20 to-transparent -rotate-45 transform translate-y-32" />
        <div className="w-[140%] h-32 bg-gradient-to-r from-transparent via-cyan-300/25 to-transparent -rotate-45 transform translate-y-96" />
        <div className="w-[140%] h-64 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent -rotate-45 transform translate-y-[-80px]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
        {/* Left Side: TideCLOAK Circular Brand Badge */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
          <div className="relative group">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-white border-4 border-slate-900/80 flex flex-col items-center justify-center shadow-2xl shadow-blue-900/50 transform group-hover:scale-105 transition-transform duration-300">
              <div className="text-center font-extrabold tracking-tight text-slate-900 leading-none select-none">
                <span className="text-2xl sm:text-3xl font-serif">Tide</span>
                <span className="block text-xl sm:text-2xl font-sans tracking-widest mt-1">CLOAK</span>
              </div>
            </div>
          </div>
          <div className="text-white space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">AegisMed Clinical Hub</h2>
            <p className="text-xs sm:text-sm text-cyan-100/90 max-w-xs">
              Mật mã ngưỡng PRISM • Thẩm định Minh chứng & Cấp quyền Y tế Đa bên
            </p>
          </div>
        </div>

        {/* Right Side: Authentic Tide White Card */}
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 relative border border-slate-100 flex flex-col justify-between min-h-[460px]">
          {/* QR Code button in top right corner */}
          <button
            onClick={() => setShowQrModal(true)}
            title="Scan QR Code to Sign in with Mobile Tide Enclave"
            className="absolute top-6 right-6 p-2 rounded-xl text-blue-600 hover:bg-blue-50 transition border border-blue-100 shadow-xs group"
          >
            <QrCode className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>

          {/* Card Top: Mode Navigation & Heading */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4 border-b border-slate-100 pb-3">
              <button
                onClick={() => {
                  setAuthMode('continue');
                  setErrorMsg('');
                }}
                className={`text-base font-bold transition pb-1 border-b-2 ${
                  authMode === 'continue' || authMode === 'credentials'
                    ? 'border-blue-600 text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Sign in
              </button>
              <button
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMsg('');
                }}
                className={`text-base font-bold transition pb-1 border-b-2 ${
                  authMode === 'signup'
                    ? 'border-blue-600 text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Sign up
              </button>
            </div>

            {/* Error / Success Feedback */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* VIEW 1: EXACT MATCH TO SCREENSHOT ("Continue to sign in as truongnguyenxuanvinh ?") */}
            {authMode === 'continue' && (
              <div className="space-y-6 pt-2">
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
                  <p className="text-sm text-slate-600">
                    Continue to sign in as{' '}
                    <strong className="text-slate-900 font-semibold">{rememberedUsername}</strong> ?
                  </p>
                </div>

                {/* Collapsible Settings Widget */}
                <div className="border border-slate-100 rounded-2xl p-2.5 bg-slate-50/70">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    <span className="flex items-center space-x-1.5">
                      <Settings className="w-3.5 h-3.5 text-slate-500" />
                      <span>Settings</span>
                    </span>
                    {showSettings ? (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>

                  {showSettings && (
                    <div className="pt-2.5 mt-2 border-t border-slate-200/80 space-y-1.5 text-[11px] text-slate-500">
                      <div className="flex justify-between">
                        <span>Realm:</span>
                        <span className="font-mono text-slate-700">aegismed-clinical</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cryptographic Enclave:</span>
                        <span className="font-semibold text-emerald-600">Secure Web Enclave (P-256)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ORK Threshold:</span>
                        <span className="font-semibold text-slate-700">14 / 20 Distributed Nodes</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Staff Onboarding:</span>
                        <span className="font-semibold text-blue-600">Quorum Verification Enforced</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Big Blue Continue Button */}
                <button
                  onClick={handleContinue}
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-full bg-[#0066f5] hover:bg-[#0055d4] active:bg-[#0047b3] text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all transform hover:scale-[1.01]"
                >
                  {loading ? 'Authenticating with Enclave...' : 'Continue'}
                </button>

                <div className="text-center pt-2 space-y-2">
                  <div className="text-xs text-slate-500">
                    Not you?{' '}
                    <button
                      onClick={() => setAuthMode('credentials')}
                      className="text-blue-600 hover:text-blue-800 font-semibold underline underline-offset-2"
                    >
                      Sign in with another account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: CREDENTIALS SIGN IN */}
            {authMode === 'credentials' && (
              <form onSubmit={handleCredentialsLogin} className="space-y-4 pt-1">
                <div className="space-y-1">
                  <h1 className="text-xl font-bold text-slate-900">Sign in with Credentials</h1>
                  <p className="text-xs text-slate-500">Nhập tên đăng nhập và mật khẩu PRISM</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Username / Email</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="truongnguyenxuanvinh / dr.hung / pharm.thao..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Mật khẩu mẫu chung: <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-semibold">Password123!</code>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-full bg-[#0066f5] hover:bg-[#0055d4] text-white font-bold text-xs shadow-md transition"
                >
                  {loading ? 'Verifying...' : 'Sign in'}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setAuthMode('continue')}
                    className="text-xs text-slate-500 hover:text-slate-800 underline"
                  >
                    &larr; Back to Continue screen
                  </button>
                </div>
              </form>
            )}

            {/* VIEW 3: SIGN UP WITH MANDATORY EVIDENCE FOR NON-PATIENTS */}
            {authMode === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-3 pt-1 max-h-[460px] overflow-y-auto pr-1">
                <div className="space-y-1">
                  <h1 className="text-xl font-bold text-slate-900">Create an Account</h1>
                  <p className="text-xs text-slate-500">
                    {isPatientRole
                      ? 'Đăng ký tài khoản Bệnh nhân (Kích hoạt tức thì)'
                      : 'Đăng ký Nhân sự Y tế (Yêu cầu Minh chứng & Thẩm định Đa bên)'}
                  </p>
                </div>

                {/* Role Selector */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Vai trò đăng ký</label>
                  <select
                    value={signUpData.role}
                    onChange={(e) => setSignUpData({ ...signUpData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 bg-blue-50/70 border border-blue-200 rounded-xl text-xs font-bold text-blue-900"
                  >
                    <option value="doctor">👨‍⚕️ Bác sĩ điều trị (Cần minh chứng CCHN)</option>
                    <option value="pharmacist">💊 Dược sĩ lâm sàng (Cần minh chứng CCHN)</option>
                    <option value="director">🏥 Giám đốc Y khoa (Cần quyết định bổ nhiệm)</option>
                    <option value="patient">🧑‍🦽 Bệnh nhân (Không cần minh chứng y tế)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700">Họ và tên</label>
                    <input
                      type="text"
                      required
                      placeholder="vd: BS. Đặng Quốc Huy"
                      value={signUpData.name}
                      onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700">Tên đăng nhập</label>
                    <input
                      type="text"
                      required
                      placeholder="huy.dang"
                      value={signUpData.username}
                      onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700">Email liên hệ</label>
                    <input
                      type="email"
                      required
                      placeholder="huy.dang@aegismed.vn"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700">Khoa / Phòng ban</label>
                    <input
                      type="text"
                      placeholder="Khoa Hồi Sức Tích Cực..."
                      value={signUpData.department}
                      onChange={(e) => setSignUpData({ ...signUpData, department: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                {/* === MỤC MINH CHỨNG BẮT BUỘC CHO ROLE KHÔNG PHẢI BỆNH NHÂN === */}
                {!isPatientRole && (
                  <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-2.5">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-950">
                      <FileBadge className="w-4 h-4 text-amber-700" />
                      <span>Minh chứng Chuyên môn & Hành nghề Y tế (Bắt buộc)</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-amber-900 uppercase">
                        Số Chứng chỉ Hành nghề Y tế (Số CCHN) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="vd: CCHN-09124/BYT"
                        value={signUpData.licenseNumber}
                        onChange={(e) => setSignUpData({ ...signUpData, licenseNumber: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-amber-900 uppercase">Văn bằng chuyên môn</label>
                        <input
                          type="text"
                          required
                          placeholder="vd: Bác sĩ Chuyên khoa I"
                          value={signUpData.degree}
                          onChange={(e) => setSignUpData({ ...signUpData, degree: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-xl text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-amber-900 uppercase">Ngày cấp CCHN</label>
                        <input
                          type="date"
                          value={signUpData.issueDate}
                          onChange={(e) => setSignUpData({ ...signUpData, issueDate: e.target.value })}
                          className="w-full px-2 py-1 bg-white border border-amber-300 rounded-xl text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-amber-900 uppercase">Cơ quan / Đơn vị cấp</label>
                      <input
                        type="text"
                        required
                        placeholder="Cục Quản lý Khám, Chữa bệnh - Bộ Y Tế"
                        value={signUpData.issuePlace}
                        onChange={(e) => setSignUpData({ ...signUpData, issuePlace: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-xl text-xs"
                      />
                    </div>

                    {/* File Attachment Upload */}
                    <div className="p-2 bg-white rounded-xl border border-dashed border-amber-300 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 truncate">
                        <Upload className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="truncate text-[11px] text-slate-700 font-medium">
                          {signUpData.documentFileName || 'ChungChi_Scan.pdf'}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded shrink-0">
                        Đã đính kèm
                      </span>
                    </div>

                    <p className="text-[10px] text-amber-800 leading-tight">
                      ℹ️ <em>Theo chính sách an toàn, tài khoản sẽ được chuyển vào hàng đợi Hội chẩn Quorum. Cần 2/3 chữ ký thẩm định (Ban Giám đốc & CSDL CCHN) để kích hoạt.</em>
                    </p>
                  </div>
                )}

                {/* Password Fields */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700">Mật khẩu</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700">Xác nhận</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••"
                      value={signUpData.confirmPassword}
                      onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 rounded-full bg-[#0066f5] hover:bg-[#0055d4] text-white font-bold text-xs shadow-md transition"
                >
                  {loading
                    ? 'Submitting Evidence...'
                    : isPatientRole
                    ? 'Create Account & Sign in'
                    : 'Gửi Hồ sơ Minh chứng & Đăng ký'}
                </button>
              </form>
            )}
          </div>

          {/* Footer: "Secured by Tide" */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-center space-x-1.5 text-xs text-slate-500 select-none">
            <span>Secured by</span>
            <span className="font-extrabold text-[#0052cc] tracking-wide text-sm font-sans">
              Tide
            </span>
          </div>
        </div>
      </div>

      {/* PENDING MULTI-PARTY VERIFICATION MODAL FOR STAFF ROLES */}
      {pendingModal?.show && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl mx-auto flex items-center justify-center">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Hồ sơ Đang Chờ Thẩm định Đa bên
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tài khoản nhân sự y tế của <strong>{pendingModal.name}</strong> ({pendingModal.username}) đã được tiếp nhận an toàn và đưa vào hàng đợi thẩm định của Hội đồng Chuyên môn.
              </p>
            </div>

            {/* Evidence summary box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Minh chứng đã gửi:</div>
              <div className="flex justify-between">
                <span className="text-slate-500">Số CCHN:</span>
                <span className="font-bold text-blue-700">{pendingModal.evidence.licenseNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Chuyên môn:</span>
                <span className="font-semibold text-slate-800">{pendingModal.evidence.degree}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cơ quan cấp:</span>
                <span className="text-slate-700">{pendingModal.evidence.issuePlace}</span>
              </div>
            </div>

            {/* Quorum Progress Bar */}
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-amber-950">
                <span>Tiến trình Xác thực Quorum</span>
                <span className="text-cyan-700">1 / 2 Chữ ký Shard</span>
              </div>
              <div className="w-full h-2 bg-amber-200/60 rounded-full overflow-hidden">
                <div className="w-1/2 h-full bg-cyan-600 rounded-full" />
              </div>
              <div className="text-[11px] text-amber-900 leading-tight">
                ✓ <strong>Đã hoàn thành:</strong> CSDL Chứng chỉ Hành nghề Quốc gia đã tra cứu và ký 1 chữ ký Shard an toàn.<br />
                ⏳ <strong>Đang chờ:</strong> Ban Giám đốc Y khoa (TS.BS Trần Minh Quân) ký thẩm định phê duyệt để kích hoạt tài khoản.
              </div>
            </div>

            {/* Demo Helper Action */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setPendingModal(null);
                  quickLogin('cmo.quan'); // Quick login as Director to approve it!
                  router.push('/quorum');
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold text-xs shadow-xs transition"
              >
                Đăng nhập Giám đốc (cmo.quan) để Duyệt Hồ sơ Ngay &rarr;
              </button>

              <button
                onClick={() => {
                  setPendingModal(null);
                  setAuthMode('continue');
                }}
                className="w-full py-2 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-semibold transition"
              >
                Đóng và quay lại màn hình chính
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Tide Mobile Passkey</h3>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center space-y-4">
              <p className="text-xs text-slate-500">
                Scan with your Tide Authenticator or camera to sign in without typing a password:
              </p>

              <div className="w-48 h-48 mx-auto bg-slate-950 p-3 rounded-2xl flex items-center justify-center shadow-lg">
                <div className="w-full h-full bg-white rounded-xl p-2 flex flex-col justify-between items-center">
                  <div className="w-full flex justify-between">
                    <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center"><div className="w-4 h-4 bg-white rounded-xs"></div></div>
                    <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center"><div className="w-4 h-4 bg-white rounded-xs"></div></div>
                  </div>
                  <div className="text-[10px] font-mono font-bold text-slate-400">PRISM::TIDE::SWE</div>
                  <div className="w-full flex justify-between">
                    <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center"><div className="w-4 h-4 bg-white rounded-xs"></div></div>
                    <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center"><div className="w-3 h-3 bg-white rounded-xs"></div></div>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                Session ID: <span className="font-mono text-slate-600">tide_sess_9a8f2c01e</span>
              </div>

              <button
                onClick={() => {
                  setShowQrModal(false);
                  handleContinue();
                }}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
              >
                Simulate QR Mobile Approval
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
