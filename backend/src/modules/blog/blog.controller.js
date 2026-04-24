import { getModels } from '../../utils/helpers.js';
import ApiFeatures from '../../utils/apiFeatures.js';

// Register blog model helper
const getBlogModel = (db) => {
  if (!db.models['Blog']) {
    const blogSchema = require('./blog.model.js').default;
    return db.model('Blog', blogSchema);
  }
  return db.model('Blog');
};

export const getAllBlogs = async (req, res, next) => {
  try {
    const { Blog: BlogModel } = getModels(req.db);
    console.log('[Blogs] Fetching blogs with query:', req.query);

    // Default query: show approved blogs
    let query = {
      status: 'approved',
      $or: [
        { tenantId: req.tenantId },
        { visibility: 'global' }
      ]
    };

    const staffRoles = ['librarian', 'admin', 'super_admin'];
    
    if (staffRoles.includes(req.user?.role) && req.query.status) {
      query = {
        tenantId: req.tenantId,
        status: req.query.status
      };
    } else if (staffRoles.includes(req.user?.role)) {
      query = { tenantId: req.tenantId };
      if (req.query.status) query.status = req.query.status;
    }

    let sortQuery = req.query.sort;
    if (req.query.ranked === 'true') {
      sortQuery = '-likesCount -commentsCount -createdAt';
    }

    const features = new ApiFeatures(BlogModel.find(query), { ...req.query, sort: sortQuery })
      .filter()
      .search(['title', 'content', 'tags'])
      .sort()
      .limitFields()
      .paginate();

    const blogs = await features.query.populate('author', 'fullName email profilePicture');
    const totalCount = await BlogModel.countDocuments(query);

    console.log(`[Blogs] Found ${blogs.length} approved blogs`);

    res.status(200).json({
      status: 'success',
      results: blogs.length,
      total: totalCount,
      data: { blogs }
    });
  } catch (err) {
    next(err);
  }
};

export const getPendingBlogs = async (req, res, next) => {
  try {
    const { Blog: BlogModel } = getModels(req.db);
    const blogs = await BlogModel.find({ tenantId: req.tenantId, status: 'pending' })
      .populate('author', 'fullName email profilePicture');

    res.status(200).json({
      status: 'success',
      results: blogs.length,
      data: { blogs }
    });
  } catch (err) {
    next(err);
  }
};

export const getBlog = async (req, res, next) => {
  try {
    const { Blog: BlogModel, Like: LikeModel } = getModels(req.db);
    const blog = await BlogModel.findById(req.params.id).populate('author', 'fullName email profilePicture');

    if (!blog) {
      const error = new Error('Blog not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if current user has liked this blog
    let isLiked = false;
    if (req.user) {
      const like = await LikeModel.findOne({ blogId: blog._id, user: req.user._id });
      isLiked = !!like;
    }

    const blogObj = blog.toObject();
    blogObj.isLiked = isLiked;

    res.status(200).json({
      status: 'success',
      data: {
        blog: blogObj
      }
    });
  } catch (err) {
    next(err);
  }
};

export const createBlog = async (req, res, next) => {
  try {
    const { Blog: BlogModel } = getModels(req.db);
    console.log('[Blogs] Create Blog - req.body:', req.body);
    console.log('[Blogs] Create Blog - req.file:', req.file);

    const tenantId = req.tenantId || req.user.tenantId;

    if (!tenantId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Tenant ID is required to create a blog. Please ensure you have joined a library.'
      });
    }

    if (!req.body.title || !req.body.content) {
      console.log('[Blogs] Validation failed - Body keys:', Object.keys(req.body));
      return res.status(400).json({
        status: 'fail',
        message: 'Blog title and content are required fields.'
      });
    }

    const blogData = {
      title: req.body.title,
      content: req.body.content,
      author: req.user._id,
      tenantId: tenantId,
      status: 'pending'
    };

    if (typeof req.body.tags === 'string') {
      blogData.tags = req.body.tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    if (req.file) {
      blogData.coverImage = req.file.path;
    }

    const blog = await BlogModel.create(blogData);

    res.status(201).json({
      status: 'success',
      data: { blog }
    });
  } catch (err) {
    next(err);
  }
};

export const approveBlog = async (req, res, next) => {
  try {
    const { Blog: BlogModel } = getModels(req.db);

    const blog = await BlogModel.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { status: req.body.status },
      { new: true }
    );

    if (!blog) {
      const error = new Error('Blog not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      status: 'success',
      data: { blog }
    });
  } catch (err) {
    next(err);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    const { Blog: BlogModel } = getModels(req.db);

    await BlogModel.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });

    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { Blog: BlogModel, Comment: CommentModel } = getModels(req.db);

    const comment = await CommentModel.create({
      blogId: req.params.id,
      author: req.user._id,
      tenantId: req.tenantId,
      content: req.body.content
    });

    await BlogModel.findByIdAndUpdate(req.params.id, {
      $inc: { commentsCount: 1 }
    });

    res.status(201).json({
      status: 'success',
      data: { comment }
    });
  } catch (err) {
    next(err);
  }
};

export const getComments = async (req, res, next) => {
  try {
    const { Comment: CommentModel } = getModels(req.db);

    const comments = await CommentModel.find({ blogId: req.params.id })
      .populate('author', 'fullName email profilePicture')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: comments.length,
      data: { comments }
    });
  } catch (err) {
    next(err);
  }
};

export const toggleLike = async (req, res, next) => {
  try {
    const { Blog: BlogModel, Like: LikeModel } = getModels(req.db);
    const blogId = req.params.id;
    const userId = req.user._id;

    const existingLike = await LikeModel.findOne({ blogId, user: userId });

    if (existingLike) {
      await LikeModel.findByIdAndDelete(existingLike._id);
      await BlogModel.findByIdAndUpdate(blogId, { $inc: { likesCount: -1 } });
      res.status(200).json({ status: 'success', data: { liked: false } });
    } else {
      await LikeModel.create({ blogId, user: userId, tenantId: req.tenantId });
      await BlogModel.findByIdAndUpdate(blogId, { $inc: { likesCount: 1 } });
      res.status(200).json({ status: 'success', data: { liked: true } });
    }
  } catch (err) {
    next(err);
  }
};
