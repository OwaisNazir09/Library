import { getModels } from '../../utils/helpers.js';
import ApiFeatures from '../../utils/apiFeatures.js';
import Package from '../package/package.model.js';
import { addDays, format } from 'date-fns';
import { deleteCloudinaryImage } from '../../middleware/upload.middleware.js';
import WhatsAppService from '../../services/whatsapp.service.js';
import Tenant from '../tenant/tenant.model.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const { User } = getModels(req.db);

    const filter = req.tenantId ? { tenantId: req.tenantId } : {};
    const totalFilter = { ...filter };
    if (req.query.role) totalFilter.role = req.query.role;
    if (req.query.status) {
      if (typeof req.query.status === 'object') {
        const statusFilter = {};
        Object.entries(req.query.status).forEach(([op, val]) => {
          const mongoOp = ['ne', 'gte', 'gt', 'lte', 'lt'].includes(op) ? `$${op}` : op;
          statusFilter[mongoOp] = val;
        });
        totalFilter.status = statusFilter;
      } else {
        totalFilter.status = req.query.status;
      }
    }

    if (req.query.search) {
      totalFilter.$or = ['fullName', 'email'].map(field => ({
        [field]: { $regex: req.query.search, $options: 'i' }
      }));
    }

    const total = await User.countDocuments(totalFilter);

    const features = new ApiFeatures(User.find(totalFilter).populate('package').populate('assignedTable'), req.query)
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

    if (req.body.registrationFee || req.body.securityDeposit || req.body.studyDeskFee || req.body.package) {
      const { ensureStudentAccount, getSystemAccount, recordTransaction, seedChartOfAccounts } = await import('../ledger/finance.controller.js');
      await seedChartOfAccounts(req.db, req.tenantId);
      const studentAccount = await ensureStudentAccount(req.db, req.tenantId, user._id, user.fullName);

      const regFee = Number(req.body.registrationFee) || 0;
      if (regFee > 0) {
        const acc = await getSystemAccount(req.db, req.tenantId, 'Registration Fees', 'Income', 'Operating Income');
        await recordTransaction(req.db, req.tenantId, { debitAccountId: studentAccount._id, creditAccountId: acc._id, amount: regFee, type: 'fee_charge', description: 'Registration Fee (Manual)', userId: req.user?._id, studentId: user._id });
      }

      const secDeposit = Number(req.body.securityDeposit) || 0;
      if (secDeposit > 0) {
        const acc = await getSystemAccount(req.db, req.tenantId, 'Security Deposits', 'Liabilities', 'Deposit');
        await recordTransaction(req.db, req.tenantId, { debitAccountId: studentAccount._id, creditAccountId: acc._id, amount: secDeposit, type: 'fee_charge', description: 'Refundable Security Deposit (Manual)', userId: req.user?._id, studentId: user._id });
      }

      const deskFee = Number(req.body.studyDeskFee) || 0;
      if (deskFee > 0) {
        const acc = await getSystemAccount(req.db, req.tenantId, 'Study Desk Income', 'Income', 'Service Income');
        await recordTransaction(req.db, req.tenantId, { debitAccountId: studentAccount._id, creditAccountId: acc._id, amount: deskFee, type: 'fee_charge', description: 'Study Desk Fee (Manual)', userId: req.user?._id, studentId: user._id });
      }

      if (req.body.package && user.status === 'approved') {
        const pkg = await (await import('../package/package.model.js')).default.findById(req.body.package);
        if (pkg && Number(pkg.price) > 0) {
          const acc = await getSystemAccount(req.db, req.tenantId, 'Membership Income', 'Income', 'Operating Income');
          await recordTransaction(req.db, req.tenantId, { debitAccountId: studentAccount._id, creditAccountId: acc._id, amount: Number(pkg.price), type: 'fee_charge', description: `Membership Fee (${pkg.name})`, userId: req.user?._id, studentId: user._id });
          await user.updateOne({ membershipCharged: true });
        }
      }
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
      status: 'approved',
      documents: req.body.documents?.map(doc => ({ ...doc, status: 'verified' })) || [],
      password: req.body.password || 'password123'
    });

    const { ensureStudentAccount, getSystemAccount, recordTransaction, seedChartOfAccounts } = await import('../ledger/finance.controller.js');

    await seedChartOfAccounts(req.db, req.tenantId);

    const studentAccount = await ensureStudentAccount(req.db, req.tenantId, newUser._id, newUser.fullName);

    let membershipCharged = false;

    const regFee = Number(req.body.registrationFee) || 0;
    if (regFee > 0) {
      const acc = await getSystemAccount(req.db, req.tenantId, 'Registration Fees', 'Income', 'Operating Income');
      await recordTransaction(req.db, req.tenantId, { debitAccountId: studentAccount._id, creditAccountId: acc._id, amount: regFee, type: 'fee_charge', description: 'Initial Registration Fee', userId: req.user?._id, studentId: newUser._id });
    }

    const secDeposit = Number(req.body.securityDeposit) || 0;
    if (secDeposit > 0) {
      const acc = await getSystemAccount(req.db, req.tenantId, 'Security Deposits', 'Liabilities', 'Deposit');
      await recordTransaction(req.db, req.tenantId, { debitAccountId: studentAccount._id, creditAccountId: acc._id, amount: secDeposit, type: 'fee_charge', description: 'Refundable Security Deposit', userId: req.user?._id, studentId: newUser._id });
    }

    const membershipFee = pkg ? Number(pkg.price) : 0;
    if (membershipFee > 0) {
      const acc = await getSystemAccount(req.db, req.tenantId, 'Membership Income', 'Income', 'Operating Income');
      await recordTransaction(req.db, req.tenantId, { debitAccountId: studentAccount._id, creditAccountId: acc._id, amount: membershipFee, type: 'fee_charge', description: `Membership Fee (${pkg.name})`, userId: req.user?._id, studentId: newUser._id });
      membershipCharged = true;
    }

    const deskFee = Number(req.body.studyDeskFee) || 0;
    if (deskFee > 0) {
      const acc = await getSystemAccount(req.db, req.tenantId, 'Study Desk Income', 'Income', 'Service Income');
      await recordTransaction(req.db, req.tenantId, { debitAccountId: studentAccount._id, creditAccountId: acc._id, amount: deskFee, type: 'fee_charge', description: 'Study Desk Fee', userId: req.user?._id, studentId: newUser._id });
    }

    if (membershipCharged) {
      await newUser.updateOne({ membershipCharged: true });
    }

    try {
      const sendEmail = (await import('../../utils/emailService.js')).default;
      const { welcomeEmailTemplate } = await import('../../templates/emails/welcomeEmail.js');
      const { default: Tenant } = await import('../tenant/tenant.model.js');

      const tenant = await Tenant.findById(req.tenantId);
      const libraryName = tenant?.name || 'Welib Library';

      await sendEmail({
        email: newUser.email,
        name: newUser.fullName,
        subject: `Welcome to ${libraryName} - Registration Successful`,
        html: welcomeEmailTemplate({
          fullName: newUser.fullName,
          idNumber: newUser.idNumber,
          email: newUser.email,
          status: newUser.status,
          password: req.body.password || 'password123',
          libraryName
        }),
        message: `Hello ${newUser.fullName}, your registration at ${libraryName} is successful. Your Library ID is ${newUser.idNumber}.`
      });
    } catch (emailErr) {
      console.error('Registration Email Error:', emailErr.message);
    }

    res.status(201).json({ status: 'success', data: { user: newUser, account: studentAccount } });

  } catch (err) {
    next(err);
  }
};

