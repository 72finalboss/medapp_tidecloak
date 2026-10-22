"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuth } from '../lib/authContext';
import { useHospital } from '../lib/hospitalContext';
import {
  Button,
  Badge,
  DepartmentCard,
  DoctorCard,
  DoctorCardData,
  DoctorCardSkeleton,
  ProgressiveImage,
  BookingStepHeader,
} from '../components/ui/AtomicComponents';
import designTokens from '../design-system/tokens.json';
import {
  HeartPulse,
  Brain,
  Baby,
  Bone,
  Ambulance,
  Pill,
  Search,
  Calendar,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  ArrowRight,
  Stethoscope,
  ShieldCheck,
  Award,
  Users,
  Star,
  Navigation,
  UserCheck,
  MessageSquareHeart,
  X,
  AlertCircle,
  Layers,
} from 'lucide-react';

interface DepartmentItem {
  id: string;
  name: string;
  englishName: string;
  description: string;
  icon: any;
  doctorCount: number;
  floor: string;
}

const DEPARTMENTS: DepartmentItem[] = [
  {
    id: 'cardiology',
    name: 'Tim mạch Can thiệp',
    englishName: 'Cardiology',
    description: 'Chẩn đoán, điều trị bệnh lý mạch vành, suy tim và can thiệp tim mạch ít xâm lấn.',
    icon: HeartPulse,
    doctorCount: 18,
    floor: 'Tầng 3, Khu A',
  },
  {
    id: 'neurology',
    name: 'Thần kinh & Đột quỵ',
    englishName: 'Neurology',
    description: 'Tầm soát đột quỵ cấp, điều trị rối loạn thần kinh trung ương và phục hồi chức năng não bộ.',
    icon: Brain,
    doctorCount: 14,
    floor: 'Tầng 4, Khu A',
  },
  {
    id: 'pediatrics',
    name: 'Nhi khoa Toàn diện',
    englishName: 'Pediatrics',
    description: 'Chăm sóc sức khỏe trẻ sơ sinh và trẻ nhỏ, tiêm chủng và dinh dưỡng lâm sàng chuyên sâu.',
    icon: Baby,
    doctorCount: 22,
    floor: 'Tầng 2, Khu B',
  },
  {
    id: 'orthopedics',
    name: 'Chấn thương Chỉnh hình',
    englishName: 'Orthopedics',
    description: 'Phẫu thuật nội soi khớp, thay khớp nhân tạo và phục hồi vận động thể thao hiện đại.',
    icon: Bone,
    doctorCount: 16,
    floor: 'Tầng 5, Khu B',
  },
  {
    id: 'emergency',
    name: 'Cấp cứu & Hồi sức 24/7',
    englishName: 'Emergency Care',
    description: 'Tiếp nhận cấp cứu đa chấn thương, hồi sức tích cực (ICU) hoạt động liên tục 24/7.',
    icon: Ambulance,
    doctorCount: 25,
    floor: 'Tầng 1, Khu Cấp cứu',
  },
  {
    id: 'pharmacy',
    name: 'Dược Lâm sàng & Hội chẩn',
    englishName: 'Clinical Pharmacy',
    description: 'Kiểm soát tương tác thuốc bằng AI và niêm phong phác đồ đa chữ ký TideCloak.',
    icon: Pill,
    doctorCount: 12,
    floor: 'Tầng 1, Khu Trung tâm',
  },
];

