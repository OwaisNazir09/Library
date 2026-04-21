import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Receipt, Search, Download, Printer, User, Calendar,
  ArrowLeft, FileText, CheckCircle2, X, Share2, IndianRupee, BookOpen
} from 'lucide-react';
import { useGetReceiptsQuery, useGetReceiptQuery } from '../../store/api/financeApi';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Pagination from '../../components/common/Pagination';
import { format } from 'date-fns';

const Receipts = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceiptId, setSelectedReceiptId] = useState(null);
  const limit = 12;

  const { data: receiptsData, isLoading: loading } = useGetReceiptsQuery({ page: currentPage, limit });
  const receipts = receiptsData?.data || [];
  const totalReceipts = receiptsData?.total || 0;

  const { data: currentReceiptDoc } = useGetReceiptQuery(selectedReceiptId, { skip: !selectedReceiptId });
  const currentReceipt = currentReceiptDoc?.data;

  const handleViewReceipt = (id) => {
    setSelectedReceiptId(id);
  };

  const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

  const ReceiptModal = ({ receipt, onClose }) => {
    if (!receipt) return null;
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          className="bg-white rounded-[2rem] w-full max-w-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] relative overflow-hidden my-auto border border-slate-100"
        >
          {/* Action Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-50 no-print bg-slate-50/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#044343] flex items-center justify-center text-white">
                <Receipt size={16} />
              </div>
              <span className="text-sm font-black text-slate-900 tracking-tight">Receipt Preview</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-[#044343] text-white rounded-xl hover:bg-[#033232] transition-all text-xs font-bold shadow-lg shadow-teal-900/10">
                <Printer size={14} />
                <span>Print Document</span>
              </button>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Receipt Content */}
          <div className="p-12 relative" id="printable-receipt">
            {/* Watermark Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none rotate-[-30deg] select-none">
              <h1 className="text-[12rem] font-black tracking-tighter">WELIB</h1>
            </div>

            <div className="relative z-10">
              {/* Header */}
              <div className="flex justify-between items-start mb-16">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#044343] rounded-3xl flex items-center justify-center shadow-2xl shadow-teal-900/30 text-white">
                    <BookOpen size={32} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Welib</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-1">SaaS Library Authority</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-slate-900 text-white px-4 py-1.5 rounded-lg inline-block mb-3">
                    <h4 className="text-sm font-black tracking-widest uppercase">Official Receipt</h4>
                  </div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No: <span className="text-slate-900">{receipt.receiptNumber}</span></p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-16 mb-16">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-[#044343] uppercase tracking-widest mb-2 border-b border-teal-50 pb-1">Issued To</p>
                    <p className="text-xl font-black text-slate-900 tracking-tight">{receipt.studentId?.fullName || 'General Library Member'}</p>
                    <p className="text-sm font-bold text-slate-500 mt-1">{receipt.studentId?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact</p>
                    <p className="text-xs font-bold text-slate-700">{receipt.studentId?.phone || 'Not Provided'}</p>
                  </div>
                </div>
                <div className="space-y-4 text-right">
                  <div>
                    <p className="text-[10px] font-black text-[#044343] uppercase tracking-widest mb-2 border-b border-teal-50 pb-1 inline-block ml-auto">Timeline</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">Date: {format(new Date(receipt.date), 'dd MMMM yyyy')}</p>
                    <p className="text-sm font-bold text-slate-900">Time: {format(new Date(receipt.date), 'hh:mm a')}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payment Status</p>
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full uppercase tracking-widest">Fully Settled</span>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="mb-16">
                <div className="grid grid-cols-4 px-6 py-3 bg-slate-900 rounded-t-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <div className="col-span-2">Description of Services</div>
                  <div className="text-center">Category</div>
                  <div className="text-right">Amount</div>
                </div>
                <div className="border border-slate-100 border-t-0 rounded-b-2xl overflow-hidden">
                  <div className="grid grid-cols-4 px-6 py-8 items-center bg-white">
                    <div className="col-span-2">
                      <p className="text-sm font-black text-slate-900">{receipt.description || 'Library Service Charge'}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">TXN REF: {receipt.transactionId?.substring(18).toUpperCase() || 'N/A'}</p>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md border border-slate-100">{receipt.type}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-slate-900">{fmt(receipt.amount)}</p>
                    </div>
                  </div>
                  
                  {/* Summary Rows */}
                  <div className="bg-slate-50/50 border-t border-slate-100 px-6 py-6 space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                      <span>Subtotal Amount</span>
                      <span>{fmt(receipt.amount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                      <span>Service Taxes (0%)</span>
                      <span>₹0.00</span>
                    </div>
                    <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-sm font-black text-slate-900 uppercase tracking-wider">Total Received</span>
                      <span className="text-3xl font-black text-[#044343] tracking-tighter">{fmt(receipt.amount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Section */}
              <div className="flex justify-between items-end">
                <div className="max-w-[240px]">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-50 pb-1">Declaration</p>
                  <p className="text-[10px] text-slate-400 font-bold italic leading-relaxed">
                    This document serves as proof of payment for the mentioned services. It is electronically generated and verified by Welib SaaS Infrastructure.
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-48 h-px bg-slate-200" />
                  <p className="text-[10px] font-black text-[#044343] uppercase tracking-[0.2em]">Authorized Signatory</p>
                  <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest leading-none">Welib Library Authority</p>
                </div>
              </div>

              <div className="mt-16 text-center">
                <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Thank you for your support</p>
                <p className="text-[9px] text-slate-400 font-medium mt-1">Visit us at www.welib.app</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Receipts</h1>
          <p className="text-slate-500 font-medium mt-1">Transaction proof and financial documents</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search receipt number..."
              className="pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl w-64 shadow-sm focus:ring-2 focus:ring-[#044343]/5 outline-none font-medium text-sm transition-all"
            />
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="table-main">
          <thead>
            <tr>
              <th className="px-6 text-left">Receipt No</th>
              <th className="text-left">Student</th>
              <th className="text-left">Category</th>
              <th className="text-left">Date</th>
              <th className="text-left">Amount</th>
              <th className="text-left">Status</th>
              <th className="text-right px-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && receipts.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-0">
                  <LoadingSkeleton type="table" rows={10} />
                </td>
              </tr>
            ) : receipts.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-0">
                  <EmptyState 
                    title="No Receipts Found" 
                    icon={Receipt} 
                    message="Any fee collection or fine payment will generate a receipt here."
                  />
                </td>
              </tr>
            ) : (
              receipts.map((receipt) => (
                <tr key={receipt._id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-teal-50 group-hover:text-[#044343] transition-colors border border-slate-100/50">
                        <FileText size={16} />
                      </div>
                      <span className="font-black text-slate-900 tracking-tight">{receipt.receiptNumber}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-slate-700">{receipt.studentId?.fullName || 'General'}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{receipt.studentId?.email || 'N/A'}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-lg">
                      {receipt.type || 'Payment'}
                    </span>
                  </td>
                  <td className="text-[13px] font-medium text-slate-600">
                    {format(new Date(receipt.date), 'dd MMM yyyy')}
                  </td>
                  <td>
                    <span className="text-[15px] font-black text-slate-900 tracking-tight">{fmt(receipt.amount)}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 text-emerald-600">
                      <CheckCircle2 size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Paid</span>
                    </div>
                  </td>
                  <td className="text-right px-6">
                    <button 
                      onClick={() => handleViewReceipt(receipt._id)}
                      className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-[#044343] hover:border-teal-100 hover:bg-teal-50/30 rounded-xl transition-all shadow-sm active:scale-95"
                    >
                      <Printer size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {totalReceipts > limit && (
          <Pagination
            total={totalReceipts}
            limit={limit}
            currentPage={currentPage}
            onPageChange={(p) => setCurrentPage(p)}
          />
        )}
      </div>

      <div className="flex items-center justify-between no-print pt-2">
        <p className="text-[12px] text-slate-500 font-bold uppercase tracking-widest">
          Showing {receipts.length} of {totalReceipts} documents
        </p>
      </div>

      <AnimatePresence>
        {selectedReceiptId && (
          <ReceiptModal
            receipt={currentReceipt}
            onClose={() => setSelectedReceiptId(null)}
          />
        )}
      </AnimatePresence>

      <style>{`
        @media print {
          @page { margin: 0; }
          body * { visibility: hidden; }
          #printable-receipt, #printable-receipt * { visibility: visible; }
          #printable-receipt {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            padding: 40px !important;
            margin: 0 !important;
            background: white !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Receipts;
