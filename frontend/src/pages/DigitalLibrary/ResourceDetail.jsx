import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetResourcesQuery, useTrackDownloadMutation } from '../../store/api/digitalLibraryApi';
import {
  ArrowLeft,
  Download,
  Eye,
  FileText,
  Clock,
  User,
  Globe,
  Lock,
  Star,
  Calendar,
  Share2,
  Bookmark,
  ShieldCheck,
  Archive,
  Book,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';
import { motion } from 'framer-motion';

const ResourceDetail = () => {
  const { resourceId } = useParams();
  const navigate = useNavigate();
  const { data: resourcesData, isLoading: loading, error } = useGetResourcesQuery();
  const [trackDownload] = useTrackDownloadMutation();

  const resource = resourcesData?.data?.resources?.find(r => r._id === resourceId);

  const handleDownload = () => {
    if (!resource) return;
    trackDownload(resource._id);
    window.open(resource.fileUrl, '_blank');
  };

  if (loading) return <div className="p-8"><LoadingSkeleton type="card" rows={1} /></div>;
  if (error || !resource) return <div className="p-8"><ErrorState message="Resource not found" onRetry={() => navigate(-1)} /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      {/* ENTERPRISE BREADCRUMBS */}
      <nav className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
        <span className="hover:text-[#044343] cursor-pointer" onClick={() => navigate('/app/dashboard')}>Console</span>
        <ChevronRight size={10} />
        <span className="hover:text-[#044343] cursor-pointer" onClick={() => navigate('/app/digital-library')}>Digital Library</span>
        <ChevronRight size={10} />
        <span className="text-slate-900">Resource Asset</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: MAIN ASSET VIEW (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${resource.visibility === 'global' ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'}`}>
                    {resource.visibility} ACCESS
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{resource.category}</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  {resource.title}
                </h1>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  className="bg-[#044343] text-white px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-[#033636] transition-colors shadow-md shadow-teal-900/10"
                >
                  <Download size={14} /> Download PDF
                </button>
              </div>
            </div>

            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pb-8 border-b border-slate-100">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Added Date</p>
                  <p className="text-sm font-black text-slate-900">{format(new Date(resource.createdAt), 'MMM dd, yyyy')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Usage</p>
                  <p className="text-sm font-black text-slate-900">{resource.downloadCount || 0} Downloads</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asset Subject</p>
                  <p className="text-sm font-black text-[#044343]">{resource.subject || 'General'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asset Integrity</p>
                  <p className="text-sm font-black text-emerald-600 uppercase tracking-tighter flex items-center gap-1">
                    <ShieldCheck size={14} /> Verified
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                  <FileText size={14} className="text-[#044343]" />
                  Material Abstract
                </h3>
                <div className="bg-slate-50/50 p-6 rounded-lg border border-slate-100">
                  <p className="text-slate-600 font-medium leading-relaxed text-[15px] whitespace-pre-wrap">
                    {resource.description || "No technical description provided for this digital asset. This resource belongs to the " + resource.category + " collection and is intended for verified institutional use. All metadata has been verified for accuracy by the library administration."}
                  </p>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-[#044343] flex items-center justify-center text-white font-black text-lg">
                    {resource.uploadedBy?.fullName?.charAt(0) || 'L'}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Authorized By</p>
                    <p className="text-xs font-black text-slate-900">{resource.uploadedBy?.fullName || 'Librarian'}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Last Sync</p>
                    <p className="text-xs font-bold text-slate-600">{format(new Date(resource.updatedAt || resource.createdAt), 'MMM dd, HH:mm')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Technical Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              {[
                { label: 'File Format', value: 'Portable Document Format (PDF)' },
                { label: 'Security Layer', value: 'AES-256 Cloud Encryption' },
                { label: 'MIME Type', value: 'application/pdf' },
                { label: 'Compliance', value: 'Library Resource Policy v2.1' },
                { label: 'Storage Cluster', value: 'Asset Hub Node-04' },
                { label: 'Access Protocol', value: resource.visibility.toUpperCase() },
              ].map((spec, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0 md:last:border-b">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{spec.label}</span>
                  <span className="text-[11px] font-black text-slate-900">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTION PANEL (4 COLS) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <div className="aspect-[3/4] rounded-lg bg-slate-100 mb-6 overflow-hidden border border-slate-200 relative group">
              {resource.coverImage ? (
                <img src={resource.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                  <FileText size={48} className="opacity-40" />
                  <span className="text-[9px] font-black uppercase tracking-widest mt-2">Preview Restricted</span>
                </div>
              )}
              <div className="absolute top-4 right-4">
                <button className="w-8 h-8 bg-white/90 backdrop-blur rounded shadow-sm flex items-center justify-center text-slate-400 hover:text-[#044343] transition-colors">
                  <Star size={14} />
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => window.open(resource.fileUrl, '_blank')}
                className="w-full py-3 bg-slate-50 text-slate-600 rounded-lg font-black text-[10px] uppercase tracking-widest border border-slate-200 hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
              >
                <Eye size={16} /> Instant Preview
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button className="py-2.5 bg-white text-slate-400 rounded-lg font-black text-[9px] uppercase tracking-widest border border-slate-100 hover:text-slate-600 transition-all">
                  Archive
                </button>
                <button className="py-2.5 bg-white text-slate-400 rounded-lg font-black text-[9px] uppercase tracking-widest border border-slate-100 hover:text-slate-600 transition-all">
                  Share
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#044343] rounded-xl p-6 text-white shadow-xl shadow-teal-900/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">
                <TrendingUp size={16} className="text-teal-400" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest">Asset Analytics</h3>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-white/5 rounded border border-white/10">
                <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest leading-none mb-1">Global Views</p>
                <p className="text-xl font-black">{resource.viewCount || 0}</p>
              </div>
              <div className="p-3 bg-white/5 rounded border border-white/10">
                <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest leading-none mb-1">Total Conversions</p>
                <p className="text-xl font-black">{resource.downloadCount || 0}</p>
              </div>
            </div>
            <button className="w-full mt-6 py-2 bg-white text-[#044343] rounded font-black text-[10px] uppercase tracking-widest hover:bg-teal-50 transition-colors">
              Generate Usage Report
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-4">Administration</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock size={12} className="text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-600">Locked Asset</span>
                </div>
                <div className="w-8 h-4 bg-slate-100 rounded-full relative">
                  <div className="absolute top-1 left-1 w-2 h-2 bg-slate-300 rounded-full" />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium italic">Assets marked as locked cannot be modified or deleted until unlocked by an administrator.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetail;