export const approveRegistration = async (req, res, next) => {
  try {
    const { User, Account } = getModels(req.db);
    const filter = req.tenantId ? { _id: req.params.id, tenantId: req.tenantId } : { _id: req.params.id };
    const user = await User.findOne(filter).populate('package');

    if (!user) {
      const error = new Error('No user found with that ID');
      error.statusCode = 404;
      throw error;
    }

    if (user.status === 'approved') {
      const error = new Error('User is already approved');
      error.statusCode = 400;
      throw error;
    }

    user.status = 'approved';

    user.documents.forEach(doc => { doc.status = 'verified'; });

    if (user.package) {
      user.packageStartDate = new Date();
      user.packageEndDate = addDays(new Date(), user.package.duration);
      user.subscriptionStatus = 'active';
    }

    await user.save();

    // --- Auto Create Student Account (Ledger) ---
    const { ensureStudentAccount, getSystemAccount, recordTransaction, seedChartOfAccounts } = await import('../ledger/finance.controller.js');
    await seedChartOfAccounts(req.db, req.tenantId);
    const studentAccount = await ensureStudentAccount(req.db, req.tenantId, user._id, user.fullName);

    // Guard: only charge membership if not already charged at registration
    const freshUser = await User.findById(user._id).select('membershipCharged');
    const alreadyCharged = freshUser?.membershipCharged || false;

    const membershipFee = user.package ? Number(user.package.price) : 0;
    if (membershipFee > 0 && !alreadyCharged) {
      const acc = await getSystemAccount(req.db, req.tenantId, 'Membership Income', 'Income', 'Operating Income');
      await recordTransaction(req.db, req.tenantId, { debitAccountId: studentAccount._id, creditAccountId: acc._id, amount: membershipFee, type: 'fee_charge', description: `Membership Fee (${user.package.name})`, userId: req.user?._id, studentId: user._id });
      await User.findByIdAndUpdate(user._id, { membershipCharged: true });
    }

    if (user.selectedServices?.includes('Study Desk')) {
      const deskFee = Number(req.body.studyDeskFee || req.body.servicesFee) || 0;
      if (deskFee > 0) {
        const acc = await getSystemAccount(req.db, req.tenantId, 'Study Desk Income', 'Income', 'Service Income');
        await recordTransaction(req.db, req.tenantId, { debitAccountId: studentAccount._id, creditAccountId: acc._id, amount: deskFee, type: 'fee_charge', description: 'Study Desk Fee', userId: req.user?._id, studentId: user._id });
      }
    }

    const regFee = Number(req.body.registrationFee) || 0;
    if (regFee > 0) {
      const acc = await getSystemAccount(req.db, req.tenantId, 'Registration Fees', 'Income', 'Operating Income');
      await recordTransaction(req.db, req.tenantId, { debitAccountId: studentAccount._id, creditAccountId: acc._id, amount: regFee, type: 'fee_charge', description: 'Initial Registration Fee', userId: req.user?._id, studentId: user._id });
    }

    const secDeposit = Number(req.body.securityDeposit) || 0;
    if (secDeposit > 0) {
      const acc = await getSystemAccount(req.db, req.tenantId, 'Security Deposits', 'Liabilities', 'Deposit');
      await recordTransaction(req.db, req.tenantId, { debitAccountId: studentAccount._id, creditAccountId: acc._id, amount: secDeposit, type: 'fee_charge', description: 'Refundable Security Deposit', userId: req.user?._id, studentId: user._id });
    }

    res.status(200).json({
      status: 'success',
      message: 'User approved securely and ledger generated.',
      data: { user, account: studentAccount }
    });

  } catch (err) {
    next(err);
  }
};

