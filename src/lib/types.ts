export type UserRole = 'doctor' | 'pharmacist' | 'director' | 'patient' | 'ai_auditor';

export interface StaffEvidence {
  licenseNumber: string; // Số CCHN y tế
  degree: string; // Bằng cấp chuyên môn (vd: Bác sĩ CKII, Dược sĩ Đại học...)
  issuePlace: string; // Nơi cấp (vd: Bộ Y Tế, Sở Y Tế TP.HCM...)
  issueDate: string; // Ngày cấp
  documentFileName?: string; // Tệp đính kèm
  documentPreviewUrl?: string; // Ảnh xem trước chứng chỉ
  submittedAt: string;
}

export interface UserPII {
  phone: string;
  dateOfBirth: string;
  address: string;
  emergencyContact: string;
}

export interface UserSPII {
  nationalId: string; // Số CCCD / Định danh công dân
  healthInsuranceCode: string; // Mã số Bảo hiểm Y tế / Tài khoản bảo lãnh
  geneticAndSensitiveHistory: string; // Dữ liệu giải trình tự Gen & Bệnh sử nhạy cảm
  taxOrSocialSecurityId: string; // Mã số BHXH / Thuế cá nhân
  biometricEnclaveKeyFingerprint: string; // Vân tay khóa sinh trắc học Hermetic E2EE
}

export interface ProfileUpdateDiff {
  name?: string;
  email?: string;
  department?: string;
  title?: string;
  licenseNumber?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department: string;
  title: string;
  licenseNumber?: string;
  isVerified?: boolean;
  evidence?: StaffEvidence;
  pii?: UserPII;
  spii?: UserSPII;
}

export interface SPIIAccessGrant {
  id: string;
  quorumRequestId: string;
  username: string;
  userFullName: string;
  reason: string;
  requestedAt: string;
  status: 'PENDING_QUORUM' | 'APPROVED_READY_ONCE' | 'DOWNLOADED_EXPIRED';
  approvedAt?: string;
  downloadedAt?: string;
}

export type SupportTicketCategory =
  | 'BÁO_CÁO_TRIỆU_CHỨNG'
  | 'TÁC_DỤNG_PHỤ_THUỐC'
  | 'HỎI_ĐÁP_BÁC_SĨ'
  | 'TƯ_VẤN_DƯỢC_LÝ'
  | 'HỖ_TRỢ_HÀNH_CHÍNH';

export interface SupportReply {
  id: string;
  responderId: string;
  responderName: string;
  responderRole: UserRole;
  responderTitle: string;
  content: string;
  createdAt: string;
}

export interface PatientSupportTicket {
  id: string;
  patientUsername: string;
  patientName: string;
  patientCode?: string;
  category: SupportTicketCategory;
  urgency: 'Bình thường' | 'Cần tư vấn sớm' | 'Khẩn cấp';
  title: string;
  description: string;
  createdAt: string;
  status: 'ĐANG_CHỜ' | 'ĐÃ_PHẢN_HỒI' | 'ĐÃ_HOÀN_TẤT';
  replies: SupportReply[];
}

export interface VitalSigns {
  bloodPressure: string; // e.g. "120/80 mmHg"
  heartRate: number; // bpm
  temperature: number; // Celsius
  spO2: number; // percentage
  recordedAt: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: 'Nam' | 'Nữ' | 'Khác';
  roomNumber: string;
  diagnosis: string;
  allergies: string[];
  admissionDate: string;
  primaryDoctorId: string;
  primaryDoctorName: string;
  vitalSigns: VitalSigns;
  status: 'Nội trú' | 'Hồi sức cấp cứu' | 'Chờ xuất viện' | 'Đã xuất viện';
}

export interface DrugItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  isControlledSubstance: boolean; // Thuốc kiểm soát đặc biệt (Morphine, An thần, Kháng sinh phổ rộng)
  warning?: string;
}

export interface AIDrugAuditResult {
  safetyScore: number; // 0 - 100
  interactionRisk: 'AN TOÀN' | 'CẢNH BÁO TRUNG BÌNH' | 'NGUY HIỂM CAO';
  analysis: string;
  flaggedInteractions: string[];
  recommendedAdjustments: string;
  evaluatedAt: string;
  agentModel: string;
}

export interface QuorumSignature {
  role: UserRole;
  signedBy: string;
  signerName: string;
  timestamp: string;
  signatureHash: string; // VVK signature shard
}

export interface ClinicalOrder {
  id: string;
  patientId: string;
  patientName: string;
  orderType: 'TOA_THUOC' | 'CHI_DINH_PHAU_THUAT' | 'XUAT_VIEN';
  title: string;
  description: string;
  drugs?: DrugItem[];
  prescribedBy: string;
  prescribedByName: string;
  createdAt: string;
  status: 'KHOI_TAO' | 'AI_KIEM_TRA' | 'CHO_HOI_CHAN' | 'DA_NIEM_PHONG' | 'TU_CHOI';
  aiAudit?: AIDrugAuditResult;
  requiredThreshold: number; // M-of-N threshold (vd: 2/3)
  signatures: QuorumSignature[];
  attestationHash?: string;
}

export type ClinicalQuorumType =
  | 'KÊ_TOA_ĐẶC_BIỆT'
  | 'PHẪU_THUẬT_CAN_THIỆP'
  | 'XUẤT_VIỆN_HỒI_SỨC'
  | 'ĐIỀU_CHỈNH_PHÁC_ĐỒ'
  | 'XÁC_MINH_NHÂN_SỰ_Y_TẾ'
  | 'TRUY_XUẤT_SPII'
  | 'CẬP_NHẬT_THÔNG_TIN_CÁ_NHÂN';

export interface ClinicalQuorumRequest {
  id: string;
  type: ClinicalQuorumType;
  title: string;
  description: string;
  patientId?: string;
  patientName?: string;
  targetUserId?: string; // username of target user
  targetUserName?: string;
  evidence?: StaffEvidence;
  spiiGrantId?: string;
  profileUpdateDiff?: {
    oldValues: ProfileUpdateDiff;
    newValues: ProfileUpdateDiff;
  };
  proposedByRole: UserRole;
  proposedByName: string;
  proposedAt: string;
  requiredThreshold: number; // vd: 2 trên 3
  status: 'PENDING' | 'COMMITTED' | 'REJECTED';
  payload: {
    diagnosis?: string;
    clinicalRationale: string;
    proposedAction: string;
    riskLevel: 'Thấp' | 'Trung bình' | 'Cao' | 'Nghiêm trọng';
  };
  signatures: QuorumSignature[];
}
