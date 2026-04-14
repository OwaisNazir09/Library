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
const BookList = () => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchTerm, setSearchTerm] = React.useState('');
  const limit = 8;

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
    } catch (err) {
      // Error is handled by global handler
    }
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
        toast.success('Book removed from inventory');
      } catch (err) {
        // Handled globally
      }
    }
  };

  const onSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const renderContent = () => {
    if (loading && items.length === 0) {
      return <LoadingSkeleton type="card" rows={8} />;
    }

    if (error) {
      return <ErrorState message={error.data?.message || 'Error loading books'} onRetry={refetch} />;
    }

    if (!Array.isArray(items) || items.length === 0) {
      return (
        <EmptyState
          title="Inventory is Empty"
          message="Start building your library by adding your first book to the collection."
          onAction={() => setIsModalOpen(true)}
          actionLabel="Add My First Book"
          icon={BookOpen}
        />
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {items.map((book) => (
          <div key={book.id || book._id} className="glass-card flex flex-col group overflow-hidden hover:translate-y-[-8px] transition-all duration-500">
            <div className={`h-64 bg-slate-50 p-6 pb-0 flex justify-center items-end relative overflow-hidden`}>
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${book.availableCopies > 0 ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                  }`}>
                  {book.availableCopies > 0 ? 'Available' : 'No Availability'}
                </span>
                <button onClick={() => onDelete(book.id || book._id)} className="bg-white/90 text-rose-500 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={14} />
                </button>
              </div>
              <div className="w-36 h-52 bg-white rounded-lg shadow-2xl relative z-0 transform group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-500 shadow-teal-900/20 flex items-center justify-center">
                {book.coverImage ? (
                  <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <BookOpen size={48} className="text-slate-200" />
                )}
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-black text-[#044343] bg-teal-50 px-2 py-0.5 rounded uppercase tracking-widest">{book.category || 'General'}</span>
                <button
                  onClick={() => openEditModal(book)}
                  className="text-slate-300 hover:text-slate-600"
                >
                  <MoreHorizontal size={20} />
                </button>
              </div>
              <h3 className="text-lg font-black text-slate-900 leading-tight mb-1 line-clamp-1">{book.title}</h3>
              <p className="text-xs text-slate-400 font-bold mb-6 italic">{book.author}</p>

              <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Available</p>
                  <p className="text-sm font-black text-[#044343]">{book.availableCopies} / {book.totalCopies} Copies</p>
                </div>
                <button className="w-10 h-10 rounded-xl bg-slate-50 text-[#044343] flex items-center justify-center hover:bg-[#044343] hover:text-white transition-all">
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
            <span>Inventory</span>
            <ChevronRight size={10} />
            <span className="text-[#044343]">All Books</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Books Library</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by title, author, category..."
              value={searchTerm}
              onChange={onSearchChange}
              className="pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl w-80 shadow-sm focus:ring-2 focus:ring-[#044343]/5 outline-none font-medium text-sm"
            />
          </div>
          <button className="bg-[#044343] text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-teal-900/10 active:scale-95 transition-all" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            Add New Book
          </button>
        </div>
      </div>

      {renderContent()}

      <Pagination
        total={total}
        limit={limit}
        currentPage={currentPage}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* Add/Edit Book Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-hidden">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] p-10 shadow-2xl relative overflow-y-auto custom-scrollbar"
          >
            <button onClick={closeModal} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl transition-colors">
              <X size={24} />
            </button>
            <div className="mb-10">
              <h2 className="text-3xl font-black text-slate-900">{selectedBook ? 'Edit Book Details' : 'Register New Book'}</h2>
              <p className="text-slate-500 font-medium mt-1">Fill in the details below to update your library collection.</p>
            </div>

            <form onSubmit={handleSubmit(onAddBook)} className="space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Image Upload */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Book Identity (Cover Image)</label>
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/jpg,image/jpeg,image/png,image/webp"
                      onChange={handleCoverChange}
                      className="hidden"
                      id="coverImageInput"
                    />
                    <label htmlFor="coverImageInput" className="cursor-pointer block">
                      {coverPreview ? (
                        <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden border-2 border-[#044343]/10 shadow-xl shadow-teal-900/10 transition-transform group-hover:scale-[1.02]">
                          <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs font-black uppercase tracking-widest">Change Image</span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full aspect-[3/4] rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-4 hover:border-[#044343]/30 transition-all group-hover:bg-slate-100/50">
                          <ImagePlus size={48} className="text-slate-300" />
                          <div className="text-center px-4">
                            <p className="text-sm font-black text-slate-400">Upload Cover</p>
                            <p className="text-[10px] text-slate-300 mt-1 uppercase tracking-widest">JPG, PNG, WEBP</p>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                  <div className="md:col-span-2 space-y-1.5 pt-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Book Description</label>
                    <textarea
                      {...register('description')}
                      rows="5"
                      className="w-full bg-slate-50 border border-slate-100 rounded-3xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#044343]/5 focus:bg-white resize-none font-medium text-sm"
                      placeholder="Enter book summary or key details..."
                    ></textarea>
                  </div>
                </div>

                {/* Right Column: Sections */}
                <div className="lg:col-span-2 space-y-10">

                  {/* Section 1: Book Details */}
                  <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-1.5 h-6 bg-[#044343] rounded-full"></span>
                      <h3 className="text-xs font-black text-[#044343] uppercase tracking-widest">Section 1: Book Details</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Book Title *</label>
                        <input {...register('title', { required: true })} className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-6 outline-none focus:ring-2 focus:ring-[#044343]/10" placeholder="e.g. Clean Code" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Author Name</label>
                        <input {...register('author')} className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-6 outline-none focus:ring-2 focus:ring-[#044343]/10" placeholder="Robert C. Martin" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Publisher</label>
                        <input {...register('publisher')} className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-6 outline-none focus:ring-2 focus:ring-[#044343]/10" placeholder="Prentice Hall" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                        <input {...register('category')} className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-6 outline-none focus:ring-2 focus:ring-[#044343]/10" placeholder="Software Engineering" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Language</label>
                        <input {...register('language')} className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-6 outline-none focus:ring-2 focus:ring-[#044343]/10" placeholder="English" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Edition</label>
                        <input {...register('edition')} className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-6 outline-none focus:ring-2 focus:ring-[#044343]/10" placeholder="1st Edition" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ISBN Number</label>
                        <input {...register('isbn')} className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-6 outline-none focus:ring-2 focus:ring-[#044343]/10" placeholder="978-0132350884" />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Inventory Details */}
                  <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-1.5 h-6 bg-[#044343] rounded-full"></span>
                      <h3 className="text-xs font-black text-[#044343] uppercase tracking-widest">Section 2: Inventory Details</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Copies *</label>
                        <input {...register('totalCopies', { required: true })} type="number" className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-6 outline-none focus:ring-2 focus:ring-[#044343]/10" placeholder="20" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-teal-600">Available</label>
                        <input {...register('availableCopies')} type="number" disabled className="w-full bg-teal-50/50 border border-teal-100 rounded-2xl py-3 px-6 outline-none text-teal-700 font-black" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Condition</label>
                        <select {...register('bookCondition')} className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-6 outline-none focus:ring-2 focus:ring-[#044343]/10 font-bold text-sm h-[50px] appearance-none">
                          <option value="New">New</option>
                          <option value="Good">Good</option>
                          <option value="Old">Old</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Purchase Date</label>
                        <input {...register('purchaseDate')} type="date" className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-6 outline-none focus:ring-2 focus:ring-[#044343]/10 font-bold text-xs" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price (₹)</label>
                        <input {...register('price')} type="number" className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-6 outline-none focus:ring-2 focus:ring-[#044343]/10" placeholder="599" />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Shelf / Location Details */}
                  <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-1.5 h-6 bg-[#044343] rounded-full"></span>
                      <h3 className="text-xs font-black text-[#044343] uppercase tracking-widest">Section 3: Shelf / Location Details</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Shelf No.</label>
                        <input {...register('shelfNumber')} className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-6 outline-none focus:ring-2 focus:ring-[#044343]/10 placeholder:text-slate-300" placeholder="S-12" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rack No.</label>
                        <input {...register('rackNumber')} className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-6 outline-none focus:ring-2 focus:ring-[#044343]/10 placeholder:text-slate-300" placeholder="R-04" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Floor</label>
                        <input {...register('floor')} className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-6 outline-none focus:ring-2 focus:ring-[#044343]/10 placeholder:text-slate-300" placeholder="2nd" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Library Section</label>
                        <input {...register('librarySection')} className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-6 outline-none focus:ring-2 focus:ring-[#044343]/10 placeholder:text-slate-300" placeholder="CS-Dept" />
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-white border border-slate-200 text-slate-400 font-black py-4 rounded-3xl hover:bg-slate-50 transition-all uppercase tracking-widest text-sm"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  disabled={isAdding || isUpdating}
                  className="flex-[2] bg-[#044343] text-white font-black py-4 rounded-3xl shadow-xl shadow-teal-900/10 hover:bg-[#033636] transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {(isAdding || isUpdating) ? <Loader2 size={18} className="animate-spin" /> : (selectedBook ? 'Save Book Changes' : 'Initialize Book Entry')}
                  {!(isAdding || isUpdating) && <ArrowRight size={18} />}
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
