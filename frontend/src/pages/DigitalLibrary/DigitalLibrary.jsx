import React, { useState } from 'react';
import { useGetResourcesQuery, useAddResourceMutation, useUpdateResourceMutation, useDeleteResourceMutation, useTrackDownloadMutation } from '../../store/api/digitalLibraryApi';
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
  ImageIcon,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Clock,
  Archive,
  Star,
  ChevronRight,
  Loader2,
  Book,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

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
    if (file) {
      setResourceFile(file);
      setFilePreview(file.name);
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        formData.append(key, val);
      }
    });
    
    if (resourceFile) formData.append('file', resourceFile);
    if (coverFile) formData.append('coverImage', coverFile);

    try {
      if (editingResource) {
        await updateResource({ id: editingResource._id, data: formData }).unwrap();
        toast.success('Asset metadata updated');
      } else {
        await addResource(formData).unwrap();
        toast.success('Resource published to library');
      }
      closeModal();
    } catch (err) {
      // Handled globally
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
      setEditingResource(null);
      reset({
        visibility: 'library',
        category: 'School Books'
      });
      setFilePreview(null);
      setCoverPreview(null);
      setResourceFile(null);
      setCoverFile(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset();
    setEditingResource(null);
    setFilePreview(null);
    setCoverPreview(null);
    setResourceFile(null);
    setCoverFile(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await deleteResource(id).unwrap();
        toast.success('Resource removed from repository');
      } catch (err) {
        // Handled globally
      }
    }
  };

  const handleDownload = (resource) => {
    trackDownloadMutation(resource._id);
    window.open(resource.fileUrl, '_blank');
  };

  const openViewPage = (resource) => {
    navigate(`/app/digital-library/${resource._id}`);
  };

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[12px] font-medium text-slate-500 uppercase tracking-widest mb-1">
            <span>Inventory</span>
            <ChevronRight size={12} />
            <span className="text-[#044343]">Digital Library</span>
          </div>
          <h1>Digital Repository</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search assets, titles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-9 w-64"
            />
          </div>
          <button
            onClick={() => openModal()}
            className="btn btn-primary btn-default"
          >
            <Plus size={16} />
            Upload Resource
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-transparent text-[12px] font-black text-slate-600 uppercase tracking-widest outline-none border-r border-slate-100 pr-4 cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="School Books">School Books</option>
            <option value="College Books">College Books</option>
            <option value="Competitive Exams">Competitive Exams</option>
            <option value="General Knowledge">General Knowledge</option>
          </select>
          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            className="bg-transparent text-[12px] font-black text-slate-600 uppercase tracking-widest outline-none cursor-pointer"
          >
            <option value="all">All Visibility</option>
            <option value="global">Global</option>
            <option value="library">Library Only</option>
          </select>
        </div>
        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
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

      {loading ? (
        <LoadingSkeleton type={viewMode === 'grid' ? 'grid' : 'table'} cards={8} />
      ) : items.length === 0 ? (
        <EmptyState
          title="Digital Repository is Empty"
          message="Start building your digital library by uploading PDFs, study notes or research materials."
          onAction={() => openModal()}
          actionLabel="Upload First Asset"
          icon={FileText}
        />
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((resource, i) => (
                <motion.div
                  key={resource._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col h-full"
                >
                  <div className="aspect-[3/4] relative overflow-hidden bg-slate-50 m-2 rounded-2xl">
                    {resource.coverImage ? (
                      <img src={resource.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={resource.title} />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">
                        <FileText size={48} className="mb-4 opacity-50" />
                        <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Digital Asset</span>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-[#044343]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-5">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownload(resource)}
                          className="flex-1 bg-white text-[#044343] py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg"
                        >
                          <Download size={14} /> Download
                        </button>
                        <button
                          onClick={() => openViewPage(resource)}
                          className="w-10 h-10 bg-white/20 backdrop-blur-md text-white rounded-xl flex items-center justify-center hover:bg-white/30 transition-all"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                      <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest backdrop-blur-md border border-white/20 shadow-sm ${resource.visibility === 'global' ? 'bg-blue-500/50 text-white' : 'bg-teal-500/50 text-white'}`}>
                        {resource.visibility}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 pt-3 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h3 className="text-sm font-black text-slate-900 leading-tight group-hover:text-[#044343] transition-colors line-clamp-1">
                        {resource.title}
                      </h3>
                      <button onClick={() => openModal(resource)} className="p-1 text-slate-400 hover:text-[#044343] opacity-0 group-hover:opacity-100 transition-all">
                        <MoreVertical size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-6">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/50 flex flex-col gap-1 min-w-0">
                         <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Category</span>
                         <span className="text-[9px] font-black text-slate-900 truncate uppercase">{resource.category}</span>
                      </div>
                      <div className="bg-teal-50/50 p-2.5 rounded-xl border border-teal-100/30 flex flex-col gap-1 min-w-0">
                         <span className="text-[7px] font-black text-teal-400 uppercase tracking-widest">Subject</span>
                         <span className="text-[9px] font-black text-teal-900 truncate uppercase">{resource.subject || 'Ref'}</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-50 border border-white shadow-sm flex items-center justify-center text-[#044343] font-black text-[9px]">
                          {resource.uploadedBy?.fullName?.charAt(0) || 'L'}
                        </div>
                        <div className="flex flex-col leading-none">
                          <span className="text-[9px] font-black text-slate-900">{resource.uploadedBy?.fullName || 'Admin'}</span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase">{format(new Date(resource.createdAt), 'MMM dd')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 h-7 bg-emerald-50 px-2.5 rounded-full">
                        <Download size={10} className="text-emerald-600" />
                        <span className="text-[10px] font-black text-emerald-700">{resource.downloadCount || 0}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="compact-table-container">
              <table className="compact-table">
                <thead>
                  <tr>
                    <th>Asset Name</th>
                    <th>Category</th>
                    <th className="text-center">Visibility</th>
                    <th className="text-center">Usage</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {items.map((resource) => (
                    <tr key={resource._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-10 rounded-lg bg-[#044343] flex items-center justify-center text-white shadow-sm shrink-0">
                            <FileText size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 truncate max-w-[250px]">{resource.title}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{resource.subject || 'General'}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[9px] font-black uppercase tracking-widest">{resource.category}</span>
                      </td>
                      <td className="text-center">
                        <div className={`mx-auto w-fit px-3 py-1 rounded-full flex items-center gap-1.5 ${resource.visibility === 'global' ? 'bg-blue-50 text-blue-600' : 'bg-teal-50 text-teal-600'}`}>
                          <Globe size={10} />
                          <span className="text-[9px] font-black uppercase tracking-widest">{resource.visibility}</span>
                        </div>
                      </td>
                      <td className="text-center">
                         <span className="text-xs font-black text-slate-900">{resource.downloadCount || 0} DLs</span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openViewPage(resource)} className="p-1.5 text-slate-400 hover:text-[#044343] hover:bg-slate-50 rounded-lg transition-colors">
                            <Eye size={18} />
                          </button>
                          <button onClick={() => handleDownload(resource)} className="p-1.5 text-slate-400 hover:text-[#044343] hover:bg-slate-50 rounded-lg transition-colors">
                            <Download size={18} />
                          </button>
                          <button onClick={() => openModal(resource)} className="p-1.5 text-slate-400 hover:text-[#044343] hover:bg-slate-50 rounded-lg transition-colors">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDelete(resource._id)} className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="modal-content modal-lg max-h-[90vh]"
            >
              <div className="modal-header">
                <h2>{editingResource ? 'Edit Resource' : 'Publish New Resource'}</h2>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col overflow-hidden">
                <div className="modal-body">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-1 space-y-6">
                      <div className="space-y-4">
                        <label className="input-label">Cover Preview</label>
                        <div className="relative group aspect-[3/4] bg-slate-50 rounded-[2rem] border border-dashed border-slate-300 overflow-hidden flex flex-col items-center justify-center gap-2 hover:bg-slate-100 transition-all cursor-pointer">
                          <input type="file" onChange={handleCoverChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                          {coverPreview ? (
                            <img src={coverPreview} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <>
                              <ImageIcon size={32} className="text-slate-300" />
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Add Cover</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="input-label">Document Asset</label>
                        <div className="relative p-6 bg-slate-50 rounded-2xl border border-slate-200 border-dashed hover:bg-slate-100 transition-all cursor-pointer flex flex-col items-center gap-3">
                          <input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" className="absolute inset-0 opacity-0 cursor-pointer" />
                          <Upload size={24} className="text-[#044343]" />
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">{filePreview || 'Select PDF/Doc'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-3 space-y-8">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="sm:col-span-2">
                          <label className="input-label">Asset Title *</label>
                          <input {...register('title', { required: true })} className="input-field" placeholder="e.g., Quantum Mechanics Lecture Notes..." />
                        </div>
                        <div>
                          <label className="input-label">Categorization</label>
                          <select {...register('category')} className="input-field">
                            <option value="School Books">School Books</option>
                            <option value="College Books">College Books</option>
                            <option value="Competitive Exams">Competitive Exams</option>
                            <option value="General Knowledge">General Knowledge</option>
                          </select>
                        </div>
                        <div>
                          <label className="input-label">Subject / Topic</label>
                          <input {...register('subject')} className="input-field" placeholder="e.g., Physics, History..." />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="input-label">Access Control</label>
                        <div className="grid grid-cols-2 gap-4">
                          <label className={`flex flex-col p-4 rounded-2xl border-2 transition-all cursor-pointer ${visibilityValue === 'library' ? 'border-[#044343] bg-teal-50' : 'border-slate-100 bg-white'}`}>
                            <input type="radio" {...register('visibility')} value="library" className="sr-only" />
                            <div className="flex items-center gap-3 mb-2">
                              <Lock size={16} className={visibilityValue === 'library' ? 'text-[#044343]' : 'text-slate-400'} />
                              <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">Internal</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium">Restricted to library members only.</p>
                          </label>
                          <label className={`flex flex-col p-4 rounded-2xl border-2 transition-all cursor-pointer ${visibilityValue === 'global' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-white'}`}>
                            <input type="radio" {...register('visibility')} value="global" className="sr-only" />
                            <div className="flex items-center gap-3 mb-2">
                              <Globe size={16} className={visibilityValue === 'global' ? 'text-blue-500' : 'text-slate-400'} />
                              <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">Global</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium">Publicly accessible via your library portal.</p>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-4">
                         <label className="input-label">Resource Description</label>
                         <textarea {...register('description')} rows="4" className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#044343]/10 resize-none font-medium text-sm" placeholder="Detailed summary of the material content..."></textarea>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                         <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${watch('isFeatured') ? 'bg-amber-400 text-white' : 'bg-white text-slate-300'}`}>
                               <Star size={18} fill={watch('isFeatured') ? 'currentColor' : 'none'} />
                            </div>
                            <div>
                               <p className="text-[11px] font-black text-slate-900 uppercase">Feature this Asset</p>
                               <p className="text-[10px] font-bold text-slate-400">Pin to repository recommendations</p>
                            </div>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" {...register('isFeatured')} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#044343]"></div>
                         </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={closeModal} className="btn btn-secondary btn-default">
                    Discard
                  </button>
                  <button
                    type="submit"
                    disabled={isAdding || isUpdating}
                    className="btn btn-primary btn-default min-w-[140px]"
                  >
                    {(isAdding || isUpdating) ? <Loader2 size={18} className="animate-spin" /> : (editingResource ? 'Update Metadata' : 'Publish Asset')}
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
