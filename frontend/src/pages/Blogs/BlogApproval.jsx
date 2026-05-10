import React, { useState } from 'react';
import {
  useGetBlogsQuery,
  useApproveBlogMutation,
  useDeleteBlogMutation
} from '../../store/api/blogApi';
import { toast } from 'react-hot-toast';
import {
  CheckCircle,
  XCircle,
  Trash2,
  Clock,
  User,
  Tag,
  MessageSquare,
  ThumbsUp,
  FileText
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const BlogApproval = () => {
  const [activeStatus, setActiveStatus] = useState('pending');
  const { data, isLoading, refetch } = useGetBlogsQuery({ status: activeStatus });
  const [approveBlog] = useApproveBlogMutation();
  const [deleteBlog] = useDeleteBlogMutation();
  const [selectedBlog, setSelectedBlog] = useState(null);

  const handleApprove = async (id) => {
    try {
      await approveBlog({ id, status: 'approved' }).unwrap();
      toast.success('Blog approved successfully!');
      refetch();
    } catch (err) {
      toast.error('Failed to approve blog');
    }
  };

  const handleReject = async (id) => {
    try {
      await approveBlog({ id, status: 'rejected' }).unwrap();
      toast.success('Blog rejected');
      refetch();
    } catch (err) {
      toast.error('Failed to reject blog');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog permanently?')) {
      try {
        await deleteBlog(id).unwrap();
        toast.success('Blog deleted permanently');
        refetch();
      } catch (err) {
        toast.error('Failed to delete blog');
      }
    }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  const blogs = data?.data?.blogs || [];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Responsive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="text-indigo-600" />
            Blog Hub
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Explore stories or moderate community posts</p>
        </div>
        <div className="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 w-full md:w-auto flex justify-between md:block">
          <span className="text-indigo-700 font-semibold">{blogs.length}</span>
          <span className="text-indigo-600 ml-1">
            {activeStatus.charAt(0).toUpperCase() + activeStatus.slice(1)} Blogs
          </span>
        </div>
      </div>

      {/* Status Filters - Scrollable on mobile */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
        <div className="flex gap-2 md:gap-4 bg-gray-100 p-1 rounded-xl w-max md:w-fit">
          {['pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`
                px-4 md:px-6 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                ${activeStatus === status
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'}
              `}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {blogs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-12 text-center">
          <div className="bg-indigo-50 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-indigo-500 w-6 h-6 md:w-8 md:h-8" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-gray-800">No {activeStatus} blogs</h3>
          <p className="text-sm text-gray-500 mt-2">There are no posts with the status "{activeStatus}".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {blogs.map((blog) => (
            <div key={blog._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:border-indigo-200 transition-all relative">
              <div className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                  {blog.coverImage && (
                    <div className="w-full md:w-64 h-48 md:h-40 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 flex flex-col">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">{blog.title}</h2>
                      <div className="flex gap-2 flex-shrink-0">
                        {activeStatus !== 'approved' && (
                          <button
                            onClick={() => handleApprove(blog._id)}
                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        {activeStatus !== 'rejected' && (
                          <button
                            onClick={() => handleReject(blog._id)}
                            className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors"
                            title="Reject"
                          >
                            <XCircle size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(blog._id)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="Delete Permanently"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-[11px] md:text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        <span className="font-medium">{blog.author?.fullName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Tag size={14} />
                        <div className="flex flex-wrap gap-1">
                          {blog.tags?.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="bg-gray-100 px-2 py-0.5 rounded text-[10px]">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 prose prose-indigo max-w-none text-gray-700 text-sm md:text-base line-clamp-3">
                      {blog.content}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                      <button
                        onClick={() => setSelectedBlog(selectedBlog === blog._id ? null : blog._id)}
                        className="text-indigo-600 text-sm font-bold hover:text-indigo-700 flex items-center gap-1"
                      >
                        {selectedBlog === blog._id ? 'Collapse' : 'Read Full Story'}
                      </button>
                      <div className="flex items-center gap-4 text-gray-400">
                        <div className="flex items-center gap-1"><ThumbsUp size={14} /><span className="text-xs">{blog.likesCount || 0}</span></div>
                        <div className="flex items-center gap-1"><MessageSquare size={14} /><span className="text-xs">{blog.commentsCount || 0}</span></div>
                      </div>
                    </div>

                    {selectedBlog === blog._id && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100 text-gray-800 text-sm md:text-base whitespace-pre-wrap leading-relaxed animate-in fade-in slide-in-from-top-2">
                        {blog.content}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogApproval;