const DOCTORS_LIST: DoctorCardData[] = [
  {
    id: 'doc_1',
    name: 'BS.CKII Nguyễn Văn Hùng',
    specialtyId: 'cardiology',
    specialtyName: 'Tim mạch Can thiệp (Cardiology)',
    title: 'Trưởng khoa Tim mạch Can thiệp',
    experienceYears: 18,
    licenseNumber: 'CCHN-00892/BYT',
    education: 'Tiến sĩ Y khoa, Đại học Y Dược TP.HCM & Tu nghiệp Pháp',
    schedule: 'Thứ 2 – Thứ 6 (07:30 – 16:30)',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&auto=format&fit=crop&q=80',
    bio: 'Chuyên gia hàng đầu về can thiệp động mạch vành qua da, đặt stent và điều trị suy tim mạn tính theo phác đồ cá thể hóa.',
  },
  {
    id: 'doc_2',
    name: 'BS. Trương Nguyễn Xuân Vinh',
    specialtyId: 'emergency',
    specialtyName: 'Cấp cứu & Hồi sức 24/7 (Emergency Care)',
    title: 'Bác sĩ Chuyên khoa Cấp cứu & Hồi sức',
    experienceYears: 12,
    licenseNumber: 'CCHN-00777/BYT',
    education: 'Bác sĩ Chuyên khoa I Hồi sức Cấp cứu, ĐH Y Dược',
    schedule: 'Thứ 2 – Thứ 7 (Ca trực 24/7)',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=600&auto=format&fit=crop&q=80',
    bio: 'Trực tiếp điều phối các ca cấp cứu tim phổi, sốc phản vệ và quản lý phác đồ điều trị nội trú tích cực.',
  },
  {
    id: 'doc_3',
    name: 'PGS.TS.BS Lê Minh Tâm',
    specialtyId: 'neurology',
    specialtyName: 'Thần kinh & Đột quỵ (Neurology)',
    title: 'Chuyên gia Đầu ngành Nội Thần kinh',
    experienceYears: 22,
    licenseNumber: 'CCHN-00219/BYT',
    education: 'Phó Giáo sư, Tiến sĩ Nội Thần kinh',
    schedule: 'Thứ 2, Thứ 4, Thứ 6 (08:00 – 17:00)',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&auto=format&fit=crop&q=80',
    bio: 'Hơn 20 năm kinh nghiệm trong can thiệp đột quỵ não giờ vàng, điều trị đau nửa đầu mạn tính và bệnh Parkinson.',
  },
  {
    id: 'doc_4',
    name: 'ThS.BS Phạm Hoàng Yến',
    specialtyId: 'pediatrics',
    specialtyName: 'Nhi khoa Toàn diện (Pediatrics)',
    title: 'Phó Trưởng khoa Nhi Tổng hợp',
    experienceYears: 14,
    licenseNumber: 'CCHN-00541/BYT',
    education: 'Thạc sĩ Nhi khoa, Bệnh viện Nhi Đồng & ĐH Y khoa Phạm Ngọc Thạch',
    schedule: 'Thứ 2 – Thứ 7 (07:30 – 17:00)',
    avatar: 'https://images.unsplash.com/photo-1594824813626-d62f8ea3b9b4?w=600&auto=format&fit=crop&q=80',
    bio: 'Tận tâm trong khám chữa bệnh hô hấp, tiêu hóa nhi khoa và tư vấn phát triển thể chất toàn diện cho trẻ nhỏ.',
  },
  {
    id: 'doc_5',
    name: 'TS.BS Đặng Quốc Khánh',
    specialtyId: 'orthopedics',
    specialtyName: 'Chấn thương Chỉnh hình (Orthopedics)',
    title: 'Trưởng đơn vị Phẫu thuật Nội soi Khớp',
    experienceYears: 16,
    licenseNumber: 'CCHN-00633/BYT',
    education: 'Tiến sĩ Chấn thương Chỉnh hình, Tu nghiệp tại Đức',
    schedule: 'Thứ 3, Thứ 5, Thứ 7 (08:00 – 16:30)',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&auto=format&fit=crop&q=80',
    bio: 'Chuyên sâu về tái tạo dây chằng chéo, thay khớp gối – khớp háng ít xâm lấn giúp bệnh nhân đi lại sớm sau 48 giờ.',
  },
  {
    id: 'doc_6',
    name: 'DS.CKI Lê Thu Thảo',
    specialtyId: 'pharmacy',
    specialtyName: 'Dược Lâm sàng & Hội chẩn (Clinical Pharmacy)',
    title: 'Dược sĩ Trưởng Thẩm định Thuốc',
    experienceYears: 11,
    licenseNumber: 'CCHND-00412/BYT',
    education: 'Dược sĩ Chuyên khoa I Dược Lâm sàng',
    schedule: 'Thứ 2 – Thứ 7 (07:30 – 17:00)',
    avatar: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=600&auto=format&fit=crop&q=80',
    bio: 'Phụ trách đối chiếu tương tác thuốc, cá thể hóa liều kháng sinh và phê duyệt đa chữ ký trong Hội đồng Quorum.',
  },
];

const TESTIMONIALS = [
  {
    id: 't1',
    patientName: 'Chị Nguyễn Thị Mai (42 tuổi)',
    specialty: 'Khoa Tim mạch Can thiệp',
    quote:
      'Quy trình đặt lịch rất nhanh gọn, không phải chờ đợi lâu. Bác sĩ Hùng giải thích cặn kẽ từng chỉ số xét nghiệm và mọi đơn thuốc đều được dược sĩ kiểm tra chéo nên tôi hoàn toàn yên tâm.',
    rating: 5,
  },
  {
    id: 't2',
    patientName: 'Anh Trần Hoàng Nam (35 tuổi)',
    specialty: 'Khoa Chấn thương Chỉnh hình',
    quote:
      'Không gian bệnh viện yên tĩnh, sạch sẽ và tối giản. Đặc biệt tính năng hỏi đáp trực tuyến với bác sĩ và bảo mật hồ sơ cá nhân PII/SPII khiến tôi cảm thấy quyền riêng tư được tôn trọng tuyệt đối.',
    rating: 5,
  },
  {
    id: 't3',
    patientName: 'Bác Lê Văn Hòa (68 tuổi)',
    specialty: 'Đơn vị Thần kinh & Đột quỵ',
    quote:
      'Đội ngũ cấp cứu và điều dưỡng chăm sóc tận tình như người nhà. Sau 5 ngày điều trị nội trú, sức khỏe của tôi đã phục hồi rất tốt.',
    rating: 5,
  },
];

