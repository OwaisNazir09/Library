import Package from './package.model.js';

export const getAllPackages = async (req, res, next) => {
  try {
    const packages = await Package.find({ tenantId: req.tenantId });

    res.status(200).json({
      status: 'success',
      results: packages.length,
      data: {
        packages
      }
    });
  } catch (err) {
    next(err);
  }
};

export const createPackage = async (req, res, next) => {
  try {
    req.body.tenantId = req.tenantId;

    const newPackage = await Package.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        package: newPackage
      }
    });
  } catch (err) {
    next(err);
  }
};

export const updatePackage = async (req, res, next) => {
  try {
    const updatedPackage = await Package.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedPackage) {
      const error = new Error('No package found with that ID');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      status: 'success',
      data: {
        package: updatedPackage
      }
    });
  } catch (err) {
    next(err);
  }
};

export const deletePackage = async (req, res, next) => {
  try {
    const deletedPackage = await Package.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.tenantId
    });

    if (!deletedPackage) {
      const error = new Error('No package found with that ID');
      error.statusCode = 404;
      throw error;
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    next(err);
  }
};