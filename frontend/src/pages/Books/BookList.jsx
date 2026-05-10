import { useGetBooksQuery, useAddBookMutation, useUpdateBookMutation, useDeleteBookMutation } from '../../store/api/booksApi';
import { Search, Plus, MoreHorizontal, BookOpen, ChevronRight, X, ArrowRight, Upload, ImagePlus, Loader2, Eye, MapPin, Hash, Info, Layers } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import React from 'react';
import { useSubscription } from '../../hooks/useSubscription';

const BookList = () => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchTerm, setSearchTerm] = React.useState('');
  const limit = 10;

  const { data: booksData, isLoading: loading, error, refetch } = useGetBooksQuery({
    page: currentPage,
    limit,
    search: searchTerm
  });

  const [addBook, { isLoading: isAdding }] = useAddBookMutation();
  const [updateBook, { isLoading: isUpdating }] = useUpdateBookMutation();
  const [deleteBook] = useDeleteBookMutation();

  const items = booksData?.data?.books || [];
  const total = booksData?.total || booksData?.results || 0;

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  const [selectedBook, setSelectedBook] = React.useState(null);
  const [viewingBook, setViewingBook] = React.useState(null);
  const { register, handleSubmit, reset } = useForm();
  const [coverPreview, setCoverPreview] = React.useState(null);
  const [coverFile, setCoverFile] = React.useState(null);

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const onAddBook = async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        formData.append(key, val);
      }
    });
    if (coverFile) formData.append('coverImage', coverFile);

    try {
      if (selectedBook) {
        await updateBook({ id: selectedBook._id, data: formData }).unwrap();
        toast.success('Book updated');
      } else {
        await addBook(formData).unwrap();
        toast.success('Book successfully registered');
      }
      closeModal();
    } catch (err) { }
  };

  const openViewModal = (book) => {
    setViewingBook(book);
    setIsViewModalOpen(true);
  };

  const openEditModal = (book) => {
    if (!book) return;
    setSelectedBook(book);
    setCoverPreview(book.coverImage);
    
    // Safety check for purchaseDate to prevent toISOString() crashes
    let formattedDate = '';
    if (book.purchaseDate) {
      const d = new Date(book.purchaseDate);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toISOString().split('T')[0];
      }
    }

    reset({
      title: book.title || '',
      author: book.author || '',
      isbn: book.isbn || '',
      publisher: book.publisher || '',
      category: book.category || '',
      language: book.language || '',
      edition: book.edition || '',
      totalCopies: book.totalCopies || 0,
      availableCopies: book.availableCopies || 0,
      bookCondition: book.bookCondition || 'Good',
      purchaseDate: formattedDate,
      price: book.price || 0,
      shelfNumber: book.shelfNumber || '',
      rackNumber: book.rackNumber || '',
      floor: book.floor || '',
      librarySection: book.librarySection || '',
      description: book.description || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset();
    setCoverPreview(null);
    setCoverFile(null);
    setSelectedBook(null);
  };

  const onDelete = async (id) => {
    if (window.confirm('Archive this book from the library?')) {
      try {
        await deleteBook(id).unwrap();
        toast.success('Book removed');
      } catch (err) { }
    }
  };

  const renderContent = () => {
    if (loading && items.length === 0) {
      return (
        <div className="table-container">
          <table className="table-main">
            <thead>
              <tr>
                <th className="px-5">Title & Author</th>
                <th>Category</th>
                <th className="px-5 text-center">Total</th>
                <th className="px-5 text-center">Available</th>
                <th className="text-right px-5">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="6" className="p-0">
                  <LoadingSkeleton type="table" rows={10} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }
    if (error) return <ErrorState message="Error loading books" onRetry={refetch} />;
    if (!items.length) return <EmptyState title="No books found" icon={BookOpen} onAction={() => setIsModalOpen(true)} actionLabel="Add Book" />;

    return (
      <div className="space-y-4">
        {/* Desktop View */}
        <div className="hidden md:block table-container">
          <table className="table-main">
            <thead>
              <tr>
                <th className="px-5">Title & Author</th>
                <th>Category</th>
                <th>ISBN</th>
                <th className="px-5 text-center">Total</th>
                <th className="px-5 text-center">Available</th>
                <th className="text-right px-5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.filter(Boolean).map((book) => (
                <tr key={book._id}>
                  <td className="px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-10 bg-slate-50 rounded border border-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                        {book.coverImage ? (
                          <img src={book.coverImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen size={14} className="text-slate-300" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{book.title}</p>
                        <p className="text-[11px] text-slate-400 font-bold truncate tracking-tight">{book.author || 'Unknown'}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-neutral lowercase font-bold">{book.category || 'General'}</span>
                  </td>
                  <td className="text-slate-500 font-mono text-[11px]">{book.isbn || '-'}</td>
                  <td className="text-center font-black text-slate-700">{book.totalCopies}</td>
                  <td className="text-center">
                    <span className={`font-black ${book.availableCopies > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {book.availableCopies}
                    </span>
                  </td>
                  <td className="px-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openViewModal(book)} className="btn btn-ghost btn-sm w-8 h-8 p-0 text-slate-400 hover:text-teal-600" title="View Details">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => openEditModal(book)} className="btn btn-ghost btn-sm w-8 h-8 p-0" title="Edit">
                        <MoreHorizontal size={14} />
                      </button>
                      <button onClick={() => onDelete(book._id)} className="btn btn-ghost btn-sm w-8 h-8 p-0 text-rose-400 hover:text-rose-600" title="Archive">
                        <X size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-3">
          {items.filter(Boolean).map((book) => (
            <div key={book._id} className="card p-4 space-y-4">
              <div className="flex gap-4">
                <div onClick={() => openViewModal(book)} className="w-16 h-20 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm cursor-pointer">
                  {book.coverImage ? (
                    <img src={book.coverImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen size={20} className="text-slate-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p onClick={() => openViewModal(book)} className="font-bold text-slate-900 leading-tight line-clamp-2 cursor-pointer">{book.title}</p>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => openViewModal(book)} className="p-1 text-teal-600"><Eye size={16} /></button>
                      <button onClick={() => openEditModal(book)} className="p-1 text-slate-400 hover:text-slate-900"><MoreHorizontal size={16} /></button>
                    </div>
                  </div>
                  <p className="text-[12px] text-slate-500 font-medium mt-1 truncate">{book.author || 'Unknown'}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="badge badge-neutral lowercase text-[9px] font-bold">{book.category || 'General'}</span>
                    <span className="text-[10px] font-mono text-slate-400">{book.isbn || 'No ISBN'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 py-3 border-y border-slate-50">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
                  <p className="text-[14px] font-black text-slate-700">{book.totalCopies}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Available</p>
                  <p className={`text-[14px] font-black ${book.availableCopies > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {book.availableCopies}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Shelf</p>
                  <p className="text-[14px] font-bold text-slate-900">{book.shelfNumber || '-'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${book.availableCopies > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                  {book.availableCopies > 0 ? 'In Library' : 'All Issued'}
                </span>
                <button onClick={() => onDelete(book._id)} className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Archive Book</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const { isExpired } = useSubscription();

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Books Inventory</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage and track your physical book collection</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-56 bg-white border border-slate-200 rounded-lg h-[34px] pl-8 pr-3 text-[13px] outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
            />
          </div>
          <button
            className={`btn btn-primary btn-md ${isExpired ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
            onClick={() => !isExpired && setIsModalOpen(true)}
            title={isExpired ? 'Subscription Expired' : ''}
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Book</span>
          </button>
        </div>
      </div>
 
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Titles', value: total, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Copies', value: booksData?.stats?.totalPhysical || 0, icon: Plus, color: 'text-teal-600', bg: 'bg-teal-50' },
          { label: 'Available Now', value: booksData?.stats?.totalAvailable || 0, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'On Loan', value: (booksData?.stats?.totalPhysical || 0) - (booksData?.stats?.totalAvailable || 0), icon: ArrowRight, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-bold text-slate-900 leading-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {renderContent()}

      <div className="flex items-center justify-between no-print pt-2">
        <p className="text-xs text-slate-500 font-medium">Showing {items.length} of {total} books</p>
        <Pagination
          total={total}
          limit={limit}
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-wrapper">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="modal-panel w-full max-w-4xl">
            <div className="modal-h bg-slate-50/50">
              <h2 className="text-sm font-bold">{selectedBook ? 'Edit Book Record' : 'Register New Book'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-900"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit(onAddBook)} className="flex flex-col h-full max-h-[90vh] overflow-hidden">
              <div className="modal-b overflow-y-auto p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Left Column: Image Upload */}
                  <div className="md:col-span-1 space-y-3">
                    <label className="label">Cover Image</label>
                    <label className="cursor-pointer group block">
                      <input type="file" className="hidden" onChange={handleCoverChange} />
                      {coverPreview ? (
                        <div className="relative aspect-[3/4] w-full max-w-[180px] mx-auto md:max-w-none">
                          <img src={coverPreview} alt="" className="w-full h-full object-cover rounded-xl border border-slate-200 shadow-md transition-all group-hover:opacity-90" />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                            <Upload className="text-white" size={20} />
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-[3/4] w-full max-w-[180px] mx-auto md:max-w-none rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2 hover:bg-slate-100 hover:border-slate-300 transition-all">
                          <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-teal-500 transition-colors">
                            <ImagePlus size={20} />
                          </div>
                          <div className="text-center">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Upload Cover</span>
                            <span className="text-[9px] text-slate-400">JPG, PNG (Max 5MB)</span>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Right Column: Form Fields */}
                  <div className="md:col-span-3 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="label">Title *</label>
                        <input {...register('title', { required: true })} className="input" placeholder="Enter book title" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="label">Author</label>
                        <input {...register('author')} className="input" placeholder="Author name" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="label">Category</label>
                        <input {...register('category')} className="input" placeholder="e.g. Fiction, Science" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="label">ISBN</label>
                        <input {...register('isbn')} className="input" placeholder="978-..." />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="label">Total Copies *</label>
                          <input {...register('totalCopies', { required: true })} type="number" className="input" min="1" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="label">Condition</label>
                          <select {...register('bookCondition')} className="input">
                            <option value="New">New</option>
                            <option value="Good">Good</option>
                            <option value="Old">Old</option>
                          </select>
                        </div>
                        <div className="space-y-1.5 col-span-2 sm:col-span-1">
                          <label className="label">Price</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                            <input {...register('price')} type="number" className="input pl-7" placeholder="0.00" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                          <label className="label">Shelf</label>
                          <input {...register('shelfNumber')} className="input placeholder:text-slate-300" placeholder="e.g. A1" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="label">Rack</label>
                          <input {...register('rackNumber')} className="input placeholder:text-slate-300" placeholder="e.g. 05" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="label">Floor</label>
                          <input {...register('floor')} className="input placeholder:text-slate-300" placeholder="e.g. 2nd" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="label">Section</label>
                          <input {...register('librarySection')} className="input placeholder:text-slate-300" placeholder="e.g. Kids" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-4 border-t border-slate-100">
                      <label className="label">Description / Notes</label>
                      <textarea {...register('description')} className="input h-20 py-2 resize-none" placeholder="Add some details about the book..."></textarea>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-f bg-slate-50 p-4 sm:p-5">
                <button type="button" onClick={closeModal} className="btn btn-secondary btn-md px-6">Cancel</button>
                <button type="submit" disabled={isAdding || isUpdating} className="btn btn-primary btn-md px-10 shadow-lg shadow-teal-900/20">
                  {isAdding || isUpdating ? <Loader2 size={16} className="animate-spin" /> : 'Save Record'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      {/* View Details Modal */}
      {isViewModalOpen && viewingBook && (
        <div className="modal-wrapper">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="modal-panel w-full max-w-2xl">
            <div className="modal-h">
              <h2 className="text-sm font-bold">Book Specifications</h2>
              <button onClick={() => setIsViewModalOpen(false)} className="text-slate-400 hover:text-slate-900"><X size={18} /></button>
            </div>
            <div className="modal-b overflow-y-auto max-h-[80vh] p-0">
              {/* Hero Banner */}
              <div className="bg-slate-50 p-6 flex flex-col sm:flex-row gap-6 border-b border-slate-100">
                <div className="w-32 sm:w-40 aspect-[3/4] rounded-xl shadow-xl shadow-slate-200 overflow-hidden border border-white shrink-0 mx-auto sm:mx-0">
                  {viewingBook.coverImage ? (
                    <img src={viewingBook.coverImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                      <BookOpen size={40} />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <span className="badge badge-success mb-2">{viewingBook.category || 'General'}</span>
                  <h3 className="text-xl font-black text-slate-900 leading-tight">{viewingBook.title}</h3>
                  <p className="text-slate-500 font-bold mt-1 uppercase tracking-wider text-xs">By {viewingBook.author || 'Unknown Author'}</p>
                  
                  <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Availability</span>
                      <span className={`text-[15px] font-black ${viewingBook.availableCopies > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {viewingBook.availableCopies} / {viewingBook.totalCopies}
                      </span>
                    </div>
                    <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Condition</span>
                      <span className="text-[15px] font-black text-slate-700">{viewingBook.bookCondition || 'Good'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="p-6 space-y-8">
                {/* Location Info */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-900">
                    <MapPin size={16} className="text-teal-600" />
                    <h4 className="text-xs font-bold uppercase tracking-widest">Library Location</h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Floor', value: viewingBook.floor },
                      { label: 'Section', value: viewingBook.librarySection },
                      { label: 'Shelf', value: viewingBook.shelfNumber },
                      { label: 'Rack', value: viewingBook.rackNumber },
                    ].map((loc, i) => (
                      <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{loc.label}</p>
                        <p className="text-[13px] font-bold text-slate-900 mt-0.5">{loc.value || '-'}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Technical Specs */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-900">
                    <Hash size={16} className="text-teal-600" />
                    <h4 className="text-xs font-bold uppercase tracking-widest">Metadata & Specs</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">ISBN-13</span>
                      <span className="text-[12px] font-mono font-bold text-slate-700">{viewingBook.isbn || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Price</span>
                      <span className="text-[12px] font-black text-emerald-600">₹{(Number(viewingBook.price) || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Language</span>
                      <span className="text-[12px] font-bold text-slate-700">{viewingBook.language || 'English'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Edition</span>
                      <span className="text-[12px] font-bold text-slate-700">{viewingBook.edition || '1st'}</span>
                    </div>
                  </div>
                </section>

                {/* Description */}
                {viewingBook.description && (
                  <section className="space-y-3 pb-4">
                    <div className="flex items-center gap-2 text-slate-900">
                      <Info size={16} className="text-teal-600" />
                      <h4 className="text-xs font-bold uppercase tracking-widest">Description</h4>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl text-[13px] text-slate-600 leading-relaxed italic border-l-4 border-teal-500">
                      "{viewingBook.description}"
                    </div>
                  </section>
                )}
              </div>
            </div>
            <div className="modal-f bg-slate-50/50">
              <button onClick={() => setIsViewModalOpen(false)} className="btn btn-secondary btn-md w-full sm:w-auto">Close Details</button>
              <button 
                onClick={() => { setIsViewModalOpen(false); openEditModal(viewingBook); }} 
                className="btn btn-primary btn-md w-full sm:w-auto px-8"
              >
                Edit Record
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BookList;
