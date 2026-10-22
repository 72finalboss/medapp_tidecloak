"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '../../../components/Navbar';
import { useHospital } from '../../../lib/hospitalContext';
import {
  ArrowLeft,
  Users,
  Activity,
  HeartPulse,
  ShieldAlert,
  Pill,
  ShieldCheck,
  Calendar,
  Stethoscope,
  Building2,
  FileText,
  Sparkles,
} from 'lucide-react';

export default function PatientDetailPage() {
  const params = useParams();
  const { patients, orders } = useHospital();

  const patientId = params?.id as string;
  const patient = patients.find((p) => p.id === patientId) || patients[0];
  const patientOrders = orders.filter((o) => o.patientId === patient.patientId);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <Link href="/patients" className="hover:text-cyan-600 flex items-center space-x-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Danh sách Bệnh nhân</span>
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-800">{patient.patientId} - {patient.patientName}</span>
        </div>

        {/* Patient Hero Header */}
        <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-cyan-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-400/30">
                Mã BN: {patient.patientId}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium">
                {patient.roomNumber}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">{patient.patientName}</h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {patient.age} tuổi • Giới tính: {patient.gender} • Nhập viện: {new Date(patient.admissionDate).toLocaleDateString('vi-VN')}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-xs space-y-1.5 min-w-[200px]">
            <span className="text-[10px] text-cyan-300 uppercase tracking-wider font-bold">Bác sĩ Điều trị Chính</span>
            <div className="font-bold text-white text-sm">{patient.primaryDoctorName}</div>
            <div className="text-slate-400 text-[11px]">Trạng thái: <strong>{patient.status}</strong></div>
          </div>
        </section>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Vitals & Allergies */}
          <div className="space-y-6">
            {/* Vital Signs Panel */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 text-cyan-700 font-bold text-sm">
                <HeartPulse className="w-5 h-5 text-cyan-600" />
                <span>Chỉ số Sinh tồn Hiện tại</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Huyết áp</span>
                  <div className="text-lg font-bold text-slate-900">{patient.vitalSigns.bloodPressure}</div>
                  <span className="text-[10px] text-emerald-600 font-medium">Trong ngưỡng theo dõi</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Nhịp tim</span>
                  <div className="text-lg font-bold text-slate-900">{patient.vitalSigns.heartRate} <span className="text-xs font-normal">bpm</span></div>
                  <span className="text-[10px] text-slate-500 font-medium">Đều, rõ</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Nhiệt độ</span>
                  <div className="text-lg font-bold text-slate-900">{patient.vitalSigns.temperature}°C</div>
                  <span className="text-[10px] text-slate-500 font-medium">Bình thường</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">SpO2 Khí trời</span>
                  <div className="text-lg font-bold text-emerald-600">{patient.vitalSigns.spO2}%</div>
                  <span className="text-[10px] text-emerald-600 font-medium">Đạt mục tiêu</span>
                </div>
              </div>
            </div>

            {/* Allergies & Contraindications */}
            <div className="bg-white rounded-3xl border border-rose-200 p-6 shadow-xs space-y-3 bg-gradient-to-b from-rose-50/30 to-white">
              <div className="flex items-center space-x-2 text-rose-800 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <span>Tiền sử Dị ứng & Chống chỉ định</span>
              </div>

              <div className="space-y-2">
                {patient.allergies.map((alg, idx) => (
                  <div key={idx} className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 font-semibold">
                    ⚠️ {alg}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Orders & Medical History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Diagnosis Detail */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-400">
                Chẩn đoán Lâm sàng & Tình trạng Bệnh
              </h3>
              <p className="text-sm text-slate-800 leading-relaxed font-medium">
                {patient.diagnosis}
              </p>
            </div>

            {/* Prescriptions & Orders for this Patient */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Phác đồ & Đơn thuốc của Bệnh nhân ({patientOrders.length})</h3>
                    <p className="text-xs text-slate-500">Cần chữ ký hội đồng Quorum trước khi cấp phát</p>
                  </div>
                </div>

                <Link
                  href="/prescriptions"
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition shadow-xs"
                >
                  Kê đơn thuốc mới
                </Link>
              </div>

              <div className="space-y-4">
                {patientOrders.map((ord) => (
                  <div key={ord.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{ord.title}</h4>
                        <p className="text-xs text-slate-600 mt-0.5">{ord.description}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        ord.status === 'DA_NIEM_PHONG'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Drugs list */}
                    {ord.drugs && (
                      <div className="space-y-1.5 pt-2">
                        <div className="text-[11px] font-bold text-slate-500 uppercase">Danh mục thuốc:</div>
                        {ord.drugs.map((d) => (
                          <div key={d.id} className="p-2.5 bg-white rounded-xl border border-slate-200/80 text-xs flex items-center justify-between">
                            <div>
                              <span className="font-bold text-slate-800">{d.name}</span>
                              <span className="text-slate-500 ml-2">({d.dosage}) - {d.frequency}</span>
                            </div>
                            {d.isControlledSubstance && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                                Thuốc kiểm soát đặc biệt
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quorum Signatures */}
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                      <div>
                        Bác sĩ kê đơn: <strong>{ord.prescribedByName}</strong>
                      </div>
                      <div className="font-bold text-cyan-700">
                        {ord.signatures.length} / {ord.requiredThreshold} Chữ ký Shard
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
