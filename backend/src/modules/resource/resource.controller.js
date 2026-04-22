import { getModels } from '../../utils/helpers.js';
import ApiFeatures from '../../utils/apiFeatures.js';
import { deleteCloudinaryImage } from '../../middleware/upload.middleware.js';
import Tenant from '../tenant/tenant.model.js';

export const getPublicResources = async (req, res, next) => {
  try {
    const { Resource } = getModels(req.db);

    console.log('[Resources] Fetching public resources with query:', req.query);
    const query = { visibility: 'global' };

    const features = new ApiFeatures(Resource.find(query), req.query)
      .filter()
      .search(['title', 'category', 'subject', 'tags'])
      .sort('-isFeatured -createdAt')
      .limitFields()
      .paginate();

    const resources = await features.query.populate('uploadedBy', 'fullName email');
    const total = await Resource.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: resources.length,
      total,
      data: { resources }
    });
  } catch (err) {
    next(err);
  }
};


export const getAllResources = async (req, res, next) => {
  try {
    const { Resource } = getModels(req.db);

    const query = { tenantId: req.tenantId };

    const features = new ApiFeatures(Resource.find(query), req.query)
      .filter()
      .search(['title', 'category', 'subject', 'tags'])
      .sort('-isFeatured -createdAt')
      .limitFields()
      .paginate();

    const resources = await features.query.populate('uploadedBy', 'fullName email');
    const total = await Resource.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: resources.length,
      total,
      data: { resources }
    });
  } catch (err) {
    next(err);
  }
};

export const createResource = async (req, res, next) => {
  try {
    const { Resource } = getModels(req.db);

    const resourceData = {
      ...req.body,
      tenantId: req.tenantId,
      uploadedBy: req.user._id
    };

    if (req.files) {
      if (req.files.file && req.files.file[0]) {
        resourceData.fileUrl = req.files.file[0].path;
        resourceData.filePublicId = req.files.file[0].filename;
        resourceData.fileSize = req.files.file[0].size;
      }
      if (req.files.coverImage && req.files.coverImage[0]) {
        resourceData.coverImage = req.files.coverImage[0].path;
        resourceData.coverImagePublicId = req.files.coverImage[0].filename;
      }
    }

    if (!resourceData.fileUrl) {
      const error = new Error('PDF File is required');
      error.statusCode = 400;
      throw error;
    }

    const resource = await Resource.create(resourceData);

    res.status(201).json({
      status: 'success',
      data: { resource }
    });
  } catch (err) {
    next(err);
  }
};

export const getResource = async (req, res, next) => {
  try {
    const { Resource } = getModels(req.db);
    const resource = await Resource.findById(req.params.id).populate('uploadedBy', 'fullName email');

    if (!resource) {
      const error = new Error('Resource not found');
      error.statusCode = 404;
      throw error;
    }

    // Check accessibility
    if (resource.visibility === 'library' && resource.tenantId.toString() !== req.tenantId.toString()) {
      const error = new Error('This resource is private to another library');
      error.statusCode = 403;
      throw error;
    }

    res.status(200).json({
      status: 'success',
      data: { resource }
    });
  } catch (err) {
    next(err);
  }
};

export const updateResource = async (req, res, next) => {
  try {
    const { Resource } = getModels(req.db);
    let resource = await Resource.findOne({ _id: req.params.id, tenantId: req.tenantId });

    if (!resource) {
      const error = new Error('Resource not found or unauthorized');
      error.statusCode = 404;
      throw error;
    }

    if (req.files) {
      if (req.files.file && req.files.file[0]) {
        if (resource.filePublicId) await deleteCloudinaryImage(resource.filePublicId);
        req.body.fileUrl = req.files.file[0].path;
        req.body.filePublicId = req.files.file[0].filename;
        req.body.fileSize = req.files.file[0].size;
      }
      if (req.files.coverImage && req.files.coverImage[0]) {
        if (resource.coverImagePublicId) await deleteCloudinaryImage(resource.coverImagePublicId);
        req.body.coverImage = req.files.coverImage[0].path;
        req.body.coverImagePublicId = req.files.coverImage[0].filename;
      }
    }

    resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: { resource }
    });
  } catch (err) {
    next(err);
  }
};

export const deleteResource = async (req, res, next) => {
  try {
    const { Resource } = getModels(req.db);
    const resource = await Resource.findOne({ _id: req.params.id, tenantId: req.tenantId });

    if (!resource) {
      const error = new Error('Resource not found or unauthorized');
      error.statusCode = 404;
      throw error;
    }

    if (resource.filePublicId) await deleteCloudinaryImage(resource.filePublicId);
    if (resource.coverImagePublicId) await deleteCloudinaryImage(resource.coverImagePublicId);

    await Resource.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    next(err);
  }
};

export const trackDownload = async (req, res, next) => {
  try {
    const { Resource } = getModels(req.db);
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );

    res.status(200).json({
      status: 'success',
      data: { downloadCount: resource.downloadCount }
    });
  } catch (err) {
    next(err);
  }
};
export const getLibraryResources = async (req, res, next) => {
  try {
    const { Resource } = getModels(req.db);
    const { libraryId } = req.params;

    const query = {
      tenantId: libraryId,
      visibility: { $in: ['global', 'library'] }
    };

    const features = new ApiFeatures(Resource.find(query), req.query)
      .filter()
      .search(['title', 'category', 'subject', 'tags'])
      .sort()
      .limitFields()
      .paginate();

    const resources = await features.query.populate('uploadedBy', 'fullName email');
    const total = await Resource.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: resources.length,
      total,
      data: { resources }
    });
  } catch (err) {
    next(err);
  }
};