export const rejectRegistration = async (req, res, next) => {
  try {
    const { User } = getModels(req.db);
    const filter = req.tenantId ? { _id: req.params.id, tenantId: req.tenantId } : { _id: req.params.id };

    if (!req.body.rejectionReason) {
      const error = new Error('Rejection reason is required');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOneAndUpdate(filter, {
      status: 'rejected',
      rejectionReason: req.body.rejectionReason
    }, { new: true });

    if (!user) {
      const error = new Error('No user found with that ID');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      status: 'success',
      message: 'Registration rejected.',
      data: { user }
    });
  } catch (err) {
    next(err);
  }
};

export const assignPackage = async (req, res, next) => {
  try {
    const { User, Account } = getModels(req.db);
    const { packageId } = req.body;

    const user = await User.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!user) {
      const error = new Error('No user found with that ID');
      error.statusCode = 404;
      throw error;
    }

    const pkg = await Package.findById(packageId);
    if (!pkg) {
      const error = new Error('No package found with that ID');
      error.statusCode = 404;
      throw error;
    }

    user.package = packageId;
    user.packageStartDate = new Date();
    user.packageEndDate = addDays(new Date(), pkg.duration);
    user.subscriptionStatus = 'active';
    await user.save();

    // --- Create Ledger Transaction ---
    const { ensureStudentAccount, recordTransaction } = await import('../ledger/finance.controller.js');
    const studentAccount = await ensureStudentAccount(req.db, req.tenantId, user._id, user.fullName);

    const getIncomeAcc = async (name) => {
      let acc = await Account.findOne({ tenantId: req.tenantId, name });
      if (!acc) {
        acc = await Account.create({ tenantId: req.tenantId, name, type: 'Income', subType: 'Operating Income', isSystem: true });
      }
      return acc;
    };

    const membershipFee = Number(pkg.price) || 0;
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

    res.status(200).json({
      status: 'success',
      message: 'Package assigned and ledger updated.',
      data: { user }
    });

    try {
      if (user.phone) {
        const tenant = await Tenant.findById(req.tenantId);
        const libraryName = tenant?.name || 'Library';
        const message = `✨ *Membership Activated* ✨\n\nDear ${user.fullName},\n\nYour membership for *"${pkg.name}"* has been activated at *${libraryName}*.\n\n📅 *Valid From:* ${format(user.packageStartDate, 'dd MMM yyyy')}\n📅 *Valid Until:* ${format(user.packageEndDate, 'dd MMM yyyy')}\n\nThank you for being a part of our library!`;
        await WhatsAppService.sendMessage(req.tenantId, user.phone, message);
      }
    } catch (waErr) {
      console.error('[WA] Package assignment notification failed:', waErr.message);
    }
  } catch (err) {
    next(err);
  }
};

export const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
