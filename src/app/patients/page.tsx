"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/Navbar';
import { useHospital } from '../../lib/hospitalContext';
import {
  Users,
  Search,
  Activity,
  HeartPulse,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';

export default function PatientsDirectoryPage() {
  const { patients } = useHospital();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('TẤT_CẢ');

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'TẤT_CẢ' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Quản lý Hồ sơ Bệnh nhân Nội trú
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Bảo mật hồ sơ bệnh án theo tiêu chuẩn HIPAA & TideCloak Threshold End-to-End Encryption.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Tìm theo tên, mã bệnh nhân (BN-...), chẩn đoán..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-hidden shadow-xs"
            />
          </div>
        </div>

        {/* Patients Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-200/80">
                    {patient.patientId}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      patient.status === 'Hồi sức cấp cứu'
                        ? 'bg-rose-100 text-rose-800'
                        : patient.status === 'Chờ xuất viện'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {patient.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">{patient.patientName}</h3>
                  <div className="text-xs text-slate-500">
                    {patient.age} tuổi • Giới tính: {patient.gender} • {patient.roomNumber}
                  </div>
                </div>

                {/* Diagnosis */}
                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Chẩn đoán:</span>
                  <p className="text-slate-700 font-medium leading-relaxed">{patient.diagnosis}</p>
                </div>

                {/* Allergies Alert */}
                {patient.allergies.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-rose-500 uppercase flex items-center space-x-1">
                      <ShieldAlert className="w-3 h-3" />
                      <span>Cảnh báo Dị ứng:</span>
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {patient.allergies.map((alg, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-semibold"
                        >
                          {alg}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vital signs */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-100">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <div className="text-[10px] text-slate-400">Huyết áp</div>
                    <div className="font-bold text-slate-800">{patient.vitalSigns.bloodPressure}</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <div className="text-[10px] text-slate-400">Nhịp tim</div>
                    <div className="font-bold text-slate-800">{patient.vitalSigns.heartRate} bpm</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <div className="text-[10px] text-slate-400">SpO2</div>
                    <div className="font-bold text-emerald-600">{patient.vitalSigns.spO2}%</div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link
                  href={`/patients/${patient.id}`}
                  className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-50 hover:bg-cyan-600 hover:text-white text-cyan-800 text-xs font-bold transition"
                >
                  <span>Mở Bệnh án Điện tử (EHR)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
