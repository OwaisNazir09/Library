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

    // Show approved blogs: from this tenant + global ones
    const query = {
      status: 'approved',
      $or: [
        { tenantId: req.tenantId },
        { visibility: 'global' }
      ]
    };

    const features = new ApiFeatures(BlogModel.find(query), req.query)
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

export const getBlog = async (req, res, next) => {
  try {
    const { Blog: BlogModel } = getModels(req.db);
    const blog = await BlogModel.findById(req.params.id).populate('author', 'fullName email profilePicture');

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

export const createBlog = async (req, res, next) => {
  try {
    const { Blog: BlogModel } = getModels(req.db);

    const blog = await BlogModel.create({
      ...req.body,
      author: req.user._id,
      tenantId: req.tenantId,
      status: 'pending'
    });

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
    const db = req.db;
    let BlogModel;
    try {
      BlogModel = db.model('Blog');
    } catch (e) {
      const { default: blogSchema } = await import('./blog.model.js');
      BlogModel = db.model('Blog', blogSchema);
    }

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
    const db = req.db;
    let BlogModel;
    try {
      BlogModel = db.model('Blog');
    } catch (e) {
      const { default: blogSchema } = await import('./blog.model.js');
      BlogModel = db.model('Blog', blogSchema);
    }

    await BlogModel.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });

    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
};
