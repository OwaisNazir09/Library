import React, { useState } from 'react';
import {
  Receipt, Download, FileText, CheckCircle2, MessageCircle
} from 'lucide-react';
import {
  financeApi,
  useGetReceiptsQuery,
  useSendReceiptWhatsAppMutation
} from '../../store/api/financeApi';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import FinanceHeader from './FinanceHeader';
import UniversalTransactionModal from './UniversalTransactionModal';
import { toast } from 'react-hot-toast';

const TYPE_LABEL = {
  receipt: 'Payment',
  fee_charge: 'Charge',
  refund: 'Refund',
  payment: 'Payment',
  expense: 'Expense',
};

// ── Premium PDF Generator ──────────────────────────────────────────────────────
const generateReceiptPDF = (receipt) => {
  const doc = new jsPDF({ format: 'a5', orientation: 'portrait' });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();

  // ── Dark header band ──
  doc.setFillColor(4, 67, 67);
  doc.rect(0, 0, pw, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('OFFICIAL RECEIPT', pw / 2, 13, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Library Financial Document', pw / 2, 22, { align: 'center' });

  // ── Receipt # badge (top-right) ──
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(pw - 60, 35, 52, 12, 2, 2, 'F');
  doc.setTextColor(4, 67, 67);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(`# ${receipt.receiptNumber}`, pw - 34, 43, { align: 'center' });

  // ── ISSUED TO ──
  doc.setTextColor(120, 120, 120);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('ISSUED TO', 10, 42);

  doc.setTextColor(20, 20, 20);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const name = receipt.studentId?.fullName || 'Library Member';
  doc.text(name, 10, 52);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  let detailY = 59;
  if (receipt.studentId?.email) { doc.text(receipt.studentId.email, 10, detailY); detailY += 6; }
  if (receipt.studentId?.phone) { doc.text(`Phone: ${receipt.studentId.phone}`, 10, detailY); }

  // ── Date block (top-right under badge) ──
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(format(new Date(receipt.date), 'dd MMM yyyy'), pw - 10, 52, { align: 'right' });
  doc.text(format(new Date(receipt.date), 'hh:mm a'), pw - 10, 59, { align: 'right' });

  // ── Divider ──
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.5);
  doc.line(10, 72, pw - 10, 72);

  // ── Line items table ──
  autoTable(doc, {
    startY: 78,
    head: [['Description', 'Category', 'Amount']],
    body: [[
      receipt.description || 'Library Service',
      TYPE_LABEL[receipt.type] || receipt.type || 'Payment',
      `Rs.${(receipt.amount || 0).toLocaleString('en-IN')}`
    ]],
    headStyles: {
      fillColor: [4, 67, 67],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: { fontSize: 9, textColor: [30, 30, 30] },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 30 },
      2: { halign: 'right', fontStyle: 'bold', cellWidth: 32 }
    },
    margin: { left: 10, right: 10 },
    alternateRowStyles: { fillColor: [249, 249, 249] },
  });

  const tableBottom = doc.lastAutoTable.finalY;

  // ── Subtotal / Total box ──
  const boxY = tableBottom + 6;
  doc.setFillColor(245, 248, 248);
  doc.roundedRect(pw - 75, boxY, 65, 24, 2, 2, 'F');

  doc.setTextColor(120, 120, 120);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal', pw - 13, boxY + 8, { align: 'right' });
  doc.text('Tax (0%)', pw - 13, boxY + 15, { align: 'right' });

  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'bold');
  const amtStr = `Rs.${(receipt.amount || 0).toLocaleString('en-IN')}`;
  doc.text(amtStr, pw - 10, boxY + 8, { align: 'right' });
  doc.text('Rs.0', pw - 10, boxY + 15, { align: 'right' });

  // Total line
  const totalY = boxY + 30;
  doc.setDrawColor(4, 67, 67);
  doc.setLineWidth(0.5);
  doc.line(10, totalY - 4, pw - 10, totalY - 4);

  doc.setTextColor(4, 67, 67);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL RECEIVED', 10, totalY + 4);
  doc.setFontSize(14);
  doc.text(amtStr, pw - 10, totalY + 4, { align: 'right' });

  // ── Signature line ──
  const sigY = ph - 32;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(pw - 60, sigY, pw - 10, sigY);
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.text('Authorized Signatory', pw - 35, sigY + 5, { align: 'center' });

  // ── Footer ──
  doc.setFontSize(6.5);
  doc.setTextColor(190, 190, 190);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'This is an electronically generated receipt. No physical signature required.',
    pw / 2, ph - 8, { align: 'center' }
  );

  doc.save(`Receipt_${receipt.receiptNumber}.pdf`);
};

