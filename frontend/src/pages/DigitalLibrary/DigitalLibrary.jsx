import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchResources, 
  addResource, 
  updateResource, 
  deleteResource,
  trackDownload 
} from '../../store/slices/resourceSlice';
import {
  BookOpen,
  FileText,
  Search,
  Plus,
  LayoutGrid,
  List,
  Download,
  Eye,
  MoreVertical,
  Globe,
  Lock,
  Filter,
  Trash2,
  Edit,
  X,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Clock,
  Archive,
  Star,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Pagination from '../../components/common/Pagination';

const CATEGORIES = [
  'Competitive Exams',
  'School Books',
  'College Books',
  'Notes',
  'Question Papers',
  'General Reading',
  'Custom Category'
];

const DigitalLibrary = () => {
  const dispatch = useDispatch();
  const { items, loading, total } = useSelector((state) => state.resources);
  
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedVisibility, setSelectedVisibility] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 12;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  
  const [filePreview, setFilePreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [resourceFile, setResourceFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const visibilityValue = watch('visibility', 'library');

  const loadData = useCallback(() => {
    dispatch(fetchResources({
      page: currentPage,
      limit,
      search: searchTerm,
      category: selectedCategory === 'All' ? undefined : selectedCategory,
      visibility: selectedVisibility === 'All' ? undefined : selectedVisibility.toLowerCase()
    }));
  }, [dispatch, currentPage, searchTerm, selectedCategory, selectedVisibility]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size exceeds 50MB limit');
        return;
      }
      setResourceFile(file);
      setFilePreview(file.name);
    }
  };

  const onCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, val]) => {
        if (val !== undefined && val !== null) formData.append(key, val);
      });
      
      if (resourceFile) formData.append('file', resourceFile);
      if (coverFile) formData.append('coverImage', coverFile);

      if (editingResource) {
        await dispatch(updateResource({ id: editingResource._id, data: formData })).unwrap();
        toast.success('Resource updated successfully');
      } else {
        await dispatch(addResource(formData)).unwrap();
        toast.success('Resource uploaded successfully');
      }
      closeModal();
      loadData();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const openModal = (resource = null) => {
    if (resource) {
      setEditingResource(resource);
      setValue('title', resource.title);
      setValue('description', resource.description);
      setValue('category', resource.category);
      setValue('subject', resource.subject);
      setValue('visibility', resource.visibility);
      setValue('isFeatured', resource.isFeatured);
      setFilePreview(resource.fileUrl?.split('/').pop());
      setCoverPreview(resource.coverImage);
    } else {
      reset({ visibility: 'library' });
      setEditingResource(null);
      setFilePreview(null);
      setCoverPreview(null);
      setResourceFile(null);
      setCoverFile(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingResource(null);
    reset();
    setFilePreview(null);
    setCoverPreview(null);
    setResourceFile(null);
    setCoverFile(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await dispatch(deleteResource(id)).unwrap();
        toast.success('Resource removed');
        loadData();
      } catch (err) {
        toast.error(err.message || 'Delete failed');
      }
    }
  };

  const handleDownload = (resource) => {
    dispatch(trackDownload(resource._id));
    window.open(resource.fileUrl, '_blank');
  };

  const stats = [
    { label: 'Total Assets', value: total, icon: Archive, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Global Access', value: items.filter(r => r.visibility === 'global').length, icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Private Notes', value: items.filter(r => r.visibility === 'library').length, icon: Lock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Downloads', value: items.reduce((acc, curr) => acc + (curr.downloadCount || 0), 0), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
            <span>Knowledge Base</span>
            <ChevronRight size={10} />
            <span className="text-[#044343]">Digital Library</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">E-Resource Repository</h1>
          <p className="text-slate-500 font-medium">Manage, share and track digital study materials and PDFs.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-[#044343] text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-xl shadow-teal-900/20 active:scale-95 transition-all w-fit"
        >
          <Upload size={18} />
          Upload Resource
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4"
          >
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-xl font-black text-slate-900">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl w-full focus:ring-2 focus:ring-[#044343]/5 outline-none font-bold text-xs"
            />
          </div>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none cursor-pointer h-[42px]"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select 
            value={selectedVisibility}
            onChange={(e) => setSelectedVisibility(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none cursor-pointer h-[42px]"
          >
            <option value="All">All Visibility</option>
            <option value="Library">Library Only</option>
            <option value="Global">Global Content</option>
          </select>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl self-end lg:self-auto">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-[#044343] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <LayoutGrid size={18} />
          </button>
          <button 
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white text-[#044343] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <LoadingSkeleton type={viewMode === 'grid' ? 'grid' : 'table'} cards={8} />
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {items.map((resource, i) => (
                <motion.div
                  key={resource._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-teal-900/5 transition-all group relative overflow-hidden flex flex-col"
                >
                  <div className="aspect-[4/5] relative overflow-hidden bg-slate-50 m-3 rounded-[2rem]">
                    {resource.coverImage ? (
                      <img src={resource.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-200">
                        <FileText size={64} />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 flex gap-2">
                       <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest backdrop-blur-md ${resource.visibility === 'global' ? 'bg-blue-500/10 text-blue-100' : 'bg-[#044343]/10 text-teal-100'}`}>
                         {resource.visibility}
                       </span>
                    </div>
                    {resource.isFeatured && (
                       <div className="absolute top-4 right-4 bg-amber-400 text-white p-2 rounded-xl shadow-lg">
                         <Star size={14} fill="currentColor" />
                       </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex gap-3">
                       <button 
                        onClick={() => handleDownload(resource)}
                        className="flex-1 bg-white text-[#044343] py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                       >
                         <Download size={14} /> Download
                       </button>
                       <button 
                        onClick={() => window.open(resource.fileUrl, '_blank')}
                        className="w-12 h-12 bg-white/20 backdrop-blur-md text-white rounded-2xl flex items-center justify-center hover:bg-white/30"
                       >
                         <Eye size={20} />
                       </button>
                    </div>
                  </div>
                  
                  <div className="p-6 pt-2 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-sm font-black text-slate-900 leading-tight group-hover:text-[#044343] transition-colors line-clamp-2">{resource.title}</h3>
                      <div className="flex gap-1 shrink-0">
                         <button onClick={() => openModal(resource)} className="p-1.5 text-slate-300 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all">
                           <Edit size={14} />
                         </button>
                         <button onClick={() => handleDelete(resource._id)} className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all">
                           <Trash2 size={14} />
                         </button>
                      </div>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{resource.category} • {resource.subject || 'No Subject'}</p>
                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-teal-50 flex items-center justify-center text-[#044343]">
                             <Clock size={12} />
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">{format(new Date(resource.createdAt), 'MMM dd, yyyy')}</span>
                       </div>
                       <div className="flex items-center gap-1.5 h-6 bg-slate-50 px-2.5 rounded-full">
                          <Download size={10} className="text-teal-600" />
                          <span className="text-[10px] font-black text-slate-600 tracking-tighter">{resource.downloadCount || 0}</span>
                       </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Details</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Uploaded By</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Visibility</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Downloads</th>
                      <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {items.map((resource) => (
                      <tr key={resource._id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-[#044343] flex items-center justify-center text-white shrink-0">
                               <FileText size={18} />
                             </div>
                             <div>
                               <p className="text-sm font-black text-slate-900 line-clamp-1">{resource.title}</p>
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{format(new Date(resource.createdAt), 'MMM dd, yyyy')}</p>
                             </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-tight">
                            {resource.category}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-[8px] font-black uppercase">
                                {resource.uploadedBy?.fullName?.charAt(0)}
                              </div>
                              <span className="text-xs font-bold text-slate-600 truncate max-w-[120px]">{resource.uploadedBy?.fullName}</span>
                           </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                           {resource.visibility === 'global' ? (
                             <Globe size={16} className="mx-auto text-blue-500" />
                           ) : (
                             <Lock size={16} className="mx-auto text-teal-600" />
                           )}
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-xs font-black text-slate-900">{resource.downloadCount || 0}</span>
                        </td>
                        <td className="px-8 py-5 text-right">
                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => window.open(resource.fileUrl, '_blank')} className="p-2 text-slate-400 hover:text-[#044343] hover:bg-slate-100 rounded-xl transition-all">
                               <Eye size={18} />
                             </button>
                             <button onClick={() => handleDownload(resource)} className="p-2 text-slate-400 hover:text-[#044343] hover:bg-slate-100 rounded-xl transition-all">
                               <Download size={18} />
                             </button>
                             <button onClick={() => openModal(resource)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                               <Edit size={18} />
                             </button>
                             <button onClick={() => handleDelete(resource._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                               <Trash2 size={18} />
                             </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <Pagination 
            total={total}
            limit={limit}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {/* Upload/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-hidden">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] p-10 shadow-2xl relative overflow-y-auto custom-scrollbar"
            >
              <button onClick={closeModal} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 bg-slate-50 p-2 rounded-xl">
                <X size={24} />
              </button>
              
              <div className="mb-10">
                <h2 className="text-3xl font-black text-slate-900">{editingResource ? 'Modify Resource' : 'Publish New Resource'}</h2>
                <p className="text-slate-500 font-medium mt-1">Populate details and upload assets for students to access.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  
                  {/* Left: Files */}
                  <div className="space-y-10">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-Resource Asset (PDF) *</label>
                       <div className="relative group">
                         <input type="file" onChange={onFileChange} className="hidden" id="resourceFile" accept=".pdf" />
                         <label htmlFor="resourceFile" className="cursor-pointer block w-full aspect-video rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden hover:border-[#044343]/30 transition-all flex flex-col items-center justify-center gap-3 p-6 text-center">
                           {filePreview ? (
                             <>
                               <CheckCircle2 size={32} className="text-[#044343]" />
                               <span className="text-[10px] font-black text-[#044343] truncate w-full px-4">{filePreview}</span>
                               <span className="text-[8px] font-bold text-slate-400 uppercase">Click to Swap File</span>
                             </>
                           ) : (
                             <>
                               <FileText size={32} className="text-slate-300" />
                               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select PDF Document</span>
                               <span className="text-[8px] font-bold text-slate-300">Max Size: 50MB</span>
                             </>
                           )}
                         </label>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cover Preview (Optional)</label>
                       <div className="relative group">
                         <input type="file" onChange={onCoverChange} className="hidden" id="coverImg" accept="image/*" />
                         <label htmlFor="coverImg" className="cursor-pointer block w-full aspect-[4/5] rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden hover:border-[#044343]/30 transition-all">
                           {coverPreview ? (
                             <img src={coverPreview} className="w-full h-full object-cover" />
                           ) : (
                             <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                               <ImageIcon size={32} className="text-slate-300" />
                               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Upload Cover</span>
                             </div>
                           )}
                         </label>
                       </div>
                    </div>
                  </div>

                  {/* Right: Data */}
                  <div className="lg:col-span-2 space-y-10">
                    <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 space-y-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Title *</label>
                        <input {...register('title', { required: true })} className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 px-6 outline-none focus:ring-2 focus:ring-[#044343]/10 font-bold" placeholder="e.g. UPSC General Studies Notes 2024" />
                      </div>
                      <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category *</label>
                          <select {...register('category', { required: true })} className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 px-6 outline-none focus:ring-2 focus:ring-[#044343]/10 font-bold text-sm appearance-none h-[52px]">
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                          <input {...register('subject')} className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 px-6 outline-none focus:ring-2 focus:ring-[#044343]/10 font-bold" placeholder="e.g. Geography" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                        <textarea {...register('description')} rows="4" className="w-full bg-white border border-slate-200 rounded-3xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#044343]/10 resize-none font-medium text-sm" placeholder="Detailed summary of the material content..."></textarea>
                      </div>
                    </div>

                    <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 space-y-8">
                       <div className="flex flex-col md:flex-row gap-8">
                          <div className="flex-1 space-y-4">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                               <Eye size={12} className="text-[#044343]" />
                               Visibility Policy
                             </label>
                             <div className="grid grid-cols-2 gap-3">
                                <label className={`cursor-pointer group flex flex-col p-4 rounded-2xl border-2 transition-all ${visibilityValue === 'library' ? 'bg-[#044343] border-[#044343]' : 'bg-white border-slate-100 hover:border-[#044343]/20'}`}>
                                   <input type="radio" value="library" {...register('visibility')} className="hidden" />
                                   <Lock size={18} className={`mb-2 ${visibilityValue === 'library' ? 'text-white/60' : 'text-slate-400 group-hover:text-[#044343]'}`} />
                                   <span className={`text-[10px] font-black uppercase tracking-widest ${visibilityValue === 'library' ? 'text-white' : 'text-slate-600'}`}>Library Private</span>
                                </label>
                                <label className={`cursor-pointer group flex flex-col p-4 rounded-2xl border-2 transition-all ${visibilityValue === 'global' ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-100 hover:border-blue-600/20'}`}>
                                   <input type="radio" value="global" {...register('visibility')} className="hidden" />
                                   <Globe size={18} className={`mb-2 ${visibilityValue === 'global' ? 'text-white/60' : 'text-slate-400 group-hover:text-blue-600'}`} />
                                   <span className={`text-[10px] font-black uppercase tracking-widest ${visibilityValue === 'global' ? 'text-white' : 'text-slate-600'}`}>Global Public</span>
                                </label>
                             </div>
                          </div>

                          <div className="flex-1 space-y-4">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                               <TrendingUp size={12} className="text-[#044343]" />
                               Promotion Options
                             </label>
                             <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${watch('isFeatured') ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-300'}`}>
                                     <Star size={18} fill={watch('isFeatured') ? 'currentColor' : 'none'} />
                                   </div>
                                   <div>
                                     <p className="text-[10px] font-black text-slate-900 uppercase">Mark as Featured</p>
                                     <p className="text-[8px] font-bold text-slate-400">Pin to top of recommendations</p>
                                   </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" {...register('isFeatured')} className="sr-only peer" />
                                  <div className="w-11 h-6 bg-slate-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#044343]"></div>
                                </label>
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button type="button" onClick={closeModal} className="flex-1 bg-white border border-slate-200 text-slate-400 font-black py-5 rounded-3xl transition-all uppercase tracking-widest text-sm">
                    Discard Entry
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="flex-[2] bg-[#044343] text-white font-black py-5 rounded-3xl shadow-xl shadow-teal-900/10 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : (editingResource ? 'Update Metadata' : 'Initiate Asset Sync')}
                    {!loading && <ArrowRight size={20} />}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DigitalLibrary;
