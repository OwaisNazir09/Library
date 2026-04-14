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
  const receipts = receiptsData?.receipts || [];
  const totalReceipts = receiptsData?.total || 0;

  const { data: currentReceiptDoc } = useGetReceiptQuery(selectedReceiptId, { skip: !selectedReceiptId });
  const currentReceipt = currentReceiptDoc?.receipt;

  const handleViewReceipt = (id) => {
    setSelectedReceiptId(id);
  };

  const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

  const ReceiptModal = ({ receipt, onClose }) => {
    if (!receipt) return null;
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl relative overflow-hidden my-auto"
        >
          {/* Action Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-50 no-print">
            <div className="flex gap-2">
              <button onClick={() => window.print()} className="p-2.5 bg-slate-50 text-slate-500 hover:text-[#044343] hover:bg-teal-50 rounded-xl transition-all">
                <Printer size={20} />
              </button>
              <button className="p-2.5 bg-slate-50 text-slate-500 hover:text-[#044343] hover:bg-teal-50 rounded-xl transition-all">
                <Download size={20} />
              </button>
              <button className="p-2.5 bg-slate-50 text-slate-500 hover:text-[#044343] hover:bg-teal-50 rounded-xl transition-all">
                <Share2 size={20} />
              </button>
            </div>
            <button onClick={onClose} className="p-2.5 text-slate-400 hover:text-slate-900 transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Receipt Content */}
          <div className="p-12" id="printable-receipt">
            {/* Logo & Header */}
            <div className="flex justify-between items-start mb-12">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#044343] rounded-2xl flex items-center justify-center shadow-lg shadow-teal-900/20 text-white">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Bookary</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Library Management</p>
                </div>
              </div>
              <div className="text-right">
                <h4 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Receipt</h4>
                <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">No: {receipt.receiptNumber}</p>
              </div>
            </div>

            {/* Main Info */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-8 mb-12">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Student Details</p>
                <p className="text-lg font-black text-slate-900">{receipt.studentId?.fullName}</p>
                <p className="text-sm font-bold text-slate-500 mt-1">{receipt.studentId?.email}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">ID: {receipt.studentId?.idNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Receipt Info</p>
                <p className="text-sm font-bold text-slate-900">Date: {format(new Date(receipt.date), 'dd MMMM yyyy')}</p>
                <p className="text-sm font-bold text-slate-900 mt-1">Status: <span className="text-emerald-500">PAID</span></p>
                <p className="text-sm font-bold text-slate-900 mt-1">Method: {receipt.paymentMethod?.toUpperCase()}</p>
              </div>
            </div>

            {/* Table */}
            <div className="border-y border-slate-100 py-6 mb-12">
              <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-4">
                <span>Description</span>
                <span>Amount</span>
              </div>
              <div className="flex justify-between items-center px-4 py-3 bg-slate-50 rounded-2xl">
                <div className="flex flex-col">
                  <span className="text-sm font-black text-slate-900">{receipt.description}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{receipt.type}</span>
                </div>
                <span className="text-lg font-black text-slate-900">{fmt(receipt.amount)}</span>
              </div>
            </div>

            {/* Footer Total */}
            <div className="flex flex-col items-end px-4 gap-2">
               <div className="flex items-center gap-12">
                  <span className="text-xs font-black text-orange-400 uppercase tracking-[0.2em]">Paid Amount</span>
                  <span className="text-4xl font-black text-slate-900 tracking-tighter">{fmt(receipt.amount)}</span>
               </div>
               <div className="w-full h-px bg-slate-100 my-4" />
               <p className="text-[10px] text-slate-400 font-bold max-w-xs text-right italic">
                 Note: This is a computer generated receipt and does not require a physical signature.
               </p>
            </div>
            
            <div className="mt-12 pt-12 border-t border-dashed border-slate-200 text-center">
              <p className="text-xs font-bold text-slate-400">Thank you for choosing Bookary Library Services.</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading && receipts.length === 0 ? (
          Array.from({ length: 8 }).map((_, i) => (
             <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm h-48 animate-pulse">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl mb-4" />
                <div className="h-4 bg-slate-100 rounded-full w-2/3 mb-2" />
                <div className="h-3 bg-slate-50 rounded-full w-1/2" />
             </div>
          ))
        ) : receipts.map((receipt) => (
          <motion.div
            key={receipt._id}
            whileHover={{ y: -5, shadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
            onClick={() => handleViewReceipt(receipt._id)}
            className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm transition-all cursor-pointer group hover:border-[#044343]/20"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 bg-slate-50 group-hover:bg-teal-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-[#044343] transition-colors">
                <Receipt size={24} />
              </div>
              <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                PAID
              </span>
            </div>
            
            <h4 className="text-sm font-black text-slate-900 mb-1">{receipt.receiptNumber}</h4>
            <p className="text-xs font-bold text-slate-500 truncate mb-4">{receipt.studentId?.fullName || 'General'}</p>
            
            <div className="flex items-end justify-between pt-4 border-t border-slate-50 mt-auto">
              <div>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{format(new Date(receipt.date), 'dd MMM yyyy')}</p>
              </div>
              <p className="text-lg font-black text-slate-900 tracking-tight">{fmt(receipt.amount)}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {!loading && receipts.length === 0 && (
         <div className="bg-white p-20 rounded-[3rem] border border-slate-50 shadow-sm text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-200">
               <Receipt size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-900">No Receipts Generated</h3>
            <p className="text-slate-400 mt-2 font-medium">Any fee collection or fine payment will generate a receipt here.</p>
         </div>
      )}

      {totalReceipts > limit && (
        <Pagination 
          total={totalReceipts}
          limit={limit}
          currentPage={currentPage}
          onPageChange={(p) => setCurrentPage(p)}
        />
      )}

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
          body * { visibility: hidden; }
          #printable-receipt, #printable-receipt * { visibility: visible; }
          #printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Receipts;
