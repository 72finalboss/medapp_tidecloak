"use client";

import React, { useState } from "react";
import { ArrowRight, CheckCircle2, ShieldCheck, Calendar, Clock } from "lucide-react";

/* ============================================================================
 * 1. ATOMS (Button, Badge, InputField, Skeleton, ProgressiveImage)
 * ============================================================================ */

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "mint" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  isLoading = false,
  fullWidth = false,
  className = "",
  children,
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-xl whitespace-nowrap shrink-0 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F8C] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

  const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary:
      "bg-[#087F8C] hover:bg-[#066670] text-white shadow-xs hover:-translate-y-0.5",
    secondary:
      "bg-[#E8F5F2] hover:bg-[#087F8C] text-[#087F8C] hover:text-white border border-[#087F8C]/35 hover:-translate-y-0.5",
    mint:
      "bg-[#E8F5F2] hover:bg-[#087F8C] text-[#087F8C] hover:text-white border border-[#087F8C]/25",
    ghost:
      "bg-transparent hover:bg-[#E8F5F2] text-[#087F8C] hover:text-[#066670]",
    danger:
      "bg-rose-600 hover:bg-rose-700 text-white shadow-xs",
  };

  const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
    sm: "px-3.5 py-2 text-xs min-h-[38px]",
    md: "px-5 py-2.5 text-xs sm:text-sm min-h-[42px]",
    lg: "px-6 py-3.5 text-sm min-h-[48px]",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <span
          className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0"
          aria-hidden="true"
        />
      ) : (
        leftIcon
      )}
      <span className="whitespace-nowrap">{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};

