import { useGetBooksQuery, useAddBookMutation, useUpdateBookMutation, useDeleteBookMutation } from '../../store/api/booksApi';
import { Search, Plus, MoreHorizontal, BookOpen, ChevronRight, X, ArrowRight, Upload, ImagePlus, Loader2 } from 'lucide-react';
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
  const [selectedBook, setSelectedBook] = React.useState(null);
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
    } catch (err) {}
  };

  const openEditModal = (book) => {
    setSelectedBook(book);
    setCoverPreview(book.coverImage);
    reset({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      publisher: book.publisher,
      category: book.category,
      language: book.language,
      edition: book.edition,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      bookCondition: book.bookCondition,
      purchaseDate: book.purchaseDate ? new Date(book.purchaseDate).toISOString().split('T')[0] : '',
      price: book.price,
      shelfNumber: book.shelfNumber,
      rackNumber: book.rackNumber,
      floor: book.floor,
      librarySection: book.librarySection,
      description: book.description
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
      } catch (err) {}
    }
  };

  const renderContent = () => {
    if (loading && items.length === 0) return <LoadingSkeleton type="table" rows={10} />;
    if (error) return <ErrorState message="Error loading books" onRetry={refetch} />;
    if (!items.length) return <EmptyState title="No books found" icon={BookOpen} onAction={() => setIsModalOpen(true)} actionLabel="Add Book" />;

    return (
      <div className="table-container">
        <table className="table-main">
          <thead>
            <tr>
              <th className="px-5">Title & Author</th>
              <th>Category</th>
              <th>ISBN</th>
              <th>Status</th>
              <th className="text-right px-5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((book) => (
              <tr key={book._id}>
                <td className="px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-9 bg-slate-50 rounded border border-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {book.coverImage ? (
                        <img src={book.coverImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen size={14} className="text-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{book.title}</p>
                      <p className="text-[11px] text-slate-400 font-medium truncate">{book.author || 'Unknown'}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="badge badge-neutral lowercase">{book.category || 'General'}</span>
                </td>
                <td className="text-slate-500 font-medium text-[12px]">{book.isbn || '-'}</td>
                <td>
                  <span className={`badge ${book.availableCopies > 0 ? 'badge-success' : 'badge-danger'} lowercase`}>
                    {book.availableCopies} / {book.totalCopies} Available
                  </span>
                </td>
                <td className="px-5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEditModal(book)} className="btn btn-ghost btn-sm w-7 h-7 p-0">
                      <MoreHorizontal size={14} />
                    </button>
                    <button onClick={() => onDelete(book._id)} className="btn btn-ghost btn-sm w-7 h-7 p-0 text-rose-400 hover:text-rose-600">
                      <X size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
            <form onSubmit={handleSubmit(onAddBook)} className="flex flex-col overflow-hidden">
              <div className="modal-b grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1 space-y-3">
                  <label className="label">Cover Image</label>
                  <label className="cursor-pointer block">
                    <input type="file" className="hidden" onChange={handleCoverChange} />
                    {coverPreview ? (
                      <img src={coverPreview} alt="" className="w-full aspect-[3/4] object-cover rounded-lg border border-slate-200" />
                    ) : (
                      <div className="w-full aspect-[3/4] rounded-lg border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center gap-1.5 hover:bg-slate-100 transition-all">
                        <ImagePlus size={20} className="text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Upload</span>
                      </div>
                    )}
                  </label>
                </div>
                <div className="md:col-span-3 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="label">Title *</label>
                      <input {...register('title', { required: true })} className="input" placeholder="Title" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="label">Author</label>
                      <input {...register('author')} className="input" placeholder="Author" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="label">Category</label>
                      <input {...register('category')} className="input" placeholder="Category" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="label">ISBN</label>
                      <input {...register('isbn')} className="input" placeholder="ISBN" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-50">
                    <div className="space-y-1.5">
                      <label className="label">Total Copies *</label>
                      <input {...register('totalCopies', { required: true })} type="number" className="input" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="label">Condition</label>
                      <select {...register('bookCondition')} className="input">
                        <option value="New">New</option>
                        <option value="Good">Good</option>
                        <option value="Old">Old</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="label">Price</label>
                      <input {...register('price')} type="number" className="input" placeholder="0.00" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-f">
                <button type="button" onClick={closeModal} className="btn btn-secondary btn-md px-6">Cancel</button>
                <button type="submit" disabled={isAdding || isUpdating} className="btn btn-primary btn-md px-8 min-w-[120px]">
                  {isAdding || isUpdating ? <Loader2 size={16} className="animate-spin" /> : 'Save Record'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BookList;
