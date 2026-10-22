"use client";

import React from 'react';
import Link from 'next/link';
import {
  HeartPulse,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';

export function Footer() {
  return (
    <footer role="contentinfo" className="bg-white border-t border-slate-200 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#087F8C] flex items-center justify-center text-white">
                <HeartPulse className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Medi<span className="text-[#087F8C]">Care</span>
                </span>
                <span className="block text-[11px] font-medium text-slate-500">
                  Modern Hospital • AegisMed Clinical Platform
                </span>
              </div>
            </Link>

            <p className="text-sm text-slate-600 leading-relaxed max-w-sm">
              Chăm sóc y tế chuẩn mực lấy bệnh nhân làm trung tâm, kết hợp đội ngũ chuyên gia đầu ngành và công nghệ bảo vệ dữ liệu bệnh án đa chữ ký TideCloak.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#E8F5F2] text-[#087F8C] text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              <span>Bảo mật Hồ sơ Y tế Chuẩn Hermetic E2EE</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Dịch vụ & Chuyên khoa
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>
                <Link href="/#departments" className="hover:text-[#087F8C] transition">
                  Tim mạch Can thiệp (Cardiology)
                </Link>
              </li>
              <li>
                <Link href="/#departments" className="hover:text-[#087F8C] transition">
                  Thần kinh & Đột quỵ (Neurology)
                </Link>
              </li>
              <li>
                <Link href="/#departments" className="hover:text-[#087F8C] transition">
                  Nhi khoa Toàn diện (Pediatrics)
                </Link>
              </li>
              <li>
                <Link href="/#departments" className="hover:text-[#087F8C] transition">
                  Chấn thương Chỉnh hình (Orthopedics)
                </Link>
              </li>
              <li>
                <Link href="/#departments" className="hover:text-[#087F8C] transition">
                  Cấp cứu & Hồi sức 24/7
                </Link>
              </li>
            </ul>
          </div>

          {/* Clinical & Patient Portal Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Cổng Thông tin Điện tử
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>
                <Link href="/#doctors" className="hover:text-[#087F8C] transition">
                  Tìm Bác sĩ & Chuyên gia
                </Link>
              </li>
              <li>
                <Link href="/#appointment" className="hover:text-[#087F8C] transition">
                  Đặt lịch khám trực tuyến
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-[#087F8C] transition">
                  Báo cáo Triệu chứng & Hỏi đáp
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-[#087F8C] transition">
                  Hồ sơ Cá nhân (PII & SPII 1-Lần)
                </Link>
              </li>
              <li>
                <Link href="/quorum" className="hover:text-[#087F8C] transition">
                  Hội đồng Thẩm định Quorum
                </Link>
              </li>
              <li>
                <Link href="/patients" className="hover:text-[#087F8C] transition">
                  Hồ sơ Bệnh án Nội trú
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Liên hệ & Cấp cứu
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#087F8C] shrink-0 mt-0.5" aria-hidden="true" />
                <span>108 Đại lộ Y Học, Quận 1, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#087F8C] shrink-0" aria-hidden="true" />
                <span>Tổng đài: (028) 3822 9999 • Cấp cứu: 115</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#087F8C] shrink-0" aria-hidden="true" />
                <span>care@medicare-aegis.vn</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#087F8C] shrink-0 mt-0.5" aria-hidden="true" />
                <span>Khám thường: 07:00 – 19:00 (T2–T7) • Cấp cứu: 24/7</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} MediCare Modern Hospital (AegisMed). Bảo lưu mọi quyền.</p>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/tide-security" className="hover:text-[#087F8C] transition flex items-center gap-1">
              <span>Chính sách Bảo mật SPII</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
            <Link href="/quorum" className="hover:text-[#087F8C] transition">
              Quy tắc Đồng thuận Y khoa
            </Link>
            <Link href="/login" className="hover:text-[#087F8C] transition">
              Cổng Nhân sự & Bệnh nhân
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
