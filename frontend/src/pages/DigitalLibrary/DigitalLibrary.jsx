import React, { useState } from 'react';
import { useGetResourcesQuery, useAddResourceMutation, useUpdateResourceMutation, useDeleteResourceMutation, useTrackDownloadMutation } from '../../store/api/digitalLibraryApi';
import {
  BookOpen, FileText, Search, Plus, LayoutGrid, List, Download, Eye, 
  MoreVertical, Globe, Lock, Filter, Trash2, Edit, X, Upload, ImageIcon, 
  CheckCircle2, ArrowRight, TrendingUp, Clock, Archive, Star, 
  ChevronRight, Loader2, Book, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../hooks/useSubscription';

const DigitalLibrary = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const limit = 8;

  const { data: resourcesData, isLoading: loading, error, refetch } = useGetResourcesQuery({
    page: currentPage,
    limit,
    search: searchTerm,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    visibility: visibilityFilter !== 'all' ? visibilityFilter : undefined
  });

  const [addResource, { isLoading: isAdding }] = useAddResourceMutation();
  const [updateResource, { isLoading: isUpdating }] = useUpdateResourceMutation();
  const [deleteResource] = useDeleteResourceMutation();
  const [trackDownloadMutation] = useTrackDownloadMutation();

  const items = resourcesData?.data?.resources || [];
  const total = resourcesData?.total || 0;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [resourceFile, setResourceFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const visibilityValue = watch('visibility', 'library');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) { setResourceFile(file); setFilePreview(file.name); }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) { setCoverFile(file); setCoverPreview(URL.createObjectURL(file)); }
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") formData.append(key, val);
    });
    if (resourceFile) formData.append('file', resourceFile);
    if (coverFile) formData.append('coverImage', coverFile);

    try {
      if (editingResource) {
        await updateResource({ id: editingResource._id, data: formData }).unwrap();
        toast.success('Resource updated');
      } else {
        await addResource(formData).unwrap();
        toast.success('Resource published');
      }
      closeModal();
    } catch (err) {}
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
      setEditingResource(null);
      reset({ visibility: 'library', category: 'School Books' });
      setFilePreview(null); setCoverPreview(null); setResourceFile(null); setCoverFile(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false); reset(); setEditingResource(null);
    setFilePreview(null); setCoverPreview(null); setResourceFile(null); setCoverFile(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this resource?')) {
      try {
        await deleteResource(id).unwrap();
        toast.success('Resource removed');
      } catch (err) {}
    }
  };

  const handleDownload = (resource) => {
    trackDownloadMutation(resource._id);
    window.open(resource.fileUrl, '_blank');
  };

  const { isExpired, hasFeature } = useSubscription();

  if (!hasFeature('digitalLibrary')) {
    return (
      <div className="card py-20 flex flex-col items-center justify-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-amber-50 flex items-center justify-center text-amber-600">
          <Lock size={40} />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Module Locked</h2>
          <p className="text-slate-500 max-w-sm">The Digital Repository module is not included in your current subscription plan. Contact your administrator to upgrade.</p>
        </div>
        <button onClick={() => navigate('/app/packages')} className="btn btn-primary btn-md px-10">View Plans</button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Digital Repository</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage digital assets, notes and e-books</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search assets..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-56 bg-white border border-slate-200 rounded-lg h-[34px] pl-8 pr-3 text-[13px] outline-none focus:ring-2 focus:ring-teal-500/10 transition-all" />
          </div>
          <button 
            onClick={() => !isExpired && openModal()} 
            className={`btn btn-primary btn-md ${isExpired ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
            title={isExpired ? 'Subscription Expired' : ''}
          >
            <Plus size={16} /> <span className="hidden sm:inline">Upload Resource</span>
          </button>
        </div>
      </div>

      <div className="card py-2 px-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
           <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-transparent text-[11px] font-bold text-slate-500 uppercase tracking-wider outline-none border-r border-slate-100 pr-3 cursor-pointer">
             <option value="all">All Categories</option>
             <option value="School Books">School Books</option>
             <option value="College Books">College Books</option>
             <option value="Competitive Exams">Competitive Exams</option>
           </select>
           <select value={visibilityFilter} onChange={(e) => setVisibilityFilter(e.target.value)} className="bg-transparent text-[11px] font-bold text-slate-500 uppercase tracking-wider outline-none cursor-pointer">
             <option value="all">All Visibility</option>
             <option value="global">Global</option>
             <option value="library">Library Only</option>
           </select>
        </div>
        <div className="flex bg-slate-50 p-0.5 rounded-md border border-slate-100">
          <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded transition-all ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}><LayoutGrid size={14} /></button>
          <button onClick={() => setViewMode('table')} className={`p-1.5 rounded transition-all ${viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}><List size={14} /></button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton type={viewMode === 'grid' ? 'grid' : 'table'} rows={8} />
      ) : items.length === 0 ? (
        <div className="card py-20 flex flex-col items-center"><FileText size={48} className="text-slate-200 mb-4" /><p className="text-sm font-medium text-slate-400">No resources found matching filters.</p></div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((resource) => (
            <div key={resource._id} className="card p-2 group hover:border-teal-500/30 transition-all">
              <div className="aspect-[4/5] bg-slate-50 rounded-lg overflow-hidden relative mb-3">
                {resource.coverImage ? (
                  <img src={resource.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-200"><FileText size={40} className="opacity-50" /></div>
                )}
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                   <span className={`badge ${resource.visibility === 'global' ? 'badge-info' : 'badge-neutral'} lowercase`}>{resource.visibility}</span>
                </div>
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                   <button onClick={() => handleDownload(resource)} className="w-9 h-9 bg-white text-slate-900 rounded-lg flex items-center justify-center hover:scale-110 transition-transform"><Download size={16} /></button>
                   <button onClick={() => navigate(`/app/digital-library/${resource._id}`)} className="w-9 h-9 bg-white text-slate-900 rounded-lg flex items-center justify-center hover:scale-110 transition-transform"><Eye size={16} /></button>
                </div>
              </div>
              <div className="px-1">
                <h3 className="text-[13px] font-bold text-slate-900 truncate leading-tight">{resource.title}</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-1 truncate uppercase tracking-tighter">{resource.subject || resource.category}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                   <div className="flex items-center gap-1.5"><Download size={10} className="text-slate-300" /><span className="text-[10px] font-bold text-slate-400">{resource.downloadCount || 0}</span></div>
                   <button onClick={() => openModal(resource)} className="text-slate-300 hover:text-slate-900"><MoreVertical size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-container">
          <table className="table-main">
            <thead>
              <tr>
                <th className="px-5">Asset</th>
                <th>Category</th>
                <th className="text-center">Visibility</th>
                <th className="text-center">Usage</th>
                <th className="text-right px-5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(res => (
                <tr key={res._id}>
                  <td className="px-5">
                    <div className="flex items-center gap-3">
                       <div className="w-7 h-9 bg-teal-50 rounded flex items-center justify-center text-teal-600 border border-teal-100"><FileText size={14} /></div>
                       <div className="min-w-0"><p className="text-[13px] font-bold text-slate-900 truncate max-w-[200px]">{res.title}</p></div>
                    </div>
                  </td>
                  <td><span className="badge badge-neutral lowercase">{res.category}</span></td>
                  <td className="text-center"><span className={`badge ${res.visibility === 'global' ? 'badge-info' : 'badge-neutral'} lowercase`}>{res.visibility}</span></td>
                  <td className="text-center text-[12px] font-bold text-slate-700">{res.downloadCount || 0} DLs</td>
                  <td className="px-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                       <button onClick={() => handleDownload(res)} className="btn btn-ghost btn-sm w-7 h-7 p-0"><Download size={14} /></button>
                       <button onClick={() => openModal(res)} className="btn btn-ghost btn-sm w-7 h-7 p-0"><Edit size={14} /></button>
                       <button onClick={() => handleDelete(res._id)} className="btn btn-ghost btn-sm w-7 h-7 p-0 text-rose-400 hover:text-rose-600"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination total={total} limit={limit} currentPage={currentPage} onPageChange={setCurrentPage} />

      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-wrapper">
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-panel w-full max-w-2xl">
               <div className="modal-h">
                 <h2 className="text-sm font-bold">{editingResource ? 'Edit Resource Metadata' : 'Publish New Resource'}</h2>
                 <button onClick={closeModal} className="text-slate-400 hover:text-slate-900"><X size={18} /></button>
               </div>
               <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
                 <div className="modal-b grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                       <div className="aspect-[3/4] bg-slate-50 border border-dashed border-slate-200 rounded-lg relative overflow-hidden flex flex-col items-center justify-center">
                          <input type="file" onChange={handleCoverChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                          {coverPreview ? <img src={coverPreview} className="w-full h-full object-cover" /> : <div className="text-center p-4"><ImageIcon size={24} className="text-slate-300 mx-auto" /><p className="text-[10px] text-slate-400 font-bold mt-2 uppercase">Cover Image</p></div>}
                       </div>
                       <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg relative flex flex-col items-center justify-center gap-2">
                          <input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" className="absolute inset-0 opacity-0 cursor-pointer" />
                          <Upload size={18} className="text-teal-600" />
                          <p className="text-[10px] font-bold text-slate-500 uppercase text-center line-clamp-1">{filePreview || 'Select Document'}</p>
                       </div>
                    </div>
                    <div className="md:col-span-2 space-y-4">
                       <div className="space-y-1.5"><label className="label">Resource Title *</label><input {...register('title', { required: true })} className="input" /></div>
                       <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1.5"><label className="label">Category</label><select {...register('category')} className="input"><option value="School Books">School Books</option><option value="College Books">College Books</option></select></div>
                         <div className="space-y-1.5"><label className="label">Subject</label><input {...register('subject')} className="input" /></div>
                       </div>
                       <div className="space-y-1.5"><label className="label">Visibility</label><div className="flex gap-4"><label className="flex items-center gap-2 text-[12px] font-medium"><input type="radio" {...register('visibility')} value="library" /> Library Only</label><label className="flex items-center gap-2 text-[12px] font-medium"><input type="radio" {...register('visibility')} value="global" /> Global Portal</label></div></div>
                       <div className="space-y-1.5"><label className="label">Description</label><textarea {...register('description')} rows={3} className="input h-auto py-2 resize-none" /></div>
                    </div>
                 </div>
                 <div className="modal-f">
                    <button type="button" onClick={closeModal} className="btn btn-secondary btn-md px-6">Cancel</button>
                    <button type="submit" disabled={isAdding || isUpdating} className="btn btn-primary btn-md px-8 min-w-[140px]">{isAdding || isUpdating ? <Loader2 size={16} className="animate-spin" /> : 'Publish Asset'}</button>
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
