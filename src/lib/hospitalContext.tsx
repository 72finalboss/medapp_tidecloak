"use client";

import React, { createContext, useContext, useState } from 'react';
import {
  MedicalRecord,
  ClinicalOrder,
  ClinicalQuorumRequest,
  QuorumSignature,
  AIDrugAuditResult,
  DrugItem,
  User,
  StaffEvidence,
  PatientSupportTicket,
  SupportTicketCategory,
  SPIIAccessGrant,
  ProfileUpdateDiff,
} from './types';
import {
  MOCK_PATIENTS,
  MOCK_CLINICAL_ORDERS,
  MOCK_CLINICAL_QUORUM_REQUESTS,
  MOCK_SUPPORT_TICKETS,
} from './mockData';
import { useAuth } from './authContext';

interface HospitalContextType {
  patients: MedicalRecord[];
  orders: ClinicalOrder[];
  quorumRequests: ClinicalQuorumRequest[];
  supportTickets: PatientSupportTicket[];
  spiiGrants: SPIIAccessGrant[];
  createPrescriptionOrder: (
    patientId: string,
    title: string,
    description: string,
    drugs: DrugItem[]
  ) => void;
  triggerAIAudit: (orderId: string) => void;
  createStaffVerificationRequest: (user: User, evidence: StaffEvidence) => string;
  createSupportTicket: (
    category: SupportTicketCategory,
    urgency: 'Bình thường' | 'Cần tư vấn sớm' | 'Khẩn cấp',
    title: string,
    description: string
  ) => void;
  replyToSupportTicket: (ticketId: string, content: string, markResolved?: boolean) => void;
  resolveSupportTicket: (ticketId: string) => void;
  requestSPIIAccess: (reason: string) => {
    success: boolean;
    message: string;
    grantId?: string;
    quorumRequestId?: string;
  };
  consumeSPIIDownload: (grantId: string) => void;
  requestProfileUpdate: (
    newValues: ProfileUpdateDiff,
    reason: string
  ) => {
    success: boolean;
    message: string;
    quorumRequestId?: string;
  };
  signQuorumRequest: (requestId: string) => { success: boolean; message: string };
  rejectQuorumRequest: (requestId: string) => void;
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

export function HospitalProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, activeRole, activateUser, applyApprovedProfileUpdate } = useAuth();

  const [patients] = useState<MedicalRecord[]>(MOCK_PATIENTS);
  const [orders, setOrders] = useState<ClinicalOrder[]>(MOCK_CLINICAL_ORDERS);
  const [quorumRequests, setQuorumRequests] = useState<ClinicalQuorumRequest[]>(
    MOCK_CLINICAL_QUORUM_REQUESTS
  );
  const [supportTickets, setSupportTickets] = useState<PatientSupportTicket[]>(
    MOCK_SUPPORT_TICKETS
  );
  const [spiiGrants, setSpiiGrants] = useState<SPIIAccessGrant[]>([]);

  // 1. When a non-patient staff signs up, submit a Quorum Verification Request
  const createStaffVerificationRequest = (user: User, evidence: StaffEvidence): string => {
    const reqId = `req_staff_${Date.now()}`;
    const initialAiSignature: QuorumSignature = {
      role: 'ai_auditor',
      signedBy: 'usr_ai_05',
      signerName: 'Bộ Y Tế CCHN Registry Bot',
      timestamp: new Date().toISOString(),
      signatureHash: `vvk_shard_cchn_0x${Math.random().toString(36).substring(2, 10)}`,
    };

    const newRequest: ClinicalQuorumRequest = {
      id: reqId,
      type: 'XÁC_MINH_NHÂN_SỰ_Y_TẾ',
      title: `Thẩm định Minh chứng CCHN: ${user.name} (${user.department})`,
      description: `Nhân viên y tế ${user.name} (${user.username}) nộp đơn đăng ký tài khoản với Số CCHN: ${evidence.licenseNumber}. Đã vượt qua bước tra cứu CSDL Quốc gia, cần Giám đốc Y khoa hoặc Dược sĩ thẩm định để cấp quyền truy cập Enclave.`,
      targetUserId: user.username,
      targetUserName: user.name,
      evidence,
      proposedByRole: 'ai_auditor',
      proposedByName: 'Bộ Y Tế CCHN Registry Bot',
      proposedAt: new Date().toISOString(),
      requiredThreshold: 2,
      status: 'PENDING',
      payload: {
        clinicalRationale: `Đối chiếu văn bằng: ${evidence.degree} do ${evidence.issuePlace} cấp ngày ${evidence.issueDate}. Tệp minh chứng: ${evidence.documentFileName || 'ChungChi_DinhKem.pdf'}.`,
        proposedAction: `Kích hoạt tài khoản TideCloak & Cấp quyền truy cập hệ thống y bạ cho vai trò [${user.role}].`,
        riskLevel: 'Cao',
      },
      signatures: [initialAiSignature],
    };

    setQuorumRequests((prev) => [newRequest, ...prev]);
    return reqId;
  };

  // 2. Patient Support & Assistance Tickets
  const createSupportTicket = (
    category: SupportTicketCategory,
    urgency: 'Bình thường' | 'Cần tư vấn sớm' | 'Khẩn cấp',
    title: string,
    description: string
  ) => {
    if (!currentUser) return;
    const newTicket: PatientSupportTicket = {
      id: `tkt_${Date.now()}`,
      patientUsername: currentUser.username,
      patientName: currentUser.name,
      patientCode: currentUser.id,
      category,
      urgency,
      title,
      description,
      status: 'ĐANG_CHỜ',
      createdAt: new Date().toISOString(),
      replies: [],
    };
    setSupportTickets((prev) => [newTicket, ...prev]);
  };

  const replyToSupportTicket = (ticketId: string, content: string, markResolved = false) => {
    if (!currentUser || !activeRole) return;
    setSupportTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        const newReply = {
          id: `rep_${Date.now()}`,
          responderId: currentUser.id,
          responderName: currentUser.name,
          responderRole: activeRole,
          responderTitle: currentUser.title,
          content,
          createdAt: new Date().toISOString(),
        };
        const nextStatus: PatientSupportTicket['status'] = markResolved
          ? 'ĐÃ_HOÀN_TẤT'
          : activeRole !== 'patient'
          ? 'ĐÃ_PHẢN_HỒI'
          : t.status;
        return {
          ...t,
          status: nextStatus,
          replies: [...t.replies, newReply],
        };
      })
    );
  };

  const resolveSupportTicket = (ticketId: string) => {
    setSupportTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: 'ĐÃ_HOÀN_TẤT' } : t))
    );
  };

  // 3. Request SPII Single-Use Export (Requires Multi-Party Quorum Approval)
  const requestSPIIAccess = (reason: string) => {
    if (!currentUser || !activeRole) {
      return { success: false, message: 'Vui lòng đăng nhập trước khi gửi yêu cầu.' };
    }

    const reqId = `req_spii_${Date.now()}`;
    const grantId = `grant_spii_${Date.now()}`;

    const newGrant: SPIIAccessGrant = {
      id: grantId,
      quorumRequestId: reqId,
      username: currentUser.username,
      userFullName: currentUser.name,
      reason,
      status: 'PENDING_QUORUM',
      requestedAt: new Date().toISOString(),
    };

    const newQuorumReq: ClinicalQuorumRequest = {
      id: reqId,
      type: 'TRUY_XUẤT_SPII',
      title: `Yêu cầu Giải mã & Xuất tệp SPII (1 lần): ${currentUser.name}`,
      description: `Người dùng ${currentUser.name} (@${currentUser.username}) yêu cầu giải mã Kho Dữ liệu Nhạy cảm Tối mật (SPII: CCCD, Mã BHYT, Hồ sơ Gen, Khóa Sinh trắc). Tệp xuất ra chỉ có hiệu lực tải xuống đúng 1 lần duy nhất.`,
      targetUserId: currentUser.username,
      targetUserName: currentUser.name,
      spiiGrantId: grantId,
      proposedByRole: activeRole,
      proposedByName: currentUser.name,
      proposedAt: new Date().toISOString(),
      requiredThreshold: 2, // Must be approved by at least 2 distinct roles
      status: 'PENDING',
      payload: {
        clinicalRationale: `Lý do yêu cầu trích xuất SPII: "${reason}"`,
        proposedAction: `Cấp khóa giải mã E2EE tạm thời để xuất tệp SPII_${currentUser.username}.json (Tự hủy ngay sau 1 lần tải).`,
        riskLevel: 'Nghiêm trọng',
      },
      signatures: [],
    };

    setSpiiGrants((prev) => [newGrant, ...prev]);
    setQuorumRequests((prev) => [newQuorumReq, ...prev]);

    return {
      success: true,
      message: 'Đã gửi yêu cầu giải mã SPII tới Hội đồng Bảo mật. Cần tối thiểu 2 chữ ký từ các vai trò khác nhau để mở khóa tải tệp (1 lần).',
      grantId,
      quorumRequestId: reqId,
    };
  };

  // Consume SPII 1-time download -> immediately expire the grant
  const consumeSPIIDownload = (grantId: string) => {
    setSpiiGrants((prev) =>
      prev.map((g) =>
        g.id === grantId
          ? {
              ...g,
              status: 'DOWNLOADED_EXPIRED',
              downloadedAt: new Date().toISOString(),
            }
          : g
      )
    );
  };

  // 4. Request Any User Profile Info Edit (Requires Multi-Party Quorum Approval)
  const requestProfileUpdate = (newValues: ProfileUpdateDiff, reason: string) => {
    if (!currentUser || !activeRole) {
      return { success: false, message: 'Vui lòng đăng nhập.' };
    }

    const oldValues: ProfileUpdateDiff = {
      name: currentUser.name,
      email: currentUser.email,
      department: currentUser.department,
      title: currentUser.title,
      licenseNumber: currentUser.licenseNumber,
      phone: currentUser.pii?.phone || '',
      dateOfBirth: currentUser.pii?.dateOfBirth || '',
      address: currentUser.pii?.address || '',
      emergencyContact: currentUser.pii?.emergencyContact || '',
    };

    const changedOld: ProfileUpdateDiff = {};
    const changedNew: ProfileUpdateDiff = {};
    let changeCount = 0;

    (Object.keys(newValues) as Array<keyof ProfileUpdateDiff>).forEach((key) => {
      if (newValues[key] !== undefined && newValues[key] !== oldValues[key]) {
        changedOld[key] = oldValues[key];
        changedNew[key] = newValues[key];
        changeCount++;
      }
    });

    if (changeCount === 0) {
      return {
        success: false,
        message: 'Không có trường thông tin nào thay đổi so với hồ sơ hiện tại.',
      };
    }

    const reqId = `req_prof_${Date.now()}`;

    const newQuorumReq: ClinicalQuorumRequest = {
      id: reqId,
      type: 'CẬP_NHẬT_THÔNG_TIN_CÁ_NHÂN',
      title: `Phê duyệt Cập nhật Hồ sơ Cá nhân (PII): ${currentUser.name}`,
      description: `Người dùng ${currentUser.name} (@${currentUser.username}) yêu cầu thay đổi ${changeCount} trường thông tin định danh cá nhân trên hệ thống AegisMed. Theo quy tắc toàn vẹn dữ liệu, mọi chỉnh sửa thông tin (trừ Username/Password) đều phải được tối thiểu 2 bên ký duyệt.`,
      targetUserId: currentUser.username,
      targetUserName: currentUser.name,
      profileUpdateDiff: {
        oldValues: changedOld,
        newValues: changedNew,
      },
      proposedByRole: activeRole,
      proposedByName: currentUser.name,
      proposedAt: new Date().toISOString(),
      requiredThreshold: 2,
      status: 'PENDING',
      payload: {
        clinicalRationale: `Lý do cập nhật hồ sơ: "${reason}"`,
        proposedAction: `Ghi đè ${changeCount} trường thông tin PII đã kiểm chứng của @${currentUser.username} vào sổ cái TideCloak.`,
        riskLevel: 'Trung bình',
      },
      signatures: [],
    };

    setQuorumRequests((prev) => [newQuorumReq, ...prev]);

    return {
      success: true,
      message: `Đã khởi tạo Yêu cầu Hội chẩn #${reqId}. Thay đổi sẽ tự động áp dụng ngay khi có đủ 2 chữ ký phê duyệt.`,
      quorumRequestId: reqId,
    };
  };

  // Doctor creates a clinical prescription order
  const createPrescriptionOrder = (
    patientId: string,
    title: string,
    description: string,
    drugs: DrugItem[]
  ) => {
    if (!currentUser) return;
    const patient = patients.find((p) => p.patientId === patientId);

    const hasControlledSubstance = drugs.some((d) => d.isControlledSubstance);

    const initialSignature: QuorumSignature = {
      role: activeRole || 'doctor',
      signedBy: currentUser.id,
      signerName: currentUser.name,
      timestamp: new Date().toISOString(),
      signatureHash: `vvk_doc_sig_0x${Math.random().toString(36).substring(2, 10)}`,
    };

    const newOrder: ClinicalOrder = {
      id: `ord_${Date.now()}`,
      patientId,
      patientName: patient?.patientName || 'Bệnh nhân',
      orderType: 'TOA_THUOC',
      title,
      description,
      drugs,
      prescribedBy: currentUser.id,
      prescribedByName: currentUser.name,
      createdAt: new Date().toISOString(),
      status: 'CHO_HOI_CHAN',
      requiredThreshold: 2,
      signatures: [initialSignature],
    };

    setOrders((prev) => [newOrder, ...prev]);

    const newQuorumRequest: ClinicalQuorumRequest = {
      id: `req_${Date.now()}`,
      type: hasControlledSubstance ? 'KÊ_TOA_ĐẶC_BIỆT' : 'ĐIỀU_CHỈNH_PHÁC_ĐỒ',
      title: `Thẩm định & Phê duyệt Phác đồ: ${title} (${patient?.patientName})`,
      description: `BS ${currentUser.name} đã kê đơn thuốc cho bệnh nhân ${patient?.patientName}. Yêu cầu tối thiểu 2/3 chữ ký vai trò riêng biệt để mở kho thuốc.`,
      patientId,
      patientName: patient?.patientName || 'Bệnh nhân',
      proposedByRole: activeRole || 'doctor',
      proposedByName: currentUser.name,
      proposedAt: new Date().toISOString(),
      requiredThreshold: 2,
      status: 'PENDING',
      payload: {
        diagnosis: patient?.diagnosis || 'Theo dõi điều trị',
        clinicalRationale: description,
        proposedAction: `Cấp phát ${drugs.map((d) => d.name).join(', ')}`,
        riskLevel: hasControlledSubstance ? 'Cao' : 'Trung bình',
      },
      signatures: [initialSignature],
    };

    setQuorumRequests((prev) => [newQuorumRequest, ...prev]);
  };

  // Run AI Clinical Safety & Drug Interaction Audit
  const triggerAIAudit = (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    const patient = patients.find((p) => p.patientId === targetOrder.patientId);

    const safetyScore = Math.floor(Math.random() * 8) + 90; // 90 - 97%
    const aiAuditResult: AIDrugAuditResult = {
      safetyScore,
      interactionRisk: 'AN TOÀN',
      analysis: `Mô hình Gemini 2.0 Flash Clinical Safety đã rà soát danh mục thuốc đối chiếu với hồ sơ dị ứng (${patient?.allergies.join(', ') || 'Không ghi nhận'}). Phác đồ tuân thủ hướng dẫn Bộ Y Tế, không có tương tác đối kháng dược động học nghiêm trọng.`,
      flaggedInteractions: ['Theo dõi chức năng gan/thận định kỳ nếu sử dụng thuốc kéo dài trên 14 ngày.'],
      recommendedAdjustments: 'Đảm bảo uống thuốc sau bữa ăn để giảm thiểu kích ứng dạ dày.',
      evaluatedAt: new Date().toISOString(),
      agentModel: 'Gemini 2.0 Flash Clinical Safety Node',
    };

    const aiSignature: QuorumSignature = {
      role: 'ai_auditor',
      signedBy: 'usr_ai_05',
      signerName: 'Gemini Clinical Safety Agent',
      timestamp: new Date().toISOString(),
      signatureHash: `vvk_shard_ai_${Math.random().toString(36).substring(2, 10)}`,
    };

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const filteredSigs = o.signatures.filter((s) => s.role !== 'ai_auditor');
        const updatedSigs = [...filteredSigs, aiSignature];
        const isSealed = updatedSigs.length >= o.requiredThreshold;
        return {
          ...o,
          status: isSealed ? 'DA_NIEM_PHONG' : 'AI_KIEM_TRA',
          aiAudit: aiAuditResult,
          signatures: updatedSigs,
          attestationHash: isSealed ? `attest_med_vvk_${Math.random().toString(36).substring(2, 12)}` : undefined,
        };
      })
    );
  };

  // Sign a Quorum Request
  const signQuorumRequest = (requestId: string): { success: boolean; message: string } => {
    if (!currentUser || !activeRole) {
      return { success: false, message: 'Vui lòng đăng nhập để thực hiện ký duyệt.' };
    }

    const target = quorumRequests.find((r) => r.id === requestId);
    if (!target) return { success: false, message: 'Yêu cầu hội chẩn không tồn tại.' };

    // Invariant: Role distinctness (A role cannot sign twice)
    const alreadySigned = target.signatures.some((s) => s.role === activeRole);
    if (alreadySigned) {
      return {
        success: false,
        message: `Bác bỏ: Vai trò [${activeRole}] đã đóng góp chữ ký vào hội chẩn này. Quy tắc Emergent Authority bắt buộc phải có các vai trò riêng biệt.`,
      };
    }

    const newSignature: QuorumSignature = {
      role: activeRole,
      signedBy: currentUser.id,
      signerName: currentUser.name,
      timestamp: new Date().toISOString(),
      signatureHash: `vvk_shard_0x${Math.random().toString(36).substring(2, 12)}`,
    };

    const updatedSignatures = [...target.signatures, newSignature];
    const thresholdReached = updatedSignatures.length >= target.requiredThreshold;

    setQuorumRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        return {
          ...r,
          signatures: updatedSignatures,
          status: thresholdReached ? 'COMMITTED' : 'PENDING',
        };
      })
    );

    // Side effects when threshold is reached:
    if (thresholdReached) {
      // 1. Staff verification request -> activate user account!
      if (target.type === 'XÁC_MINH_NHÂN_SỰ_Y_TẾ' && target.targetUserId) {
        activateUser(target.targetUserId);
      }

      // 2. SPII access request -> unlock 1-time download grant!
      if (target.type === 'TRUY_XUẤT_SPII') {
        setSpiiGrants((prev) =>
          prev.map((g) =>
            g.quorumRequestId === target.id || g.id === target.spiiGrantId
              ? {
                  ...g,
                  status: 'APPROVED_READY_ONCE',
                  approvedAt: new Date().toISOString(),
                }
              : g
          )
        );
      }

      // 3. Profile PII modification request -> apply changes to user profile!
      if (
        target.type === 'CẬP_NHẬT_THÔNG_TIN_CÁ_NHÂN' &&
        target.targetUserId &&
        target.profileUpdateDiff
      ) {
        applyApprovedProfileUpdate(target.targetUserId, target.profileUpdateDiff.newValues);
      }

      // 4. Patient clinical order -> seal it!
      if (target.patientId) {
        setOrders((prev) =>
          prev.map((o) => {
            if (o.patientId === target.patientId) {
              return {
                ...o,
                status: 'DA_NIEM_PHONG',
                attestationHash: `attest_med_vvk_${Math.random().toString(36).substring(2, 12)}`,
              };
            }
            return o;
          })
        );
      }
    }

    let successMsg = `Đã ghi nhận chữ ký của bạn (${updatedSignatures.length}/${target.requiredThreshold} chữ ký cần thiết).`;
    if (thresholdReached) {
      if (target.type === 'XÁC_MINH_NHÂN_SỰ_Y_TẾ') {
        successMsg = `🎉 Đã đạt ngưỡng Quorum! Tài khoản nhân sự y tế [${target.targetUserName}] đã được kích hoạt thành công.`;
      } else if (target.type === 'TRUY_XUẤT_SPII') {
        successMsg = `🎉 Đã đạt ngưỡng Quorum! Đã mở khóa xuất tệp SPII (1 lần duy nhất) cho hồ sơ [${target.targetUserName}].`;
      } else if (target.type === 'CẬP_NHẬT_THÔNG_TIN_CÁ_NHÂN') {
        successMsg = `🎉 Đã đạt ngưỡng Quorum! Thông tin hồ sơ cá nhân của [${target.targetUserName}] đã được cập nhật chính thức.`;
      } else {
        successMsg = '🎉 Đã đạt ngưỡng Quorum! Phác đồ điều trị đã được niêm phong mật mã VVK và chính thức có hiệu lực.';
      }
    }

    return {
      success: true,
      message: successMsg,
    };
  };

  const rejectQuorumRequest = (requestId: string) => {
    setQuorumRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'REJECTED' } : r))
    );
  };

  return (
    <HospitalContext.Provider
      value={{
        patients,
        orders,
        quorumRequests,
        supportTickets,
        spiiGrants,
        createPrescriptionOrder,
        triggerAIAudit,
        createStaffVerificationRequest,
        createSupportTicket,
        replyToSupportTicket,
        resolveSupportTicket,
        requestSPIIAccess,
        consumeSPIIDownload,
        requestProfileUpdate,
        signQuorumRequest,
        rejectQuorumRequest,
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
}

export function useHospital() {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
}