export interface BadgeProps {
  variant?: "teal" | "mint" | "success" | "warning" | "danger" | "neutral";
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "mint",
  icon,
  children,
  className = "",
}) => {
  const styles: Record<NonNullable<BadgeProps["variant"]>, string> = {
    teal: "bg-[#087F8C] text-white",
    mint: "bg-[#E8F5F2] text-[#087F8C] border border-[#087F8C]/25",
    success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30",
    danger: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30",
    neutral: "bg-[#E8F5F2] text-[#087F8C] border border-[#087F8C]/20",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${styles[variant]} ${className}`}
    >
      {icon}
      <span className="whitespace-nowrap">{children}</span>
    </span>
  );
};

export interface SkeletonProps {
  className?: string;
  label?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "h-4 w-full",
  label = "Đang tải nội dung...",
}) => (
  <div
    role="status"
    aria-label={label}
    className={`animate-pulse rounded-xl bg-[#E8F5F2] ${className}`}
  />
);

export interface ProgressiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  aspectRatioClass?: string;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  alt,
  aspectRatioClass = "aspect-[4/3]",
  className = "",
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-[#E8F5F2]/50 ${aspectRatioClass}`}>
      {!loaded && (
        <div
          className="absolute inset-0 animate-pulse bg-[#E8F5F2]"
          aria-hidden="true"
        />
      )}
      <img
        src={src}
        alt={alt || ""}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-all duration-500 ${
          loaded ? "opacity-100 scale-100" : "opacity-0 scale-[1.02]"
        } ${className}`}
        {...props}
      />
    </div>
  );
};

/* ============================================================================
 * 2. MOLECULES (DepartmentCard, DoctorCard, DoctorCardSkeleton, StepPill)
 * ============================================================================ */

export interface DepartmentCardProps {
  id: string;
  name: string;
  englishName: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  doctorCount: number;
  floor: string;
  onSelectDepartment: (id: string) => void;
}

export const DepartmentCard: React.FC<DepartmentCardProps> = ({
  id,
  name,
  englishName,
  description,
  icon: Icon,
  doctorCount,
  floor,
  onSelectDepartment,
}) => (
  <article
    className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-[#087F8C] hover-lift flex flex-col justify-between space-y-5 focus-within:ring-2 focus-within:ring-[#087F8C]"
    aria-labelledby={`dept-title-${id}`}
  >
    <div className="space-y-3.5">
      <div className="flex items-center justify-between gap-2">
        <div
          className="w-11 h-11 rounded-xl bg-[#E8F5F2] text-[#087F8C] border border-[#087F8C]/20 flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <Icon className="w-5 h-5" />
        </div>
        <span className="px-2.5 py-1 rounded-full bg-[#E8F5F2] text-[#087F8C] text-[11px] font-semibold whitespace-nowrap">
          {englishName}
        </span>
      </div>

      <div>
        <h3 id={`dept-title-${id}`} className="text-base sm:text-lg font-bold text-slate-900 truncate">
          {name}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>
    </div>

    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
      <span className="text-slate-500 whitespace-nowrap truncate">
        {doctorCount} Bác sĩ • {floor}
      </span>
      <button
        type="button"
        onClick={() => onSelectDepartment(id)}
        aria-label={`Xem danh sách bác sĩ thuộc chuyên khoa ${name}`}
        className="px-3 py-1.5 rounded-lg bg-[#E8F5F2] hover:bg-[#087F8C] text-[#087F8C] hover:text-white font-semibold whitespace-nowrap shrink-0 inline-flex items-center gap-1 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F8C]"
      >
        <span>Xem Bác sĩ</span>
        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
      </button>
    </div>
  </article>
);

export interface DoctorCardData {
  id: string;
  name: string;
  specialtyId: string;
  specialtyName: string;
  title: string;
  experienceYears: number;
  licenseNumber: string;
  education: string;
  schedule: string;
  avatar: string;
  bio: string;
}

export interface DoctorCardProps {
  doctor: DoctorCardData;
  onViewProfile: (doctor: DoctorCardData) => void;
  onBookAppointment: (doctor: DoctorCardData) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  onViewProfile,
  onBookAppointment,
}) => (
  <article
    className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-[#087F8C] hover-lift flex flex-col justify-between group"
    aria-labelledby={`doc-name-${doctor.id}`}
  >
    <div>
      <div className="relative">
        <ProgressiveImage
          src={doctor.avatar}
          alt={`Chân dung ${doctor.name} — ${doctor.specialtyName}`}
          aspectRatioClass="h-56 w-full"
          className="object-top group-hover:scale-105"
        />
        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-[#087F8C] text-white text-[11px] font-semibold whitespace-nowrap shadow-xs">
          {doctor.experienceYears} năm KN
        </span>
        <span
          className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg glass-surface text-slate-900 text-[10px] font-mono font-semibold border border-[#087F8C]/30 inline-flex items-center gap-1 whitespace-nowrap"
          title="Chứng chỉ Hành nghề đã được xác thực đa bên"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#087F8C] shrink-0" />
          {doctor.licenseNumber}
        </span>
      </div>

      <div className="p-5 space-y-2.5">
        <div className="text-xs font-semibold text-[#087F8C] truncate">
          {doctor.specialtyName}
        </div>
        <div>
          <h3 id={`doc-name-${doctor.id}`} className="text-base sm:text-lg font-bold text-slate-900 truncate">
            {doctor.name}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{doctor.title}</p>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{doctor.bio}</p>
        <div className="pt-1.5 flex items-center gap-1.5 text-[11px] text-slate-500 truncate">
          <Clock className="w-3.5 h-3.5 text-[#087F8C] shrink-0" />
          <span className="truncate">{doctor.schedule}</span>
        </div>
      </div>
    </div>

    <div className="px-5 pb-5 pt-2 grid grid-cols-2 gap-2.5">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => onViewProfile(doctor)}
        aria-label={`Xem hồ sơ chi tiết của ${doctor.name}`}
      >
        Xem Hồ sơ
      </Button>
      <Button
        type="button"
        variant="primary"
        size="sm"
        leftIcon={<Calendar className="w-3.5 h-3.5 shrink-0" />}
        onClick={() => onBookAppointment(doctor)}
        aria-label={`Đặt lịch khám với ${doctor.name}`}
      >
        Đặt lịch
      </Button>
    </div>
  </article>
);

export const DoctorCardSkeleton: React.FC = () => (
  <div
    className="bg-white rounded-2xl border border-slate-200 overflow-hidden p-0 flex flex-col justify-between"
    aria-hidden="true"
  >
    <Skeleton className="h-56 w-full rounded-none" />
    <div className="p-5 space-y-3">
      <Skeleton className="h-3.5 w-1/2" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-10 w-full" />
      <div className="pt-3 grid grid-cols-2 gap-2.5">
        <Skeleton className="h-9" />
        <Skeleton className="h-9" />
      </div>
    </div>
  </div>
);

export interface BookingStepHeaderProps {
  currentStep: 1 | 2 | 3;
}

export const BookingStepHeader: React.FC<BookingStepHeaderProps> = ({ currentStep }) => {
  const steps = [
    { step: 1, label: "1. Chuyên khoa & Bác sĩ" },
    { step: 2, label: "2. Ngày giờ khám" },
    { step: 3, label: "3. Thông tin Bệnh nhân" },
  ];

  return (
    <nav aria-label="Tiến trình đặt lịch khám" className="mb-6">
      <ol className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {steps.map((s) => {
          const isCompleted = currentStep > s.step;
          const isCurrent = currentStep === s.step;
          return (
            <li
              key={s.step}
              aria-current={isCurrent ? "step" : undefined}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                isCurrent
                  ? "bg-[#087F8C] border-[#087F8C] text-white shadow-xs"
                  : isCompleted
                  ? "bg-[#E8F5F2] border-[#087F8C]/30 text-[#087F8C]"
                  : "bg-[#E8F5F2]/50 border-[#087F8C]/15 text-slate-600"
              }`}
            >
              {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
              <span className="truncate">{s.label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
