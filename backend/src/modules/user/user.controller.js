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
      .sort({ createdAt: 1 })
      .limitFields()
      .paginate();

    features.query = features.query.populate('package');
    const users = await features.query;

    const updatedUsers = users.map(user => {
      if (user.packageEndDate && new Date(user.packageEndDate) < new Date() && user.subscriptionStatus === 'active') {
        user.subscriptionStatus = 'expired';
        user.save();
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

const recalcBalance = (account) => {
  account.currentBalance =
    (account.openingBalance || 0) +
    (account.totalCharged || 0) +
    (account.debitNoteTotal || 0) -
    (account.totalPaid || 0) -
    (account.creditNoteTotal || 0);
  account.status =
    account.currentBalance <= 0 ? 'clear' :
      account.currentBalance > 0 ? 'due' : 'clear';
};

export const createUser = async (req, res, next) => {
  try {
    const { User, StudentAccount, Transaction } = getModels(req.db);

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

    // --- Auto Create Student Account (Ledger) ---
    const {
      ensureStudentAccount,
      recordTransaction
    } = await import('../ledger/finance.controller.js');
    const { Account } = getModels(req.db);

    const studentAccount = await ensureStudentAccount(req.db, req.tenantId, newUser._id, newUser.fullName);

    // Helper to get or create income accounts
    const getIncomeAcc = async (name, subType = 'Operating Income') => {
      let acc = await Account.findOne({ tenantId: req.tenantId, name });
      if (!acc) {
        acc = await Account.create({
          tenantId: req.tenantId,
          name,
          type: 'Income',
          subType,
          isSystem: true
        });
      }
      return acc;
    };

    // Helper to get or create liability accounts
    const getLiabilityAcc = async (name, subType = 'Deposit') => {
      let acc = await Account.findOne({ tenantId: req.tenantId, name });
      if (!acc) {
        acc = await Account.create({
          tenantId: req.tenantId,
          name,
          type: 'Liabilities',
          subType,
          isSystem: true
        });
      }
      return acc;
    };

    const regFee = Number(req.body.registrationFee) || 0;
    if (regFee > 0) {
      const regIncomeAcc = await getIncomeAcc('Registration Fees');
      await recordTransaction(req.db, req.tenantId, {
        debitAccountId: studentAccount._id,
        creditAccountId: regIncomeAcc._id,
        amount: regFee,
        type: 'fee_charge',
        description: 'Initial Registration Fee',
        userId: req.user?._id
      });
    }

    const secDeposit = Number(req.body.securityDeposit) || 0;
    if (secDeposit > 0) {
      const secLiabilityAcc = await getLiabilityAcc('Security Deposits');
      await recordTransaction(req.db, req.tenantId, {
        debitAccountId: studentAccount._id,
        creditAccountId: secLiabilityAcc._id,
        amount: secDeposit,
        type: 'fee_charge',
        description: 'Refundable Security Deposit',
        userId: req.user?._id
      });
    }

    // Auto-add Membership Fee from package
    const membershipFee = pkg ? Number(pkg.price) : 0;
    if (membershipFee > 0) {
      const memIncomeAcc = await getIncomeAcc('Membership Income');
      await recordTransaction(req.db, req.tenantId, {
        debitAccountId: studentAccount._id,
        creditAccountId: memIncomeAcc._id,
        amount: membershipFee,
        type: 'fee_charge',
        description: `Membership Fee (${pkg.name})`,
        userId: req.user?._id
      });
    }

    // Auto-add Study Desk Fee if exists
    const deskFee = Number(req.body.studyDeskFee) || 0;
    if (deskFee > 0) {
      const deskIncomeAcc = await getIncomeAcc('Study Desk Income');
      await recordTransaction(req.db, req.tenantId, {
        debitAccountId: studentAccount._id,
        creditAccountId: deskIncomeAcc._id,
        amount: deskFee,
        type: 'fee_charge',
        description: 'Study Desk Fee',
        userId: req.user?._id
      });
    }

    res.status(201).json({
      status: 'success',
      data: { user: newUser, account: studentAccount }
    });

  } catch (err) {
    next(err);
  }
};

export const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