export default function HospitalHomePage() {
  const { currentUser } = useAuth();
  const { patients, quorumRequests, supportTickets, createSupportTicket } = useHospital();

  // Doctor Search, Specialty Filter & Perceived Performance Skeleton State
  const [doctorSearch, setDoctorSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [isFilteringDoctors, setIsFilteringDoctors] = useState(false);
  const [activeDoctorModal, setActiveDoctorModal] = useState<DoctorCardData | null>(null);
  const [showDesignSystemModal, setShowDesignSystemModal] = useState(false);

  // Appointment Form State
  const [apptName, setApptName] = useState(currentUser?.name || '');
  const [apptPhone, setApptPhone] = useState(currentUser?.pii?.phone || '');
  const [apptDepartment, setApptDepartment] = useState('cardiology');
  const [apptDoctor, setApptDoctor] = useState('BS.CKII Nguyễn Văn Hùng');
  const [apptDate, setApptDate] = useState('');
  const [apptTime, setApptTime] = useState('08:30');
  const [apptNotes, setApptNotes] = useState('');
  const [apptError, setApptError] = useState('');
  const [isSubmittingAppt, setIsSubmittingAppt] = useState(false);
  const [apptSuccess, setApptSuccess] = useState<{
    bookingCode: string;
    patientName: string;
    doctorName: string;
    departmentName: string;
    date: string;
    time: string;
  } | null>(null);

  const pendingQuorumCount = quorumRequests.filter((r) => r.status === 'PENDING').length;
  const openSupportCount = supportTickets.filter((t) => t.status !== 'ĐÃ_HOÀN_TẤT').length;

  // Trigger progressive skeleton transition when changing specialty filter
  const handleSelectSpecialtyWithSkeleton = (specId: string) => {
    setSelectedSpecialty(specId);
    setIsFilteringDoctors(true);
    setTimeout(() => {
      setIsFilteringDoctors(false);
    }, 260);
  };

  // Filtered Doctors
  const filteredDoctors = useMemo(() => {
    return DOCTORS_LIST.filter((doc) => {
      const matchesSpecialty =
        selectedSpecialty === 'all' || doc.specialtyId === selectedSpecialty;
      const q = doctorSearch.trim().toLowerCase();
      const matchesQuery =
        !q ||
        doc.name.toLowerCase().includes(q) ||
        doc.specialtyName.toLowerCase().includes(q) ||
        doc.title.toLowerCase().includes(q);
      return matchesSpecialty && matchesQuery;
    });
  }, [doctorSearch, selectedSpecialty]);

  // Doctors available in the Appointment Form department dropdown
  const appointmentDoctors = useMemo(() => {
    const matching = DOCTORS_LIST.filter((d) => d.specialtyId === apptDepartment);
    return matching.length > 0 ? matching : DOCTORS_LIST;
  }, [apptDepartment]);

  // Determine current active step for BookingStepHeader
  const activeBookingStep: 1 | 2 | 3 = apptName && apptPhone ? 3 : apptDate ? 2 : 1;

  const handleSelectDoctorForBooking = (doc: DoctorCardData) => {
    setApptDepartment(doc.specialtyId);
    setApptDoctor(doc.name);
    setActiveDoctorModal(null);
    const el = document.getElementById('appointment');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    setApptError('');

    if (!apptName.trim() || !apptPhone.trim() || !apptDate) {
      setApptError('Vui lòng điền đầy đủ Họ tên, Số điện thoại và Ngày khám mong muốn.');
      return;
    }

    const phoneRegex = /^[0-9+\s()-]{8,15}$/;
    if (!phoneRegex.test(apptPhone.trim())) {
      setApptError('Số điện thoại không hợp lệ (vui lòng nhập từ 8–15 chữ số).');
      return;
    }

    setIsSubmittingAppt(true);
    setTimeout(() => {
      const deptObj = DEPARTMENTS.find((d) => d.id === apptDepartment);
      const bookingCode = `MC-${Math.floor(100000 + Math.random() * 900000)}`;

      createSupportTicket(
        'HỎI_ĐÁP_BÁC_SĨ',
        'Bình thường',
        `[Đặt lịch khám #${bookingCode}] ${deptObj?.name || apptDepartment} — ${apptDoctor}`,
        `Bệnh nhân ${apptName.trim()} (SĐT: ${apptPhone.trim()}) đặt lịch khám ngày ${apptDate} lúc ${apptTime} với ${apptDoctor}. Ghi chú triệu chứng: ${
          apptNotes.trim() || 'Khám kiểm tra chuyên khoa định kỳ.'
        }`
      );

      setIsSubmittingAppt(false);
      setApptSuccess({
        bookingCode,
        patientName: apptName.trim(),
        doctorName: apptDoctor,
        departmentName: deptObj?.name || apptDepartment,
        date: apptDate,
        time: apptTime,
      });
    }, 320);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B1120] text-slate-900 flex flex-col transition-colors duration-300">
      {/* 1. NAVBAR */}
      <Navbar />

      {/* Subtle Clinical Governance & Design System Status Bar */}
      <div className="bg-[#E8F5F2] border-b border-[#087F8C]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700 whitespace-nowrap overflow-x-auto">
            <ShieldCheck className="w-4 h-4 text-[#087F8C] shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">
              <strong>MediCare & TideCloak Quorum</strong>: Đang theo dõi{' '}
              <strong>{patients.length} bệnh nhân nội trú</strong> •{' '}
              <strong>{pendingQuorumCount} yêu cầu chờ Hội đồng</strong> •{' '}
              <strong>{openSupportCount} câu hỏi hỗ trợ</strong>
            </span>
          </div>
          <div className="flex items-center gap-3 font-semibold text-[#087F8C] whitespace-nowrap shrink-0">
            <button
              type="button"
              onClick={() => setShowDesignSystemModal(true)}
              className="px-2.5 py-1 rounded-lg bg-white/80 hover:bg-[#087F8C] text-[#087F8C] hover:text-white border border-[#087F8C]/25 inline-flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>Design Tokens</span>
            </button>
            <Link
              href="/profile"
              className="px-2.5 py-1 rounded-lg bg-white/80 hover:bg-[#087F8C] text-[#087F8C] hover:text-white border border-[#087F8C]/25 inline-flex items-center gap-1.5 transition whitespace-nowrap"
            >
              <UserCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Hồ sơ PII/SPII</span>
            </Link>
            <Link
              href="/quorum"
              className="px-2.5 py-1 rounded-lg bg-[#087F8C] hover:bg-[#066670] text-white inline-flex items-center gap-1.5 transition whitespace-nowrap"
            >
              <span>Quorum ({pendingQuorumCount})</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </Link>
          </div>
        </div>
      </div>

      <main id="main-content" className="flex-1 animate-fade-up">
        {/* 2. HERO SECTION */}
        <section aria-labelledby="hero-heading" className="py-14 sm:py-22 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Content */}
              <div className="lg:col-span-6 space-y-6">
                <Badge variant="mint" icon={<HeartPulse className="w-3.5 h-3.5" />}>
                  MediCare Modern Hospital • Chăm sóc Tận tâm & An toàn
                </Badge>

                <h1
                  id="hero-heading"
                  className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]"
                >
                  Chăm sóc y tế hiện đại vì{' '}
                  <span className="text-[#087F8C]">sự an tâm trọn vẹn</span> của người bệnh.
                </h1>

                <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                  MediCare kết hợp đội ngũ chuyên gia y khoa đầu ngành, quy trình đặt lịch tối giản và kiến trúc bảo mật hồ sơ bệnh án đa chữ ký TideCloak — mang lại trải nghiệm khám chữa bệnh nhẹ nhàng, minh bạch và đáng tin cậy.
                </p>

                <div className="flex flex-wrap items-center gap-3.5 pt-2">
                  <a
                    href="#appointment"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#087F8C] hover:bg-[#066670] text-white text-sm font-semibold whitespace-nowrap shrink-0 transition-all duration-200 hover:-translate-y-0.5 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F8C] focus-visible:ring-offset-2"
                  >
                    <Calendar className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span className="whitespace-nowrap">Đặt lịch khám ngay</span>
                  </a>
                  <a
                    href="#doctors"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#E8F5F2] hover:bg-[#087F8C] text-[#087F8C] hover:text-white border border-[#087F8C]/35 text-sm font-semibold whitespace-nowrap shrink-0 transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F8C]"
                  >
                    <Stethoscope className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span className="whitespace-nowrap">Tìm Bác sĩ Chuyên khoa</span>
                  </a>
                </div>

                {/* Minimal Trust Metrics */}
                <div className="pt-6 border-t border-slate-100 grid grid-cols-3 gap-6 max-w-lg">
                  <div>
                    <div className="text-2xl font-bold text-slate-900">150+</div>
                    <div className="text-xs text-slate-500 mt-0.5">Bác sĩ Xác thực CCHN</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#087F8C]">24/7</div>
                    <div className="text-xs text-slate-500 mt-0.5">Cấp cứu & Hồi sức</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">100%</div>
                    <div className="text-xs text-slate-500 mt-0.5">Bảo mật SPII 1-Lần</div>
                  </div>
                </div>
              </div>

              {/* Right Healthcare Imagery with Layout Stability */}
              <div className="lg:col-span-6">
                <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-[#E8F5F2]/40 p-3 hover-lift">
                  <ProgressiveImage
                    src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&auto=format&fit=crop&q=80"
                    alt="Không gian khám chữa bệnh hiện đại, tràn ngập ánh sáng tự nhiên tại MediCare"
                    aspectRatioClass="h-[360px] sm:h-[430px] w-full rounded-2xl"
                    className="rounded-2xl"
                  />
                  {/* Minimal Translucent Glass Floating Card */}
                  <div className="mt-3 sm:mt-0 sm:absolute sm:bottom-7 sm:left-7 sm:right-7 glass-surface border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#E8F5F2] text-[#087F8C] flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          Bảo vệ Dữ liệu Bệnh nhân Đa chữ ký (Quorum M-of-N)
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Mọi đơn thuốc đặc biệt & trích xuất SPII đều được kiểm soát chéo an toàn.
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/profile"
                      className="text-xs font-semibold text-[#087F8C] hover:underline shrink-0 flex items-center gap-1"
                    >
                      <span>Xem Hồ sơ PII/SPII</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. QUICK ACTIONS */}
        <section aria-label="Thao tác nhanh" className="py-12 bg-[#E8F5F2]/40 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <a
                href="#doctors"
                className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-[#087F8C] hover-lift flex items-start justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F8C]"
              >
                <div className="space-y-1.5">
                  <div className="w-11 h-11 rounded-xl bg-[#E8F5F2] text-[#087F8C] flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-105">
                    <Search className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900 group-hover:text-[#087F8C] transition">
                    Tìm Bác sĩ
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Tra cứu chuyên gia theo chuyên khoa, kinh nghiệm và lịch khám.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#087F8C] group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
              </a>

              <a
                href="#appointment"
                className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-[#087F8C] hover-lift flex items-start justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F8C]"
              >
                <div className="space-y-1.5">
                  <div className="w-11 h-11 rounded-xl bg-[#E8F5F2] text-[#087F8C] flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-105">
                    <Calendar className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900 group-hover:text-[#087F8C] transition">
                    Đặt lịch khám
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Đặt hẹn trực tuyến nhanh chóng, nhận mã xác nhận tức thì.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#087F8C] group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
              </a>

              <a
                href="#departments"
                className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-[#087F8C] hover-lift flex items-start justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F8C]"
              >
                <div className="space-y-1.5">
                  <div className="w-11 h-11 rounded-xl bg-[#E8F5F2] text-[#087F8C] flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-105">
                    <Stethoscope className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900 group-hover:text-[#087F8C] transition">
                    Chuyên khoa
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Khám phá 6 chuyên khoa mũi nhọn đạt tiêu chuẩn quốc tế.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#087F8C] group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
              </a>

              <Link
                href="/support"
                className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-[#087F8C] hover-lift flex items-start justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F8C]"
              >
                <div className="space-y-1.5">
                  <div className="w-11 h-11 rounded-xl bg-[#E8F5F2] text-[#087F8C] flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-105">
                    <MessageSquareHeart className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900 group-hover:text-[#087F8C] transition">
                    Hỏi đáp & Báo cáo Y tế
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Gửi báo cáo triệu chứng hoặc đặt câu hỏi để bác sĩ hỗ trợ.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#087F8C] group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
              </Link>
            </div>
          </div>
        </section>

        {/* 4. DEPARTMENTS SECTION (Using Atomic DepartmentCard) */}
        <section id="departments" aria-labelledby="dept-heading" className="py-20 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-wider text-[#087F8C]">
                  Chuyên khoa Mũi nhọn
                </span>
                <h2 id="dept-heading" className="text-3xl font-bold text-slate-900 tracking-tight">
                  Các Chuyên khoa Lâm sàng Toàn diện
                </h2>
                <p className="text-sm text-slate-600">
                  Mỗi chuyên khoa được vận hành bởi đội ngũ bác sĩ chuyên sâu, quy trình hội chẩn chuẩn xác và hệ thống theo dõi bệnh án điện tử khép kín.
                </p>
              </div>
              <Link
                href="/patients"
                className="text-sm font-semibold text-[#087F8C] hover:underline inline-flex items-center gap-1.5"
              >
                <span>Xem Danh sách Bệnh án Nội trú</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {DEPARTMENTS.map((dept) => (
                <DepartmentCard
                  key={dept.id}
                  id={dept.id}
                  name={dept.name}
                  englishName={dept.englishName}
                  description={dept.description}
                  icon={dept.icon}
                  doctorCount={dept.doctorCount}
                  floor={dept.floor}
                  onSelectDepartment={(deptId) => {
                    handleSelectSpecialtyWithSkeleton(deptId);
                    const el = document.getElementById('doctors');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 5. OUR DOCTORS SECTION (With Search, Filter & Perceived Performance Skeletons) */}
        <section
          id="doctors"
          aria-labelledby="doctors-heading"
          className="py-20 bg-slate-50/50 border-b border-slate-100"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-wider text-[#087F8C]">
                  Đội ngũ Chuyên gia
                </span>
                <h2 id="doctors-heading" className="text-3xl font-bold text-slate-900 tracking-tight">
                  Tìm Bác sĩ & Chuyên gia Y tế
                </h2>
                <p className="text-sm text-slate-600">
                  100% bác sĩ và dược sĩ tại MediCare đều được xác thực Chứng chỉ Hành nghề Quốc gia qua cơ chế đồng thuận đa bên trước khi cấp quyền hành nghề.
                </p>
              </div>

              {/* Accessible Search Input */}
              <div className="w-full md:w-80 relative">
                <Search
                  className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={doctorSearch}
                  onChange={(e) => setDoctorSearch(e.target.value)}
                  placeholder="Tìm theo tên bác sĩ hoặc chuyên khoa..."
                  aria-label="Tìm kiếm bác sĩ theo tên hoặc chuyên khoa"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#087F8C]"
                />
              </div>
            </div>

            {/* Specialty Filter Pills with ARIA radiogroup semantics */}
            <div
              role="group"
              aria-label="Lọc bác sĩ theo chuyên khoa"
              className="flex items-center gap-2.5 overflow-x-auto pb-2"
            >
              <button
                type="button"
                aria-pressed={selectedSpecialty === 'all'}
                onClick={() => handleSelectSpecialtyWithSkeleton('all')}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F8C] ${
                  selectedSpecialty === 'all'
                    ? 'bg-[#087F8C] text-white shadow-xs'
                    : 'bg-[#E8F5F2] text-[#087F8C] border border-[#087F8C]/25 hover:bg-[#087F8C] hover:text-white'
                }`}
              >
                Tất cả Chuyên khoa ({DOCTORS_LIST.length})
              </button>
              {DEPARTMENTS.map((dept) => (
                <button
                  key={dept.id}
                  type="button"
                  aria-pressed={selectedSpecialty === dept.id}
                  onClick={() => handleSelectSpecialtyWithSkeleton(dept.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F8C] ${
                    selectedSpecialty === dept.id
                      ? 'bg-[#087F8C] text-white shadow-xs'
                      : 'bg-[#E8F5F2] text-[#087F8C] border border-[#087F8C]/25 hover:bg-[#087F8C] hover:text-white'
                  }`}
                >
                  {dept.name}
                </button>
              ))}
            </div>

            {/* Live Region for Screen Readers */}
            <div aria-live="polite" className="sr-only">
              Đang hiển thị {filteredDoctors.length} bác sĩ phù hợp.
            </div>

            {/* Doctors Grid or Skeleton Loading Screen */}
            {isFilteringDoctors ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DoctorCardSkeleton />
                <DoctorCardSkeleton />
                <DoctorCardSkeleton />
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <p className="text-sm text-slate-600">
                  Không tìm thấy bác sĩ phù hợp với từ khóa tìm kiếm của bạn.
                </p>
                <Button
                  type="button"
                  variant="mint"
                  size="sm"
                  onClick={() => {
                    setDoctorSearch('');
                    setSelectedSpecialty('all');
                  }}
                >
                  Hiển thị lại tất cả bác sĩ
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDoctors.map((doc) => (
                  <DoctorCard
                    key={doc.id}
                    doctor={doc}
                    onViewProfile={(d) => setActiveDoctorModal(d)}
                    onBookAppointment={(d) => handleSelectDoctorForBooking(d)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 6. WHY CHOOSE US SECTION */}
        <section className="py-20 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#087F8C]">
                Giá trị Cốt lõi
              </span>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                Vì sao Bệnh nhân Tin chọn MediCare?
              </h2>
              <p className="text-sm text-slate-600">
                Chúng tôi đặt sự an toàn lâm sàng, tính minh bạch và quyền riêng tư dữ liệu của bệnh nhân lên vị trí cao nhất.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-7 rounded-2xl bg-[#E8F5F2]/45 border border-[#087F8C]/15 space-y-4 hover-lift">
                <div className="w-12 h-12 rounded-xl bg-[#087F8C] text-white flex items-center justify-center">
                  <Users className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Lấy Bệnh nhân làm Trung tâm
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Phác đồ điều trị được cá thể hóa cho từng người bệnh. Bệnh nhân có thể trực tiếp gửi báo cáo triệu chứng hoặc đặt câu hỏi để nhận hỗ trợ 24/7 từ đội ngũ y bác sĩ.
                </p>
              </div>

              <div className="p-7 rounded-2xl bg-[#E8F5F2]/45 border border-[#087F8C]/15 space-y-4 hover-lift">
                <div className="w-12 h-12 rounded-xl bg-[#087F8C] text-white flex items-center justify-center">
                  <Award className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Chuyên gia Y tế Được Xác thực Đa bên
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Mọi tài khoản nhân sự y tế (Bác sĩ, Dược sĩ, Giám đốc) đều phải cung cấp minh chứng CCHN khi đăng ký và được Hội đồng chuyên môn thẩm định trước khi kích hoạt.
                </p>
              </div>

              <div className="p-7 rounded-2xl bg-[#E8F5F2]/45 border border-[#087F8C]/15 space-y-4 hover-lift">
                <div className="w-12 h-12 rounded-xl bg-[#087F8C] text-white flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Cơ sở Hiện đại & Bảo mật SPII Tối đa
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Thông tin cá nhân nhạy cảm (SPII) được mã hóa E2EE, chỉ xuất tệp sau khi được nhiều bên phê duyệt và tự hủy ngay sau 1 lần tải về duy nhất.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. APPOINTMENT BOOKING SECTION */}
        <section
          id="appointment"
          aria-labelledby="booking-heading"
          className="py-20 bg-[#E8F5F2]/35 border-b border-slate-100"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Left Info Column */}
              <div className="lg:col-span-5 space-y-6">
                <span className="text-xs font-bold uppercase tracking-wider text-[#087F8C]">
                  Đặt lịch hẹn trực tuyến
                </span>
                <h2 id="booking-heading" className="text-3xl font-bold text-slate-900 tracking-tight">
                  Chủ động Thời gian Khám cùng Chuyên gia
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Điền thông tin bên cạnh để đặt lịch khám chuyên khoa. Hệ thống sẽ ghi nhận phiếu hẹn ngay lập tức và đồng bộ vào cổng hỗ trợ bệnh nhân.
                </p>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-slate-200">
                    <Clock className="w-5 h-5 text-[#087F8C] shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="text-xs space-y-1">
                      <div className="font-bold text-slate-900">Khung giờ Khám Tiêu chuẩn</div>
                      <div className="text-slate-600">
                        Thứ 2 – Thứ 7: 07:00 – 19:00 • Cấp cứu & Nội trú: Hoạt động 24/7
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-slate-200">
                    <Phone className="w-5 h-5 text-[#087F8C] shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="text-xs space-y-1">
                      <div className="font-bold text-slate-900">Tổng đài Hỗ trợ Đặt hẹn</div>
                      <div className="text-slate-600">
                        Hotline: <strong>(028) 3822 9999</strong> • Cấp cứu khẩn cấp: <strong>115</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Booking Form with Atomic Step Header */}
              <div className="lg:col-span-7">
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
                  {apptSuccess ? (
                    <div role="status" aria-live="polite" className="space-y-6 py-4 animate-fade-up">
                      <div className="w-12 h-12 rounded-2xl bg-[#E8F5F2] text-[#087F8C] flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#087F8C]">
                          Xác nhận Đặt lịch Thành công
                        </span>
                        <h3 className="text-2xl font-bold text-slate-900">
                          Mã phiếu khám: {apptSuccess.bookingCode}
                        </h3>
                        <p className="text-sm text-slate-600">
                          Cảm ơn <strong>{apptSuccess.patientName}</strong>. Lịch hẹn của bạn đã được ghi nhận vào hệ thống tiếp đón của MediCare.
                        </p>
                      </div>

                      <div className="p-5 rounded-2xl bg-[#E8F5F2]/50 border border-[#087F8C]/20 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-slate-500 block">Chuyên khoa:</span>
                          <span className="font-bold text-slate-900 mt-0.5 block">
                            {apptSuccess.departmentName}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Bác sĩ phụ trách:</span>
                          <span className="font-bold text-slate-900 mt-0.5 block">
                            {apptSuccess.doctorName}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Ngày hẹn khám:</span>
                          <span className="font-bold text-[#087F8C] mt-0.5 block">
                            {apptSuccess.date}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Khung giờ dự kiến:</span>
                          <span className="font-bold text-[#087F8C] mt-0.5 block">
                            {apptSuccess.time}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <Button
                          type="button"
                          variant="primary"
                          onClick={() => setApptSuccess(null)}
                        >
                          Đặt thêm lịch khám khác
                        </Button>
                        <Link
                          href="/support"
                          className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:border-[#087F8C] text-xs font-semibold transition"
                        >
                          Xem phiếu hẹn tại Cổng Hỗ trợ
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleBookAppointment} className="space-y-5" noValidate>
                      <BookingStepHeader currentStep={activeBookingStep} />

                      {apptError && (
                        <div
                          role="alert"
                          className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2"
                        >
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{apptError}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="appt-dept"
                            className="block text-xs font-semibold text-slate-700 mb-1.5"
                          >
                            1. Chọn Chuyên khoa *
                          </label>
                          <select
                            id="appt-dept"
                            value={apptDepartment}
                            onChange={(e) => {
                              const newDept = e.target.value;
                              setApptDepartment(newDept);
                              const firstDoc = DOCTORS_LIST.find((d) => d.specialtyId === newDept);
                              if (firstDoc) setApptDoctor(firstDoc.name);
                            }}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087F8C]"
                          >
                            {DEPARTMENTS.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name} ({d.englishName})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="appt-doc"
                            className="block text-xs font-semibold text-slate-700 mb-1.5"
                          >
                            2. Bác sĩ Khám
                          </label>
                          <select
                            id="appt-doc"
                            value={apptDoctor}
                            onChange={(e) => setApptDoctor(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087F8C]"
                          >
                            {appointmentDoctors.map((doc) => (
                              <option key={doc.id} value={doc.name}>
                                {doc.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="appt-date"
                            className="block text-xs font-semibold text-slate-700 mb-1.5"
                          >
                            3. Ngày khám mong muốn *
                          </label>
                          <input
                            id="appt-date"
                            type="date"
                            value={apptDate}
                            onChange={(e) => setApptDate(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087F8C]"
                            required
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="appt-time"
                            className="block text-xs font-semibold text-slate-700 mb-1.5"
                          >
                            4. Khung giờ khám
                          </label>
                          <select
                            id="appt-time"
                            value={apptTime}
                            onChange={(e) => setApptTime(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087F8C]"
                          >
                            <option value="08:00">08:00 – Buổi sáng</option>
                            <option value="09:30">09:30 – Buổi sáng</option>
                            <option value="10:30">10:30 – Buổi sáng</option>
                            <option value="14:00">14:00 – Buổi chiều</option>
                            <option value="15:30">15:30 – Buổi chiều</option>
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="appt-name"
                            className="block text-xs font-semibold text-slate-700 mb-1.5"
                          >
                            5. Họ và Tên Bệnh nhân *
                          </label>
                          <input
                            id="appt-name"
                            type="text"
                            value={apptName}
                            onChange={(e) => setApptName(e.target.value)}
                            placeholder="Nguyễn Văn A"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087F8C]"
                            required
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="appt-phone"
                            className="block text-xs font-semibold text-slate-700 mb-1.5"
                          >
                            6. Số điện thoại Liên hệ *
                          </label>
                          <input
                            id="appt-phone"
                            type="tel"
                            value={apptPhone}
                            onChange={(e) => setApptPhone(e.target.value)}
                            placeholder="0909 123 456"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087F8C]"
                            required
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label
                            htmlFor="appt-notes"
                            className="block text-xs font-semibold text-slate-700 mb-1.5"
                          >
                            7. Mô tả ngắn triệu chứng hoặc nhu cầu khám (Tùy chọn)
                          </label>
                          <textarea
                            id="appt-notes"
                            rows={3}
                            value={apptNotes}
                            onChange={(e) => setApptNotes(e.target.value)}
                            placeholder="Nhập triệu chứng, tiền sử dị ứng hoặc yêu cầu đặc biệt..."
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087F8C]"
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        fullWidth
                        isLoading={isSubmittingAppt}
                        leftIcon={<Calendar className="w-4 h-4" />}
                      >
                        Xác nhận Đặt lịch khám
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. PATIENT TESTIMONIALS SECTION */}
        <section className="py-20 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#087F8C]">
                Sự hài lòng của người bệnh
              </span>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                Chia sẻ từ Bệnh nhân đã Điều trị
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between space-y-5 hover-lift"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-1 text-[#087F8C]" aria-label={`${item.rating} trên 5 sao`}>
                      {Array.from({ length: item.rating }).map((_, idx) => (
                        <Star key={idx} className="w-4 h-4 fill-[#087F8C]" aria-hidden="true" />
                      ))}
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <div className="text-sm font-bold text-slate-900">{item.patientName}</div>
                    <div className="text-xs text-[#087F8C] font-medium mt-0.5">
                      {item.specialty}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. CONTACT & DIRECTIONS SECTION */}
        <section id="contact" className="py-20 bg-slate-50/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#087F8C]">
                Liên hệ & Chỉ đường
              </span>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                Thông tin Liên hệ MediCare Hospital
              </h2>
              <p className="text-sm text-slate-600">
                Đội ngũ tiếp đón và cấp cứu luôn sẵn sàng hỗ trợ bạn tại cơ sở trung tâm hoặc qua cổng trực tuyến.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3 hover-lift">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5F2] text-[#087F8C] flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Địa chỉ Bệnh viện</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  108 Đại lộ Y Học, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3 hover-lift">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5F2] text-[#087F8C] flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Điện thoại & Cấp cứu</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tổng đài Đặt hẹn: <strong>(028) 3822 9999</strong>
                  <br />
                  Cấp cứu 24/7: <strong className="text-rose-600">115 / (028) 3822 0115</strong>
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3 hover-lift">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5F2] text-[#087F8C] flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Giờ Làm việc</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Thứ 2 – Thứ 7: 07:00 – 19:00
                  <br />
                  Chủ nhật & Lễ: Khám Cấp cứu 24/24
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3 hover-lift">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5F2] text-[#087F8C] flex items-center justify-center">
                  <Navigation className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Hướng dẫn Di chuyển</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Cách Trạm Metro Trung tâm 200m. Có hầm đỗ xe ô tô miễn phí và lối vào riêng cho xe cấp cứu.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Doctor Profile Modal */}
      {activeDoctorModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-doc-name"
          className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-up"
        >
          <div className="glass-surface rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={activeDoctorModal.avatar}
                  alt={activeDoctorModal.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
                />
                <div>
                  <span className="text-xs font-semibold text-[#087F8C]">
                    {activeDoctorModal.specialtyName}
                  </span>
                  <h3 id="modal-doc-name" className="text-xl font-bold text-slate-900">
                    {activeDoctorModal.name}
                  </h3>
                  <p className="text-xs text-slate-500">{activeDoctorModal.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveDoctorModal(null)}
                aria-label="Đóng hồ sơ bác sĩ"
                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">{activeDoctorModal.bio}</p>

            <div className="p-4 rounded-2xl bg-[#E8F5F2]/50 border border-[#087F8C]/20 space-y-2 text-xs">
              <div>
                <strong className="text-slate-800">Đào tạo chuyên môn:</strong>{' '}
                <span className="text-slate-600">{activeDoctorModal.education}</span>
              </div>
              <div>
                <strong className="text-slate-800">Số Chứng chỉ Hành nghề (CCHN):</strong>{' '}
                <span className="font-mono text-[#087F8C] font-semibold">
                  {activeDoctorModal.licenseNumber}
                </span>
              </div>
              <div>
                <strong className="text-slate-800">Lịch khám cố định:</strong>{' '}
                <span className="text-slate-600">{activeDoctorModal.schedule}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setActiveDoctorModal(null)}>
                Đóng
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSelectDoctorForBooking(activeDoctorModal)}
              >
                Chọn Bác sĩ & Đặt lịch ngay
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Design System & Exportable Tokens Inspector Modal */}
      {showDesignSystemModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ds-modal-title"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-up"
        >
          <div className="glass-surface rounded-3xl border border-slate-200 max-w-3xl w-full max-h-[85vh] flex flex-col p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <Badge variant="mint">MediCare Design System v2.0</Badge>
                <h3 id="ds-modal-title" className="text-xl font-bold text-slate-900 mt-1">
                  Exportable Design Tokens (JSON) & Breakpoints
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDesignSystemModal(false)}
                aria-label="Đóng cửa sổ Design System"
                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <div className="w-full h-8 rounded-lg bg-[#087F8C] mb-2" />
                  <div className="font-bold text-slate-900">Medical Teal</div>
                  <div className="font-mono text-slate-500">#087F8C / #2DD4BF</div>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <div className="w-full h-8 rounded-lg bg-[#E8F5F2] border border-slate-200 mb-2" />
                  <div className="font-bold text-slate-900">Soft Mint</div>
                  <div className="font-mono text-slate-500">#E8F5F2</div>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <div className="w-full h-8 rounded-lg bg-[#0F172A] mb-2" />
                  <div className="font-bold text-slate-900">Dark Navy</div>
                  <div className="font-mono text-slate-500">#0F172A</div>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <div className="w-full h-8 rounded-lg bg-white border border-slate-200 mb-2" />
                  <div className="font-bold text-slate-900">Pure Canvas</div>
                  <div className="font-mono text-slate-500">#FFFFFF / #0B1120</div>
                </div>
              </div>

              <div>
                <div className="font-bold text-slate-900 mb-1.5">
                  src/design-system/tokens.json (Exportable W3C Design Tokens):
                </div>
                <pre className="p-4 rounded-2xl bg-slate-950 text-teal-300 font-mono text-[11px] overflow-x-auto max-h-72">
                  {JSON.stringify(designTokens, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <Button variant="primary" size="sm" onClick={() => setShowDesignSystemModal(false)}>
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 10. FOOTER */}
      <Footer />
    </div>
  );
}