// ── Main Component ─────────────────────────────────────────────────────────────
const Receipts = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [modal, setModal] = useState({ type: null, isOpen: false });
  const limit = 15;

  const { data: receiptsData, isLoading: loading } = useGetReceiptsQuery({
    page: currentPage,
    limit,
    ...(typeFilter ? { type: typeFilter } : {})
  });
  const receipts = receiptsData?.data || [];
  const totalReceipts = receiptsData?.total || 0;

  const [sendReceiptWhatsApp] = useSendReceiptWhatsAppMutation();
  const [fetchReceipt] = financeApi.endpoints.getReceipt.useLazyQuery();

  const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

  const handleDownloadPDF = async (receiptId) => {
    try {
      toast.loading('Generating PDF...', { id: 'pdf-gen' });
      const { data: res } = await fetchReceipt(receiptId);
      if (res?.status === 'success' && res?.data) {
        generateReceiptPDF(res.data);
        toast.success('PDF Downloaded!', { id: 'pdf-gen' });
      } else {
        toast.error('Could not load receipt data', { id: 'pdf-gen' });
      }
    } catch (error) {
      console.error('PDF Error:', error);
      toast.error('Failed to generate PDF', { id: 'pdf-gen' });
    }
  };

  const handleSendWhatsApp = async (receiptId) => {
    try {
      toast.loading('Sending receipt via WhatsApp...', { id: 'wa-receipt' });
      await sendReceiptWhatsApp(receiptId).unwrap();
      toast.success('Receipt sent!', { id: 'wa-receipt' });
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to send', { id: 'wa-receipt' });
    }
  };

  const typeFilters = ['', 'receipt', 'fee_charge', 'refund', 'expense'];

  return (
    <div className="space-y-5 pb-10">
      <FinanceHeader onAction={(t) => setModal({ type: t, isOpen: true })} />
      <UniversalTransactionModal
        initialType={modal.type || 'journal'}
        isOpen={modal.isOpen}
        onClose={() => setModal({ type: null, isOpen: false })}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Receipts</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Payment proofs and financial documents</p>
        </div>
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
          {typeFilters.map(t => (
            <button
              key={t}
              onClick={() => { setTypeFilter(t); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all capitalize ${
                typeFilter === t ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {t ? TYPE_LABEL[t] || t : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table-main">
          <thead>
            <tr>
              <th className="px-5">Receipt No</th>
              <th>Issued To</th>
              <th>Type</th>
              <th>Date & Time</th>
              <th className="text-right">Amount</th>
              <th className="text-center">Status</th>
              <th className="px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && receipts.length === 0 ? (
              <tr><td colSpan={7} className="p-10 text-center text-slate-400 text-xs animate-pulse">Loading receipts...</td></tr>
            ) : receipts.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <EmptyState title="No Receipts Found" icon={Receipt}
                    message="Any fee collection or payment will generate a receipt here." />
                </td>
              </tr>
            ) : receipts.map((receipt) => (
              <tr key={receipt._id}>
                <td className="px-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                      <FileText size={13} />
                    </div>
                    <span className="font-bold text-slate-900 text-[13px] font-mono">{receipt.receiptNumber}</span>
                  </div>
                </td>
                <td>
                  {receipt.studentId ? (
                    <>
                      <div className="flex items-center gap-2">
                        {receipt.studentId.profilePicture ? (
                          <img src={receipt.studentId.profilePicture} alt="" className="w-6 h-6 rounded object-cover border border-slate-100 shrink-0" />
                        ) : (
                          <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0">
                            {receipt.studentId.fullName?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-[13px] font-semibold text-slate-800 leading-none">{receipt.studentId.fullName}</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">{receipt.studentId.email || receipt.studentId.phone || '—'}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <span className="text-slate-400 text-[12px] italic">General / Unlinked</span>
                  )}
                </td>
                <td>
                  <span className="badge badge-neutral lowercase text-[10px]">
                    {TYPE_LABEL[receipt.type] || receipt.type || 'Payment'}
                  </span>
                </td>
                <td>
                  <p className="text-[13px] font-medium text-slate-700">{format(new Date(receipt.date), 'dd MMM yyyy')}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{format(new Date(receipt.date), 'hh:mm a')}</p>
                </td>
                <td className="text-right">
                  <span className="text-[14px] font-bold text-slate-900">{fmt(receipt.amount)}</span>
                </td>
                <td className="text-center">
                  <div className="flex items-center justify-center gap-1 text-emerald-600">
                    <CheckCircle2 size={13} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Paid</span>
                  </div>
                </td>
                <td className="px-5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleDownloadPDF(receipt._id)}
                      className="btn btn-secondary btn-sm gap-1"
                      title="Download PDF"
                    >
                      <Download size={13} /> PDF
                    </button>
                    <button
                      onClick={() => handleSendWhatsApp(receipt._id)}
                      className="btn btn-secondary btn-sm gap-1 text-emerald-600"
                      title="Send on WhatsApp"
                    >
                      <MessageCircle size={13} /> WA
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalReceipts > limit && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-400">Showing {receipts.length} of {totalReceipts}</p>
            <Pagination total={totalReceipts} limit={limit} currentPage={currentPage} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Receipts;
