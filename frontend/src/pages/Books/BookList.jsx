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
      <div className="compact-table-container">
        <table className="compact-table">
          <thead>
            <tr>
              <th>Book</th>
              <th>Author</th>
              <th>Category</th>
              <th>ISBN</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((book) => (
              <tr key={book.id || book._id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-10 bg-slate-100 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {book.coverImage ? (
                        <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen size={16} className="text-slate-400" />
                      )}
                    </div>
                    <div className="font-medium text-slate-900 line-clamp-1">{book.title}</div>
                  </div>
                </td>
                <td className="text-slate-600 line-clamp-1">{book.author || '-'}</td>
                <td>
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-medium uppercase tracking-wider">{book.category || 'General'}</span>
                </td>
                <td className="text-slate-500 text-[12px]">{book.isbn || '-'}</td>
                <td>
                  <span className={`px-2 py-1 rounded text-[10px] font-medium tracking-wider ${book.availableCopies > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {book.availableCopies} / {book.totalCopies} Available
                  </span>
                </td>
                <td className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEditModal(book)} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors" title="Edit">
                      <MoreHorizontal size={16} />
                    </button>
                    <button onClick={() => onDelete(book.id || book._id)} className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors" title="Delete">
                      <X size={16} />
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

  return (
    <div className="space-y-5 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[12px] font-medium text-slate-500 uppercase tracking-widest mb-1">
            <span>Inventory</span>
            <ChevronRight size={12} />
            <span className="text-[#044343]">Books</span>
          </div>
          <h1>Books</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search books..."
              value={searchTerm}
              onChange={onSearchChange}
              className="input-field pl-9 w-64"
            />
          </div>
          <button className="btn btn-primary btn-default" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            Add Book
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
        <div className="modal-overlay">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="modal-content modal-lg max-h-[90vh]"
          >
            <div className="modal-header">
              <h2>{selectedBook ? 'Edit Book' : 'Add Book'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onAddBook)} className="flex flex-col overflow-hidden">
              <div className="modal-body">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Left Column: Image Upload */}
                  <div className="md:col-span-1 space-y-4">
                    <label className="input-label">Cover Image</label>
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
                          <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden border border-slate-200 transition-transform hover:opacity-90">
                            <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-full aspect-[3/4] rounded-lg border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center gap-2 hover:bg-slate-100 transition-all">
                            <ImagePlus size={24} className="text-slate-400" />
                            <span className="text-[12px] text-slate-500">Upload</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Right Column: Sections */}
                  <div className="md:col-span-3 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="input-label">Title *</label>
                        <input {...register('title', { required: true })} className="input-field" placeholder="Book title" />
                      </div>
                      <div>
                        <label className="input-label">Author</label>
                        <input {...register('author')} className="input-field" placeholder="Author name" />
                      </div>
                      <div>
                        <label className="input-label">Publisher</label>
                        <input {...register('publisher')} className="input-field" placeholder="Publisher" />
                      </div>
                      <div>
                        <label className="input-label">Category</label>
                        <input {...register('category')} className="input-field" placeholder="Category" />
                      </div>
                      <div>
                        <label className="input-label">ISBN</label>
                        <input {...register('isbn')} className="input-field" placeholder="ISBN" />
                      </div>
                      <div>
                        <label className="input-label">Language</label>
                        <input {...register('language')} className="input-field" placeholder="Language" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-5">
                      <div>
                        <label className="input-label">Total Copies *</label>
                        <input {...register('totalCopies', { required: true })} type="number" className="input-field" />
                      </div>
                      <div>
                        <label className="input-label">Available</label>
                        <input {...register('availableCopies')} type="number" disabled className="input-field bg-slate-50 text-slate-500" />
                      </div>
                      <div>
                        <label className="input-label">Condition</label>
                        <select {...register('bookCondition')} className="input-field">
                          <option value="New">New</option>
                          <option value="Good">Good</option>
                          <option value="Old">Old</option>
                        </select>
                      </div>
                      <div>
                        <label className="input-label">Price</label>
                        <input {...register('price')} type="number" className="input-field" placeholder="0.00" />
                      </div>
                      <div>
                        <label className="input-label">Shelf No.</label>
                        <input {...register('shelfNumber')} className="input-field" placeholder="S-01" />
                      </div>
                      <div>
                        <label className="input-label">Rack No.</label>
                        <input {...register('rackNumber')} className="input-field" placeholder="R-01" />
                      </div>
                    </div>
                    
                    <div className="border-t border-slate-100 pt-5">
                      <label className="input-label">Description</label>
                      <textarea
                        {...register('description')}
                        rows="3"
                        className="input-field py-2 h-auto resize-none"
                        placeholder="Brief summary..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn btn-secondary btn-default">
                  Cancel
                </button>
                <button type="submit" disabled={isAdding || isUpdating} className="btn btn-primary btn-default min-w-[100px]">
                  {(isAdding || isUpdating) ? <Loader2 size={16} className="animate-spin" /> : (selectedBook ? 'Save' : 'Add Book')}
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
