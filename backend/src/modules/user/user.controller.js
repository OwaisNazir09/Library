import { getModels } from '../../utils/helpers.js';
import ApiFeatures from '../../utils/apiFeatures.js';
import Package from '../package/package.model.js';
import { addDays } from 'date-fns';
import { deleteCloudinaryImage } from '../../middleware/upload.middleware.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const { User } = getModels(req.db);

    const filter = req.tenantId ? { tenantId: req.tenantId } : {};
    const features = new ApiFeatures(User.find(filter).populate('package').populate('assignedTable'), req.query)
      .filter()
      .search(['fullName', 'email'])
      .sort()
      .limitFields()
      .paginate();

    features.query = features.query.populate('package');
    const users = await features.query;

    // Auto-calculate expiration for returned users
    const updatedUsers = users.map(user => {
      if (user.packageEndDate && new Date(user.packageEndDate) < new Date() && user.subscriptionStatus === 'active') {
        user.subscriptionStatus = 'expired';
        user.save(); // Save in background
      }
      return user;
    });

    const total = await User.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      results: updatedUsers.length,
      total,
      data: {
        users: updatedUsers
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const { User } = getModels(req.db);
    const filter = req.tenantId ? { _id: req.params.id, tenantId: req.tenantId } : { _id: req.params.id };
    const user = await User.findOne(filter).populate('package');

    if (!user) {
      const error = new Error('No user found with that ID');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { User } = getModels(req.db);
    const filter = req.tenantId ? { _id: req.params.id, tenantId: req.tenantId } : { _id: req.params.id };

    // If package is being assigned/changed
    if (req.body.package) {
      const pkg = await Package.findById(req.body.package);
      if (pkg) {
        req.body.packageStartDate = new Date();
        req.body.packageEndDate = addDays(new Date(), pkg.duration);
        req.body.subscriptionStatus = 'active';
      }
    }

    if (req.files) {
      const existing = await User.findOne(filter);

      if (req.files.profilePicture) {
        if (existing?.profilePicturePublicId) {
          await deleteCloudinaryImage(existing.profilePicturePublicId);
        }
        req.body.profilePicture = req.files.profilePicture[0].path;
        req.body.profilePicturePublicId = req.files.profilePicture[0].filename;
      }

      if (req.files.idPhoto) {
        if (existing?.idPhotoPublicId) {
          await deleteCloudinaryImage(existing.idPhotoPublicId);
        }
        req.body.idPhoto = req.files.idPhoto[0].path;
        req.body.idPhotoPublicId = req.files.idPhoto[0].filename;
      }
    }

    const user = await User.findOneAndUpdate(filter, req.body, {
      new: true,
      runValidators: true
    }).populate('package');

    if (!user) {
      const error = new Error('No user found with that ID');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { User } = getModels(req.db);
    const filter = req.tenantId ? { _id: req.params.id, tenantId: req.tenantId } : { _id: req.params.id };
    const user = await User.findOneAndDelete(filter);

    if (!user) {
      const error = new Error('No user found with that ID');
      error.statusCode = 404;
      throw error;
    }

    // Delete assets from Cloudinary
    if (user.profilePicturePublicId) {
      await deleteCloudinaryImage(user.profilePicturePublicId);
    }
    if (user.idPhotoPublicId) {
      await deleteCloudinaryImage(user.idPhotoPublicId);
    }

    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { User, Ledger, LedgerEntry } = getModels(req.db);

    // If package is being assigned
    let pkg;
    if (req.body.package) {
      pkg = await Package.findById(req.body.package);
      if (pkg) {
        req.body.packageStartDate = new Date();
        req.body.packageEndDate = addDays(new Date(), pkg.duration);
        req.body.subscriptionStatus = 'active';
      }
    }

    // Handle image uploads
    if (req.files) {
      if (req.files.profilePicture) {
        req.body.profilePicture = req.files.profilePicture[0].path;
        req.body.profilePicturePublicId = req.files.profilePicture[0].filename;
      }
      if (req.files.idPhoto) {
        req.body.idPhoto = req.files.idPhoto[0].path;
        req.body.idPhotoPublicId = req.files.idPhoto[0].filename;
      }
    }

    const newUser = await User.create({
      ...req.body,
      tenantId: req.tenantId,
      password: req.body.password || 'password123'
    });

    // --- Create Ledger for New User ---
    const ledgerId = `LED-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Calculate initial fees based on pkg or explicit fee passing
    const monthlyFee = Number(req.body.monthlyFee) || (pkg ? Number(pkg.price) : 0);
    const admissionFee = Number(req.body.admissionFee) || 0;
    const initialBalance = monthlyFee + admissionFee;

    const ledger = await Ledger.create({
      tenantId: req.tenantId,
      studentId: newUser._id,
      ledgerId,
      totalFee: initialBalance,
      totalPaid: 0,
      balance: initialBalance,
      status: initialBalance > 0 ? 'due' : 'clear'
    });

    if (admissionFee > 0) {
      await LedgerEntry.create({
        tenantId: req.tenantId,
        ledger: ledger._id,
        studentId: newUser._id,
        description: 'Admission Fee',
        type: 'debit',
        amount: admissionFee,
        runningBalance: admissionFee,
        category: 'admission_fee'
      });
    }

    if (monthlyFee > 0) {
      await LedgerEntry.create({
        tenantId: req.tenantId,
        ledger: ledger._id,
        studentId: newUser._id,
        description: 'Monthly/Package Fee',
        type: 'debit',
        amount: monthlyFee,
        runningBalance: initialBalance, // since it happens after admission fee
        category: 'monthly_fee'
      });
    }
    // ------------------------------------

    res.status(201).json({
      status: 'success',
      data: { user: newUser, ledger }
    });

  } catch (err) {
    next(err);
  }
};

export const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
