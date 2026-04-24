import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  FileText, Plus, Search, Calendar, Star, Edit, Trash2, Globe, Clock, Settings, BookOpen
} from 'lucide-react';
import api from '../../services/api';

const QuotesAdmin = () => {
  const { user } = useSelector(state => state.auth);
  const isSuperAdmin = user?.role === 'super_admin';

  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);

  const [formData, setFormData] = useState({
    quote: '',
    author: '',
    category: 'Motivation',
    active: true,
    featured: false,
    dateScheduled: new Date().toISOString().split('T')[0],
  });

  const categories = [
    "Motivation", "Learning", "Books", "Wisdom",
    "Islamic", "Productivity", "Student Inspiration", "Other"
  ];

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/quotes');
      setQuotes(response.data.data.quotes);
    } catch (error) {
      console.error('Failed to fetch quotes', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingQuote) {
        await api.patch(`/quotes/${editingQuote._id}`, formData);
      } else {
        await api.post('/quotes', formData);
      }
      setIsModalOpen(false);
      setEditingQuote(null);
      resetForm();
      fetchQuotes();
    } catch (error) {
      console.error('Failed to save quote', error);
      alert('Error saving quote');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this quote?')) {
      try {
        await api.delete(`/quotes/${id}`);
        fetchQuotes();
      } catch (error) {
        console.error('Failed to delete quote', error);
        alert('Error deleting quote');
      }
    }
  };

  const openEditModal = (quote) => {
    setEditingQuote(quote);
    setFormData({
      quote: quote.quote,
      author: quote.author,
      category: quote.category,
      active: quote.active,
      featured: quote.featured,
      dateScheduled: new Date(quote.dateScheduled).toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      quote: '',
      author: '',
      category: 'Motivation',
      active: true,
      featured: false,
      dateScheduled: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
            <FileText className="text-[#044343]" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Daily Quotes</h1>
            <p className="text-sm text-slate-500">Manage inspiring quotes for the dashboard widget.</p>
          </div>
        </div>
        <button
          onClick={() => { resetForm(); setEditingQuote(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#044343] text-white rounded-xl hover:bg-teal-900 transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span className="font-semibold">Add Quote</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Quote Content</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Author</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Visibility</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Schedule</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-500">Loading quotes...</td>
                </tr>
              ) : quotes.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-slate-900">No Quotes Found</h3>
                    <p className="text-slate-500 mt-2">Start adding inspiring quotes to display on your users' dashboard.</p>
                  </td>
                </tr>
              ) : (
                quotes.map(quote => (
                  <tr key={quote._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 min-w-[300px]">
                      <div className="flex items-start gap-3">
                        <div className="text-slate-300 font-serif text-2xl leading-none mt-1">"</div>
                        <p className="text-sm font-serif text-slate-800 italic line-clamp-2">{quote.quote}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">
                      {quote.author}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold">
                        {quote.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {quote.isGlobal ? (
                        <span className="flex items-center gap-1.5 w-fit px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold">
                          <Globe size={12} /> Global
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 w-fit px-2.5 py-1 bg-purple-50 text-purple-600 rounded-lg text-xs font-semibold">
                          <BookOpen size={12} /> Library
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1.5">
                        {quote.active ? (
                          <span className="w-fit px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-semibold">Active</span>
                        ) : (
                          <span className="w-fit px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold">Inactive</span>
                        )}
                        {quote.featured && (
                          <span className="flex items-center gap-1 w-fit px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-semibold">
                            <Star size={10} fill="currentColor" /> Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(quote.dateScheduled).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {(!quote.isGlobal || isSuperAdmin) ? (
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(quote)} className="p-2 text-slate-400 hover:text-[#044343] hover:bg-teal-50 rounded-lg transition-colors">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(quote._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Read-only</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">{editingQuote ? 'Edit Quote' : 'New Quote'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl">
                <Trash2 size={20} className="opacity-0" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Quote Content *</label>
                <textarea
                  required
                  rows="3"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#044343]/20 focus:border-[#044343]"
                  placeholder="e.g. A reader lives a thousand lives before he dies."
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Author *</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-[#044343]"
                    placeholder="e.g. George R.R. Martin"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-[#044343]"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Schedule Date</label>
                <input
                  type="date"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-[#044343]"
                  value={formData.dateScheduled}
                  onChange={(e) => setFormData({ ...formData, dateScheduled: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-[#044343] focus:ring-[#044343]"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                  <span className="text-sm font-medium text-slate-700">Active</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                  <span className="text-sm font-medium text-slate-700">Pin as Featured</span>
                </label>
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#044343] text-white font-semibold rounded-xl hover:bg-teal-900 shadow-sm"
                >
                  Save Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotesAdmin;
