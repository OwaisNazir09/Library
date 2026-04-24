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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="text-indigo-600" />
            Blog Management
          </h1>
          <p className="text-gray-500 mt-1">Manage and moderate community blog posts</p>
        </div>
        <div className="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
          <span className="text-indigo-700 font-semibold">{blogs.length}</span>
          <span className="text-indigo-600 ml-1">
            {activeStatus.charAt(0).toUpperCase() + activeStatus.slice(1)} Blogs
          </span>
        </div>
      </div>

      <div className="flex gap-4 mb-8 bg-gray-100 p-1 rounded-xl w-fit">
        {['pending', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className={`
              px-6 py-2 rounded-lg font-medium transition-all
              ${activeStatus === status 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'}
            `}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {blogs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-indigo-500 w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800">No {activeStatus} blogs</h3>
          <p className="text-gray-500 mt-2">There are no blog posts with the status "{activeStatus}".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {blogs.map((blog) => (
            <div key={blog._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:border-indigo-200 transition-all">
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {blog.coverImage && (
                    <div className="w-full md:w-64 h-40 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h2 className="text-2xl font-bold text-gray-900 leading-tight">{blog.title}</h2>
                      <div className="flex gap-2">
                        {activeStatus !== 'approved' && (
                          <button 
                            onClick={() => handleApprove(blog._id)}
                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle size={20} />
                          </button>
                        )}
                        {activeStatus !== 'rejected' && (
                          <button 
                            onClick={() => handleReject(blog._id)}
                            className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors"
                            title="Reject"
                          >
                            <XCircle size={20} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(blog._id)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="Delete Permanently"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User size={16} />
                        <span>{blog.author?.fullName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        <span>{formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Tag size={16} />
                        <div className="flex gap-1">
                          {blog.tags?.map((tag, idx) => (
                            <span key={idx} className="bg-gray-100 px-2 py-0.5 rounded text-xs">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 prose prose-indigo max-w-none text-gray-700 line-clamp-3">
                      {blog.content}
                    </div>

                    <button 
                      onClick={() => setSelectedBlog(selectedBlog === blog._id ? null : blog._id)}
                      className="mt-4 text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1"
                    >
                      {selectedBlog === blog._id ? 'Collapse content' : 'Read full content'}
                    </button>

                    {selectedBlog === blog._id && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100 text-gray-800 whitespace-pre-wrap">
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
