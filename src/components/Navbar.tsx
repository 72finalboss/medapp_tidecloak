"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../lib/authContext';
import { useHospital } from '../lib/hospitalContext';
import { useTheme } from '../lib/themeContext';
import { UserRole } from '../lib/types';
import {
  ShieldCheck,
  Users,
  Pill,
  ChevronDown,
  LogOut,
  Stethoscope,
  HeartPulse,
  Sparkles,
  Building2,
  LogIn,
  MessageSquareHeart,
  UserCheck,
  CalendarPlus,
  Menu,
  X,
  Home,
  Sun,
  Moon,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, activeRole, quickLogin, logout, authenticated, availableUsers } = useAuth();
  const { quorumRequests, supportTickets } = useLMSSafe();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pendingCount = quorumRequests.filter((r) => r.status === 'PENDING').length;
  const openSupportCount = supportTickets.filter((t) => t.status !== 'ĐÃ_HOÀN_TẤT').length;

  const roleLabels: Record<UserRole, { label: string; icon: any }> = {
    doctor: { label: 'Bác sĩ điều trị', icon: Stethoscope },
    pharmacist: { label: 'Dược sĩ lâm sàng', icon: Pill },
    director: { label: 'Giám đốc Y khoa', icon: Building2 },
    patient: { label: 'Bệnh nhân', icon: HeartPulse },
    ai_auditor: { label: 'Gemini Safety AI', icon: Sparkles },
  };

  const navLinks = [
    { href: '/', label: 'Trang chủ', icon: Home },
    { href: '/#departments', label: 'Chuyên khoa', icon: Building2 },
    { href: '/#doctors', label: 'Bác sĩ', icon: Stethoscope },
    {
      href: '/support',
      label: 'Hỗ trợ',
      icon: MessageSquareHeart,
      badge: openSupportCount > 0 ? openSupportCount : undefined,
    },
    {
      href: '/profile',
      label: 'Hồ sơ PII/SPII',
      icon: UserCheck,
    },
    {
      href: '/quorum',
      label: 'Hội đồng Quorum',
      icon: ShieldCheck,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    { href: '/patients', label: 'Bệnh án', icon: Users },
    { href: '/tide-security', label: 'TideCloak', icon: Sparkles },
  ];

  return (
    <>
      {/* Accessibility: Skip to Main Content Link (Tab Index #1) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2.5 focus:rounded-xl focus:bg-[#087F8C] focus:text-white focus:font-semibold focus:text-xs focus:shadow-lg"
      >
        Chuyển thẳng tới nội dung chính (Skip to content)
      </a>

      <header
        role="banner"
        className="sticky top-0 z-50 glass-surface border-b border-slate-200/80 transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 h-18">
            {/* MediCare Brand Logo (Single-Line, Never Wraps) */}
            <Link
              href="/"
              aria-label="MediCare Modern Hospital — Trang chủ"
              className="flex items-center gap-2.5 group shrink-0 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F8C] rounded-xl p-1"
            >
              <div className="w-9 h-9 rounded-xl bg-[#087F8C] flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-105 shadow-xs shrink-0">
                <HeartPulse className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="whitespace-nowrap">
                <span className="text-lg font-bold tracking-tight text-slate-900">
                  Medi<span className="text-[#087F8C]">Care</span>
                </span>
                <span className="hidden xl:block text-[10px] font-medium text-slate-500 leading-none mt-0.5">
                  Modern Hospital
                </span>
              </div>
            </Link>

            {/* Desktop Navigation — Strictly Single-Line (whitespace-nowrap) */}
            <nav
              aria-label="Điều hướng chính"
              className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0"
            >
              {navLinks.map((link) => {
                const isHashLink = link.href.includes('#');
                const isActive =
                  !isHashLink &&
                  (pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href)));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold whitespace-nowrap shrink-0 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F8C] ${
                      isActive
                        ? 'bg-[#087F8C] text-white shadow-xs'
                        : 'text-slate-700 hover:text-[#087F8C] hover:bg-[#E8F5F2]'
                    }`}
                  >
                    <span className="whitespace-nowrap">{link.label}</span>
                    {link.badge !== undefined && (
                      <span
                        aria-label={`${link.badge} mục cần xử lý`}
                        className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none rounded-full shrink-0 ${
                          isActive
                            ? 'bg-white text-[#087F8C]'
                            : 'bg-[#E8F5F2] text-[#087F8C] border border-[#087F8C]/25'
                        }`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right CTA, Theme Toggle & User Switcher — Strictly Single-Line */}
            <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
              {/* Dark / Light Theme Toggle Button (Teal/Mint instead of gray) */}
              <button
                type="button"
                onClick={toggleTheme}
                title={
                  theme === 'dark'
                    ? 'Chuyển sang Giao diện Sáng (Light Mode)'
                    : 'Chuyển sang Giao diện Tối (Dark Mode)'
                }
                aria-label={
                  theme === 'dark'
                    ? 'Chuyển sang chế độ sáng'
                    : 'Chuyển sang chế độ tối'
                }
                aria-pressed={theme === 'dark'}
                className="p-2.5 rounded-xl bg-[#E8F5F2] hover:bg-[#087F8C] border border-[#087F8C]/30 text-[#087F8C] hover:text-white transition-all duration-200 cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F8C]"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
                ) : (
                  <Moon className="w-4 h-4 transition-transform duration-300 rotate-0 hover:-rotate-12" />
                )}
              </button>

              {/* Prominent Book Appointment CTA — Single Line */}
              <Link
                href="/#appointment"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#087F8C] hover:bg-[#066670] text-white text-xs xl:text-sm font-semibold whitespace-nowrap shrink-0 transition-all duration-200 hover:-translate-y-0.5 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F8C] focus-visible:ring-offset-2"
              >
                <CalendarPlus className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="whitespace-nowrap">Đặt lịch khám</span>
              </Link>

              {/* User Profile & Role Switcher Pill (Soft Mint/Teal instead of gray) */}
              {authenticated && currentUser ? (
                <div className="relative group shrink-0">
                  <button
                    type="button"
                    aria-haspopup="true"
                    aria-label={`Tài khoản hiện tại: ${currentUser.name}, vai trò ${activeRole}. Mở menu chuyển đổi vai trò`}
                    className="flex items-center gap-2 bg-[#E8F5F2] hover:bg-[#d5ece7] border border-[#087F8C]/30 rounded-xl p-1.5 pr-2.5 transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F8C]"
                  >
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-lg object-cover border border-[#087F8C]/30 shrink-0"
                    />
                    <div className="text-left hidden md:block whitespace-nowrap">
                      <div className="text-xs font-bold text-slate-900 leading-tight max-w-[140px] truncate">
                        {currentUser.name}
                      </div>
                      <div className="text-[10px] text-[#087F8C] font-semibold leading-tight">
                        {activeRole ? roleLabels[activeRole].label : ''}
                      </div>
                    </div>
                    <ChevronDown
                      className="w-3.5 h-3.5 text-[#087F8C] transition-transform duration-200 group-hover:rotate-180 shrink-0"
                      aria-hidden="true"
                    />
                  </button>

                  {/* Clean Minimalist Translucent Dropdown */}
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-72 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 py-2 opacity-0 translate-y-1 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:visible transition-all duration-200 z-50"
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate">
                          Tài khoản (@{currentUser.username})
                        </div>
                        <div className="text-xs font-bold text-slate-900 mt-0.5 truncate">{currentUser.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">{currentUser.department}</div>
                      </div>
                      <Link
                        href="/profile"
                        className="px-2.5 py-1 rounded-lg bg-[#087F8C] text-white font-semibold text-[11px] whitespace-nowrap shrink-0 hover:bg-[#066670] transition"
                      >
                        PII / SPII
                      </Link>
                    </div>

                    <div className="px-4 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
                      Chuyển nhanh Vai trò (Test Quorum)
                    </div>

                    {Object.values(availableUsers).map((cred) => {
                      const u = cred.user;
                      const isCurrent = currentUser.id === u.id;
                      const info = roleLabels[u.role];
                      const Icon = info.icon;
                      const isPending = u.isVerified === false;
                      return (
                        <button
                          key={u.id}
                          role="menuitem"
                          disabled={isPending}
                          onClick={() => quickLogin(cred.username)}
                          className={`w-full flex items-center gap-3 px-4 py-2 text-xs transition-colors text-left cursor-pointer ${
                            isPending
                              ? 'opacity-50 cursor-not-allowed bg-slate-50'
                              : isCurrent
                              ? 'bg-[#E8F5F2] text-[#087F8C] font-semibold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="p-1.5 rounded-lg bg-[#E8F5F2] text-[#087F8C] shrink-0">
                            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-900 truncate flex items-center gap-1.5">
                              <span className="truncate">{u.name}</span>
                              {isPending && (
                                <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[9px] font-semibold shrink-0">
                                  Chờ duyệt
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">
                              {info.label} (@{cred.username})
                            </div>
                          </div>
                          {isCurrent && <span className="w-2 h-2 rounded-full bg-[#087F8C] shrink-0" />}
                        </button>
                      );
                    })}

                    <div className="pt-2 border-t border-slate-100 mt-1 px-2">
                      <Link
                        href="/prescriptions"
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-700 hover:bg-[#E8F5F2] hover:text-[#087F8C] transition font-medium"
                      >
                        <Pill className="w-4 h-4 text-[#087F8C] shrink-0" />
                        <span className="whitespace-nowrap">Quản lý Đơn thuốc & Phác đồ</span>
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          router.push('/login');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-600 hover:bg-rose-50/20 transition font-semibold cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 shrink-0" />
                        <span className="whitespace-nowrap">Đăng xuất / Đăng ký tài khoản mới</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#E8F5F2] hover:bg-[#087F8C] text-[#087F8C] hover:text-white border border-[#087F8C]/30 text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition"
                >
                  <LogIn className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">Đăng nhập</span>
                </Link>
              )}

              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl bg-[#E8F5F2] border border-[#087F8C]/30 text-[#087F8C] transition shrink-0"
                aria-label={mobileMenuOpen ? 'Đóng menu điều hướng' : 'Mở menu điều hướng'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-slate-100 space-y-1 animate-fade-up">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-[#E8F5F2] hover:text-[#087F8C] transition"
                  >
                    <span className="flex items-center gap-2.5 whitespace-nowrap">
                      <Icon className="w-4 h-4 text-[#087F8C]" />
                      {link.label}
                    </span>
                    {link.badge !== undefined && (
                      <span className="px-2 py-0.5 text-xs font-bold bg-[#E8F5F2] text-[#087F8C] rounded-full">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
              <div className="pt-2">
                <Link
                  href="/#appointment"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#087F8C] text-white text-sm font-semibold whitespace-nowrap"
                >
                  <CalendarPlus className="w-4 h-4" />
                  <span>Đặt lịch khám ngay</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}

function useLMSSafe() {
  try {
    return useHospital();
  } catch {
    return { quorumRequests: [], supportTickets: [] };
  }
}
