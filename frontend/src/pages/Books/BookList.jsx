import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBooks, addBook, deleteBook } from '../../store/slices/bookSlice';
import { Search, Plus, MoreHorizontal, BookOpen, ChevronRight, X, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';

const BookList = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.books);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { register, handleSubmit, reset } = useForm();

  const loadBooks = React.useCallback(() => {
    dispatch(fetchBooks());
  }, [dispatch]);

  React.useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const onAddBook = async (data) => {
    const result = await dispatch(addBook(data));
    if (addBook.fulfilled.match(result)) {
      toast.success('Book successfully registered');
      setIsModalOpen(false);
      reset();
    }
  };

  const onDelete = async (id) => {
    if (window.confirm('Archive this book from the library?')) {
      const result = await dispatch(deleteBook(id));
      if (deleteBook.fulfilled.match(result)) {
        toast.success('Book removed from inventory');
      }
    }
  };

  const renderContent = () => {
    if (loading && items.length === 0) {
      return <LoadingSkeleton type="card" rows={8} />;
    }

    if (error) {
      return <ErrorState message={error} onRetry={loadBooks} />;
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
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    book.status === 'available' ? 'bg-emerald-500 text-white' : 'bg-rose-50 text-white'
                  }`}>
                    {book.status}
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
                 <span className="text-[10px] font-black text-[#044343] bg-teal-50 px-2 py-0.5 rounded uppercase tracking-widest">{book.genre || 'General'}</span>
                 <button className="text-slate-300 hover:text-slate-600"><MoreHorizontal size={20} /></button>
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
              placeholder="Search by title, author..." 
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

      {/* Add Book Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-black text-slate-900 mb-8">Add New Book</h2>
            <form onSubmit={handleSubmit(onAddBook)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Book Title</label>
                  <input {...register('title')} required className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-6 outline-none focus:ring-2 focus:ring-[#044343]/5" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Author</label>
                  <input {...register('author')} required className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-6 outline-none focus:ring-2 focus:ring-[#044343]/5" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ISBN</label>
                  <input {...register('isbn')} required className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-6 outline-none focus:ring-2 focus:ring-[#044343]/5" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Copies</label>
                  <input {...register('totalCopies')} type="number" required className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-6 outline-none focus:ring-2 focus:ring-[#044343]/5" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Genre</label>
                  <input {...register('genre')} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-6 outline-none focus:ring-2 focus:ring-[#044343]/5" />
                </div>
              </div>
              <button type="submit" className="w-full bg-[#044343] text-white font-black py-4 rounded-2xl mt-4 shadow-xl shadow-teal-900/10">
                Register Book
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BookList;
