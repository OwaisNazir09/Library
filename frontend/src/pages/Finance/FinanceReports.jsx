import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, PieChart, TrendingUp, TrendingDown, 
  Calendar, FileText, Download, IndianRupee, Users, 
  AlertCircle, ChevronRight, Filter
} from 'lucide-react';
import { 
  useGetDailyReportQuery, 
  useGetMonthlyReportQuery, 
  useGetPendingReportQuery, 
  useGetPLReportQuery 
} from '../../store/api/financeApi';
import { format } from 'date-fns';

const FinanceReports = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const dailyReport = useGetDailyReportQuery({ date }, { skip: activeTab !== 'daily' });
  const monthlyReport = useGetMonthlyReportQuery(undefined, { skip: activeTab !== 'monthly' });
  const pendingReport = useGetPendingReportQuery(undefined, { skip: activeTab !== 'pending' });
  const plReport = useGetPLReportQuery(undefined, { skip: activeTab !== 'pl' });

  const reports = {
    daily: dailyReport.data,
    monthly: monthlyReport.data,
    pending: pendingReport.data,
    pl: plReport.data
  };

  const loading = dailyReport.isFetching || monthlyReport.isFetching || pendingReport.isFetching || plReport.isFetching;

  const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

  const tabs = [
    { id: 'daily', label: 'Daily Collection', icon: Calendar },
    { id: 'monthly', label: 'Monthly Revenue', icon: BarChart3 },
    { id: 'pending', label: 'Pending Fees', icon: AlertCircle },
    { id: 'pl', label: 'Profit & Loss', icon: TrendingUp },
  ];

  const TableHeader = ({ cols }) => (
    <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
      <tr>
        {cols.map((c, i) => (
          <th key={i} className={`px-8 py-5 ${c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left'}`}>
            {c.label}
          </th>
        ))}
      </tr>
    </thead>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Financial Reports</h1>
          <p className="text-slate-500 font-medium mt-1">Detailed analytics and accounting insights</p>
        </div>
        <button className="flex items-center gap-2 bg-[#044343] text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-teal-900/10 hover:bg-[#033636] transition-all">
          <Download size={14} /> Export All Data
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 bg-slate-100/50 p-2 rounded-3xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-[#044343] shadow-sm' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'daily' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-50 text-[#044343] rounded-2xl flex items-center justify-center">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Date</p>
                    <input 
                      type="date" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)}
                      className="text-lg font-black text-slate-900 bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex gap-8 px-8 border-l border-slate-50">
                   <div className="text-right">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Income</p>
                     <p className="text-2xl font-black text-emerald-600">{fmt(reports.daily?.summary?.income)}</p>
                   </div>
                   <div className="text-right pl-8 border-l border-slate-50">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Expense</p>
                     <p className="text-2xl font-black text-rose-500">{fmt(reports.daily?.summary?.expense)}</p>
                   </div>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <TableHeader cols={[
                    { label: 'Time' },
                    { label: 'Description' },
                    { label: 'Student / Account' },
                    { label: 'Type', align: 'center' },
                    { label: 'Amount', align: 'right' },
                  ]} />
                  <tbody className="divide-y divide-slate-50">
                    {reports.daily?.transactions.map((tx) => (
                      <tr key={tx._id} className="hover:bg-slate-50/30 transition-colors group">
                        <td className="px-8 py-5 text-xs font-bold text-slate-500">{format(new Date(tx.date), 'hh:mm a')}</td>
                        <td className="px-6 py-5">
                          <span className="text-sm font-black text-slate-900">{tx.description}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-xs font-bold text-slate-600">{tx.studentId?.fullName || '-'}</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                            tx.type === 'expense' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className={`px-8 py-5 text-right font-black ${tx.type === 'expense' ? 'text-rose-500' : 'text-emerald-600'}`}>
                          {fmt(tx.amount)}
                        </td>
                      </tr>
                    ))}
                    {reports.daily?.transactions.length === 0 && (
                      <tr><td colSpan="5" className="px-8 py-12 text-center text-slate-400 font-bold italic">No activity for this date.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'monthly' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                 <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm h-full flex flex-col justify-center gap-8">
                    <div className="text-center">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Net Monthly Profit</p>
                       <p className="text-5xl font-black text-slate-900 tracking-tighter">{fmt(reports.monthly?.netProfit)}</p>
                    </div>
                    <div className="space-y-4">
                       <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl">
                          <span className="text-xs font-bold text-emerald-800">Total Income</span>
                          <span className="font-black text-emerald-600">{fmt(reports.monthly?.totalIncome)}</span>
                       </div>
                       <div className="flex items-center justify-between p-4 bg-rose-50 rounded-2xl">
                          <span className="text-xs font-bold text-rose-800">Total Expenses</span>
                          <span className="font-black text-rose-500">{fmt(reports.monthly?.totalExpenses)}</span>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="lg:col-span-2">
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-8 py-6 border-b border-slate-50">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Revenue Breakdown</h3>
                  </div>
                  <table className="w-full text-left">
                    <TableHeader cols={[
                      { label: 'Category' },
                      { label: 'Type', align: 'center' },
                      { label: 'Total', align: 'right' },
                    ]} />
                    <tbody className="divide-y divide-slate-50">
                      {reports.monthly?.byCategory.map((cat, i) => (
                        <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-8 py-5 font-black text-slate-900 text-sm">{cat._id.category.replace('_', ' ')}</td>
                          <td className="px-6 py-5 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                              cat._id.type === 'expense' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                            }`}>
                              {cat._id.type}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right font-black text-slate-900">{fmt(cat.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pending' && (
            <div className="space-y-6 text-center">
               <div className="bg-rose-50 p-10 rounded-[2.5rem] border border-rose-100 inline-block w-full max-w-md">
                 <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">Total Receivables</p>
                 <p className="text-5xl font-black text-rose-600 tracking-tighter">{fmt(reports.pending?.totalPending)}</p>
                 <p className="text-xs font-bold text-rose-400 mt-4">Across {reports.pending?.accounts.length} student accounts</p>
               </div>
               
               <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden text-left">
                 <table className="w-full">
                    <TableHeader cols={[
                      { label: 'Student' },
                      { label: 'ID Number' },
                      { label: 'Phone' },
                      { label: 'Pending Balance', align: 'right' },
                    ]} />
                    <tbody>
                      {reports.pending?.accounts.map((acc) => (
                        <tr key={acc._id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-8 py-5 font-black text-slate-900">{acc.studentId?.fullName}</td>
                          <td className="px-6 py-5 text-xs font-bold text-slate-400">{acc.studentId?.idNumber}</td>
                          <td className="px-6 py-5 text-xs font-bold text-slate-400">{acc.studentId?.phone}</td>
                          <td className="px-8 py-5 text-right font-black text-rose-500">{fmt(acc.currentBalance)}</td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
            </div>
          )}

          {activeTab === 'pl' && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Yearly Profit & Loss Account</h3>
                  <p className="text-sm font-black text-slate-400 uppercase tracking-widest">{reports.pl?.year}</p>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {reports.pl?.months.map((m) => (
                    <div key={m.month} className="p-6 bg-slate-50/50 rounded-2xl border border-slate-50 flex flex-col gap-4">
                       <span className="text-[10px] font-black text-[#044343] uppercase tracking-widest">
                         {format(new Date(2022, m.month - 1, 1), 'MMMM')}
                       </span>
                       <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-400"><span>Income:</span> <span>{fmt(m.income)}</span></div>
                          <div className="flex justify-between text-[10px] font-bold text-slate-400"><span>Expense:</span> <span>{fmt(m.expense)}</span></div>
                          <div className="w-full h-px bg-slate-100 my-2" />
                          <div className={`flex justify-between font-black ${m.net >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                             <span>NET:</span> <span>{fmt(m.net)}</span>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
               
               <div className="mt-12 p-8 bg-slate-900 rounded-[2rem] text-white flex flex-wrap gap-12 items-center justify-center">
                  <div className="text-center">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Annual Income</p>
                     <p className="text-2xl font-black">{fmt(reports.pl?.yearTotal?.income)}</p>
                  </div>
                  <div className="text-center">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Annual Expense</p>
                     <p className="text-2xl font-black">{fmt(reports.pl?.yearTotal?.expense)}</p>
                  </div>
                  <div className="text-center">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Net Annual Profit</p>
                     <p className={`text-4xl font-black ${reports.pl?.yearTotal?.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                       {fmt(reports.pl?.yearTotal?.net)}
                     </p>
                  </div>
               </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default FinanceReports;
