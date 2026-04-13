import Fine from './fine.model.js';
import { getModels } from '../../utils/helpers.js';
import ApiFeatures from '../../utils/apiFeatures.js';

export const getFines = async (req, res, next) => {
  try {
    const { Fine } = getModels(req.db);
    const filter = { tenantId: req.tenantId };
    
    const features = new ApiFeatures(Fine.find(filter), req.query)
      .filter()
      .sort()
      .paginate();

    features.query = features.query
      .populate('student', 'fullName email')
      .populate('issue', 'borrowedDate book');

    const fines = await features.query;
    const total = await Fine.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      results: fines.length,
      total,
      data: {
        fines
      }
    });
  } catch (err) {
    next(err);
  }
};

export const createFine = async (req, res, next) => {
  try {
    const newFine = await Fine.create({
      ...req.body,
      tenantId: req.tenantId
    });

    res.status(201).json({
      status: 'success',
      data: newFine
    });
  } catch (err) {
    next(err);
  }
};

export const payFine = async (req, res, next) => {
  try {
    const fine = await Fine.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { status: 'paid' },
      { new: true, runValidators: true }
    );

    if (!fine) {
      const err = new Error('No fine found with that ID');
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({
      status: 'success',
      data: fine
    });
  } catch (err) {
    next(err);
  }
};
