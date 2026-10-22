"use client";

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/lib/authContext';
import { useHospital } from '@/lib/hospitalContext';
import { SupportTicketCategory } from '@/lib/types';
import {
  MessageSquareHeart,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  Stethoscope,
  Pill,
  ShieldCheck,
  User,
  PlusCircle,
  Sparkles,
} from 'lucide-react';

const CATEGORY_LABELS: Record<SupportTicketCategory, string> = {
  BÁO_CÁO_TRIỆU_CHỨNG: 'Báo cáo Triệu chứng Lâm sàng',
  TÁC_DỤNG_PHỤ_THUỐC: 'Cảnh báo Tác dụng phụ của Thuốc',
  HỎI_ĐÁP_BÁC_SĨ: 'Hỏi đáp & Tư vấn Bác sĩ Điều trị',
  TƯ_VẤN_DƯỢC_LÝ: 'Tư vấn Dược sĩ Lâm sàng (Liều dùng/Tương tác)',
  HỖ_TRỢ_HÀNH_CHÍNH: 'Hỗ trợ Thủ tục Viện phí & BHYT',
};

export default function SupportPage() {
  const { currentUser, activeRole } = useAuth();
  const { supportTickets, createSupportTicket, replyToSupportTicket, resolveSupportTicket } =
    useHospital();

  const [category, setCategory] = useState<SupportTicketCategory>('BÁO_CÁO_TRIỆU_CHỨNG');
  const [urgency, setUrgency] = useState<'Bình thường' | 'Cần tư vấn sớm' | 'Khẩn cấp'>('Cần tư vấn sớm');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const [selectedTicketId, setSelectedTicketId] = useState<string>(
    supportTickets[0]?.id || ''
  );
  const [replyText, setReplyText] = useState('');
  const [markResolvedOnReply, setMarkResolvedOnReply] = useState(false);

  const isHospitalStaff = activeRole && activeRole !== 'patient';

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    createSupportTicket(category, urgency, title.trim(), description.trim());
    setTitle('');
    setDescription('');
    setSubmitSuccess(
      'Đã gửi Báo cáo / Câu hỏi tới Đội ngũ Y bác sĩ Bệnh viện AegisMed! Nhân sự chuyên trách sẽ phản hồi sớm nhất.'
    );
    setTimeout(() => setSubmitSuccess(null), 5000);
  };

  const handleSendReply = (e: React.FormEvent, ticketId: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    replyToSupportTicket(ticketId, replyText.trim(), markResolvedOnReply);
    setReplyText('');
    setMarkResolvedOnReply(false);
  };

  const activeTicket =
    supportTickets.find((t) => t.id === selectedTicketId) || supportTickets[0];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-up">
        {/* Clean Minimalist Header */}
        <div className="bg-[#E8F5F2]/60 border border-[#087F8C]/20 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#087F8C]/20 text-[#087F8C] text-xs font-semibold mb-2">
                <MessageSquareHeart className="w-3.5 h-3.5" />
                Cổng Hỗ trợ Bệnh nhân & Hội chẩn Trực tuyến 24/7
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                Báo cáo Triệu chứng & Hỏi đáp Nhân sự Y tế
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Bệnh nhân có thể gửi báo cáo phản ứng thuốc, triệu chứng bất thường hoặc đặt câu hỏi trực tiếp để được Bác sĩ, Dược sĩ và Ban Giám đốc hỗ trợ.
              </p>
            </div>

            <div className="bg-white border border-slate-200 px-4 py-3 rounded-xl text-xs shrink-0">
              <span className="text-slate-500 block">Vai trò đang hoạt động:</span>
              <span className="font-bold text-[#087F8C] uppercase">
                {currentUser?.name} ({activeRole})
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN (5 cols): Create Report / Ask Question Form + Ticket List */}
          <div className="lg:col-span-5 space-y-6">
            {/* Submit New Report / Question Form */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                <PlusCircle className="w-5 h-5 text-[#087F8C]" />
                <h2 className="text-base font-bold text-slate-900">
                  Gửi Báo cáo Y tế / Đặt câu hỏi Hỗ trợ mới
                </h2>
              </div>

              {submitSuccess && (
                <div className="mb-4 p-3.5 rounded-xl bg-[#E8F5F2] border border-[#087F8C]/30 text-xs text-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#087F8C] shrink-0" />
                  <span>{submitSuccess}</span>
                </div>
              )}

              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Danh mục cần hỗ trợ
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as SupportTicketCategory)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                    >
                      {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                        <option key={k} value={k}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Mức độ khẩn cấp
                    </label>
                    <select
                      value={urgency}
                      onChange={(e) =>
                        setUrgency(
                          e.target.value as 'Bình thường' | 'Cần tư vấn sớm' | 'Khẩn cấp'
                        )
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                    >
                      <option value="Bình thường">Bình thường (Tư vấn thường quy)</option>
                      <option value="Cần tư vấn sớm">Cần tư vấn sớm (Phản hồi trong ngày)</option>
                      <option value="Khẩn cấp">Khẩn cấp (Triệu chứng / Phản ứng thuốc)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Tiêu đề báo cáo hoặc câu hỏi
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Hỏi về triệu chứng chóng mặt sau khi uống thuốc huyết áp..."
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Mô tả chi tiết triệu chứng / câu hỏi cần giải đáp
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả rõ thời điểm xuất hiện triệu chứng, các thuốc đang dùng hoặc thắc mắc của bạn..."
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#087F8C] hover:bg-[#066670] text-white font-semibold text-xs flex items-center justify-center gap-2 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  Gửi Yêu cầu Hỗ trợ tới Bệnh viện
                </button>
              </form>
            </div>

            {/* Ticket Queue List */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Danh sách Báo cáo & Câu hỏi ({supportTickets.length})
              </h3>
              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {supportTickets.map((ticket) => {
                  const isSelected = activeTicket?.id === ticket.id;
                  return (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition ${
                        isSelected
                          ? 'bg-[#E8F5F2]/60 border-[#087F8C]'
                          : 'bg-slate-50/70 border-slate-200 hover:border-[#087F8C]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ticket.urgency === 'Khẩn cấp'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : ticket.urgency === 'Cần tư vấn sớm'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-white text-slate-600 border border-slate-200'
                          }`}
                        >
                          {ticket.urgency}
                        </span>
                        <span
                          className={`text-[11px] font-semibold flex items-center gap-1 ${
                            ticket.status === 'ĐÃ_HOÀN_TẤT'
                              ? 'text-[#087F8C]'
                              : ticket.status === 'ĐÃ_PHẢN_HỒI'
                              ? 'text-[#087F8C]'
                              : 'text-amber-600'
                          }`}
                        >
                          {ticket.status === 'ĐÃ_HOÀN_TẤT' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {ticket.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{ticket.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                        <span>Bệnh nhân: {ticket.patientName}</span>
                        <span>{ticket.replies.length} phản hồi</span>
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (7 cols): Active Ticket Conversation & Staff Assistance */}
          <div className="lg:col-span-7">
            {activeTicket ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col h-full justify-between space-y-6">
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E8F5F2] text-[#087F8C]">
                        {CATEGORY_LABELS[activeTicket.category]}
                      </span>
                      <div className="flex items-center gap-2">
                        {isHospitalStaff && activeTicket.status !== 'ĐÃ_HOÀN_TẤT' && (
                          <button
                            onClick={() => resolveSupportTicket(activeTicket.id)}
                            className="px-3 py-1 rounded-lg bg-[#E8F5F2] hover:bg-[#087F8C] text-[#087F8C] hover:text-white text-xs font-semibold transition"
                          >
                            ✓ Đánh dấu Đã hoàn tất
                          </button>
                        )}
                        <span className="text-xs font-mono text-slate-400">#{activeTicket.id}</span>
                      </div>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900">{activeTicket.title}</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Người gửi: <strong className="text-slate-900">{activeTicket.patientName}</strong> (@
                      {activeTicket.patientUsername}) • Lúc{' '}
                      {new Date(activeTicket.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>

                  {/* Patient's Original Report Description */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed">
                    <div className="text-xs font-bold text-[#087F8C] mb-1.5 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> Nội dung Báo cáo / Câu hỏi của Bệnh nhân:
                    </div>
                    {activeTicket.description}
                  </div>

                  {/* Replies from Hospital Personnel */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Phản hồi & Hướng dẫn từ Nhân sự Bệnh viện ({activeTicket.replies.length})
                    </h3>

                    {activeTicket.replies.length === 0 ? (
                      <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                        Chưa có phản hồi nào. Nếu bạn là Bác sĩ, Dược sĩ hoặc Ban Giám đốc, hãy nhập tư vấn hỗ trợ bên dưới.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {activeTicket.replies.map((reply) => {
                          const isStaffReply = reply.responderRole !== 'patient';
                          return (
                            <div
                              key={reply.id}
                              className={`p-4 rounded-xl border ${
                                isStaffReply
                                  ? 'bg-[#E8F5F2]/50 border-[#087F8C]/25'
                                  : 'bg-slate-50 border-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                  {reply.responderRole === 'doctor' ? (
                                    <Stethoscope className="w-4 h-4 text-[#087F8C]" />
                                  ) : reply.responderRole === 'pharmacist' ? (
                                    <Pill className="w-4 h-4 text-[#087F8C]" />
                                  ) : reply.responderRole === 'ai_auditor' ? (
                                    <Sparkles className="w-4 h-4 text-[#087F8C]" />
                                  ) : reply.responderRole === 'director' ? (
                                    <ShieldCheck className="w-4 h-4 text-[#087F8C]" />
                                  ) : (
                                    <User className="w-4 h-4 text-slate-500" />
                                  )}
                                  <span className="text-xs font-bold text-slate-900">
                                    {reply.responderName}
                                  </span>
                                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 text-[#087F8C]">
                                    {reply.responderTitle}
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-500">
                                  {new Date(reply.createdAt).toLocaleString('vi-VN')}
                                </span>
                              </div>
                              <p className="text-xs text-slate-700 leading-relaxed">{reply.content}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Reply Input Box */}
                <form
                  onSubmit={(e) => handleSendReply(e, activeTicket.id)}
                  className="pt-4 border-t border-slate-100 space-y-3"
                >
                  <label className="block text-xs font-semibold text-slate-800">
                    {isHospitalStaff
                      ? `Phản hồi hỗ trợ bệnh nhân với tư cách [${currentUser?.name} — ${currentUser?.title}]:`
                      : 'Gửi phản hồi bổ sung của bệnh nhân:'}
                  </label>
                  <textarea
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={
                      isHospitalStaff
                        ? 'Nhập hướng dẫn xử trí lâm sàng, điều chỉnh liều thuốc hoặc lời khuyên y khoa cho bệnh nhân...'
                        : 'Nhập thêm thông tin triệu chứng hoặc câu hỏi tiếp theo...'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                    required
                  />

                  <div className="flex items-center justify-between flex-wrap gap-3">
                    {isHospitalStaff ? (
                      <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={markResolvedOnReply}
                          onChange={(e) => setMarkResolvedOnReply(e.target.checked)}
                          className="rounded border-slate-300 text-[#087F8C]"
                        />
                        Đánh dấu yêu cầu này là &quot;Đã hoàn tất&quot; sau khi gửi
                      </label>
                    ) : (
                      <span className="text-[11px] text-slate-500">
                        Mẹo: Bạn có thể đổi sang vai trò Bác sĩ / Dược sĩ ở góc phải trên cùng để đóng vai người trả lời.
                      </span>
                    )}

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#087F8C] hover:bg-[#066670] text-white font-semibold text-xs flex items-center gap-2 transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {isHospitalStaff ? 'Gửi Tư vấn Hỗ trợ Bệnh nhân' : 'Gửi Phản hồi'}
                    </button>
                  </div>
                </form>
              </div>
            ) : null}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
