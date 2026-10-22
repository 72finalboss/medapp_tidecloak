"use client";

import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { useAuth } from '../../lib/authContext';
import { useHospital } from '../../lib/hospitalContext';
import { DrugItem } from '../../lib/types';
import {
  Pill,
  Sparkles,
  Plus,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  FileText,
  User,
  ShieldAlert,
} from 'lucide-react';

export default function PrescriptionsPage() {
  const { currentUser, activeRole } = useAuth();
  const { patients, orders, createPrescriptionOrder, triggerAIAudit } = useHospital();

  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.patientId || '');
  const [orderTitle, setOrderTitle] = useState('');
  const [orderDescription, setOrderDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simple drug form
  const [drugName, setDrugName] = useState('');
  const [drugDosage, setDrugDosage] = useState('');
  const [drugFreq, setDrugFreq] = useState('');
  const [isControlled, setIsControlled] = useState(false);
  const [tempDrugs, setTempDrugs] = useState<DrugItem[]>([
    {
      id: 'd_default',
      name: 'Clopidogrel (Plavix)',
      dosage: '75mg',
      frequency: 'Uống 1 viên vào buổi sáng',
      durationDays: 30,
      isControlledSubstance: false,
    },
  ]);

  const handleAddDrug = () => {
    if (!drugName.trim()) return;
    const newDrug: DrugItem = {
      id: `d_${Date.now()}`,
      name: drugName,
      dosage: drugDosage || 'Theo chỉ định',
      frequency: drugFreq || 'Ngày 1 lần',
      durationDays: 14,
      isControlledSubstance: isControlled,
    };
    setTempDrugs([...tempDrugs, newDrug]);
    setDrugName('');
    setDrugDosage('');
    setDrugFreq('');
    setIsControlled(false);
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderTitle.trim() || tempDrugs.length === 0) {
      alert('Vui lòng nhập tên phác đồ và thêm ít nhất một loại thuốc.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      createPrescriptionOrder(
        selectedPatientId,
        orderTitle,
        orderDescription || 'Chỉ định điều trị nội trú theo dõi sát.',
        tempDrugs
      );
      setIsSubmitting(false);
      setOrderTitle('');
      setOrderDescription('');
      alert('Đã tạo phác đồ điều trị! Ca này đã được đưa vào Phòng Hội chẩn Quorum để chờ thẩm định.');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Kê đơn Thuốc & Phác đồ Điều trị Lâm sàng
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Tích hợp cơ chế kiểm tra tương tác thuốc Gemini AI và niêm phong mật mã Quorum Emergent Authority.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold">
              Vai trò hiện tại: <span className="capitalize">{activeRole}</span>
            </span>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form Kê đơn mới (Cho Bác sĩ) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-4">
                <div className="p-2 bg-cyan-50 text-cyan-700 rounded-xl">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Tạo Đơn thuốc Mới</h3>
                  <p className="text-xs text-slate-500">Chỉ định thuốc nội trú</p>
                </div>
              </div>

              {activeRole !== 'doctor' && activeRole !== 'director' ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                  <strong>Thông báo phân quyền:</strong>
                  <p>
                    Chỉ có <strong>Bác sĩ điều trị</strong> hoặc <strong>Giám đốc Y khoa</strong> mới có quyền kê đơn thuốc mới. Hãy chuyển vai trò sang Bác sĩ ở thanh điều hướng để thử tính năng này.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleCreateOrder} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Chọn Bệnh nhân</label>
                    <select
                      value={selectedPatientId}
                      onChange={(e) => setSelectedPatientId(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    >
                      {patients.map((p) => (
                        <option key={p.patientId} value={p.patientId}>
                          {p.patientId} - {p.patientName} ({p.roomNumber})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Tên Phác đồ / Chỉ định</label>
                    <input
                      type="text"
                      placeholder="vd: Kháng sinh thế hệ mới phối hợp..."
                      value={orderTitle}
                      onChange={(e) => setOrderTitle(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Ghi chú & Lý do lâm sàng</label>
                    <textarea
                      rows={2}
                      placeholder="Mô tả mục tiêu điều trị..."
                      value={orderDescription}
                      onChange={(e) => setOrderDescription(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  {/* Add drugs widget */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="text-xs font-bold text-slate-700">Danh mục thuốc kê đơn:</div>

                    <div className="space-y-2">
                      {tempDrugs.map((d, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-800">{d.name}</span>
                            <span className="text-slate-500 ml-1">({d.dosage})</span>
                          </div>
                          {d.isControlledSubstance && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800">
                              Kiểm soát đặc biệt
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200 space-y-2">
                      <input
                        type="text"
                        placeholder="Tên thuốc (vd: Furosemide, Meropenem...)"
                        value={drugName}
                        onChange={(e) => setDrugName(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Liều (vd: 40mg)"
                          value={drugDosage}
                          onChange={(e) => setDrugDosage(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Cách dùng (vd: Uống sáng 1v)"
                          value={drugFreq}
                          onChange={(e) => setDrugFreq(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>

                      <label className="flex items-center space-x-2 text-xs text-rose-700 font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isControlled}
                          onChange={(e) => setIsControlled(e.target.checked)}
                          className="rounded text-rose-600 focus:ring-rose-500"
                        />
                        <span>Thuốc kiểm soát đặc biệt (Cần Quorum phê duyệt)</span>
                      </label>

                      <button
                        type="button"
                        onClick={handleAddDrug}
                        className="w-full py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition"
                      >
                        + Thêm vào danh mục thuốc
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-xs transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Đang tạo...' : 'Ký Tên & Gửi Lên Hội Chẩn'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Danh sách Đơn thuốc & Phác đồ */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-400">
                Tất cả Đơn thuốc & Phác đồ Hiện có ({orders.length})
              </h2>
              <span className="text-xs text-slate-500">Mã hóa đầu cuối & Quorum bảo vệ</span>
            </div>

            <div className="space-y-6">
              {orders.map((ord) => (
                <div key={ord.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                          Mã BN: {ord.patientId}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">Bệnh nhân: <strong>{ord.patientName}</strong></span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{ord.title}</h3>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        ord.status === 'DA_NIEM_PHONG'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{ord.description}</p>

                  {/* Danh mục thuốc */}
                  {ord.drugs && (
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Thuốc trong phác đồ:</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ord.drugs.map((d) => (
                          <div key={d.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800">{d.name}</span>
                              <span className="text-cyan-700 font-semibold">{d.dosage}</span>
                            </div>
                            <div className="text-[11px] text-slate-500">{d.frequency}</div>
                            {d.isControlledSubstance && (
                              <div className="text-[10px] font-bold text-rose-600 flex items-center space-x-1 mt-1">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Opioid / Kiểm soát đặc biệt</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gemini AI Clinical Safety Audit Result */}
                  {ord.aiAudit ? (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200/80 text-xs space-y-2 text-cyan-950">
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center space-x-1.5">
                          <Sparkles className="w-4 h-4 text-cyan-600" />
                          <span>Gemini AI Safety Score: {ord.aiAudit.safetyScore}% ({ord.aiAudit.interactionRisk})</span>
                        </span>
                        <span className="text-[10px] font-semibold text-cyan-700 bg-white px-2 py-0.5 rounded border border-cyan-200">
                          {ord.aiAudit.agentModel}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{ord.aiAudit.analysis}</p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <div className="text-slate-600">Chưa chạy phân tích tương tác thuốc tự động.</div>
                      <button
                        onClick={() => triggerAIAudit(ord.id)}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold transition shadow-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Kích hoạt Gemini AI Thẩm định</span>
                      </button>
                    </div>
                  )}

                  {/* Signatures & Attestation Hash */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                    <div className="text-slate-500">
                      Bác sĩ kê đơn: <strong>{ord.prescribedByName}</strong>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-cyan-700">
                        {ord.signatures.length} / {ord.requiredThreshold} Chữ ký Shard
                      </span>
                      {ord.attestationHash && (
                        <span className="font-mono text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                          {ord.attestationHash}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
