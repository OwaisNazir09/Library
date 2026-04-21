import PlatformPackage from './package.model.js';
import Tenant from '../tenant/tenant.model.js';
import { addDays } from 'date-fns';

// ── GET all packages ──────────────────────────────────────
export const getAllPackages = async (req, res, next) => {
  try {
    const packages = await PlatformPackage.find().sort({ sortOrder: 1, createdAt: 1 });
    res.status(200).json({ status: 'success', results: packages.length, data: packages });
  } catch (err) {
    next(err);
  }
};

// ── GET single package ────────────────────────────────────
export const getPackage = async (req, res, next) => {
  try {
    const pkg = await PlatformPackage.findById(req.params.id);
    if (!pkg) return res.status(404).json({ status: 'fail', message: 'Package not found' });
    res.status(200).json({ status: 'success', data: pkg });
  } catch (err) {
    next(err);
  }
};

// ── CREATE package ────────────────────────────────────────
export const createPackage = async (req, res, next) => {
  try {
    const pkg = await PlatformPackage.create(req.body);
    res.status(201).json({ status: 'success', data: pkg });
  } catch (err) {
    next(err);
  }
};

// ── UPDATE package ────────────────────────────────────────
export const updatePackage = async (req, res, next) => {
  try {
    const pkg = await PlatformPackage.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!pkg) return res.status(404).json({ status: 'fail', message: 'Package not found' });
    res.status(200).json({ status: 'success', data: pkg });
  } catch (err) {
    next(err);
  }
};

// ── DELETE package ────────────────────────────────────────
export const deletePackage = async (req, res, next) => {
  try {
    const pkg = await PlatformPackage.findByIdAndDelete(req.params.id);
    if (!pkg) return res.status(404).json({ status: 'fail', message: 'Package not found' });
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
};

// ── ASSIGN package to a library ───────────────────────────
export const assignPackageToLibrary = async (req, res, next) => {
  try {
    const { libraryId } = req.params;
    const { packageId, startDate } = req.body;

    const pkg = await PlatformPackage.findById(packageId);
    if (!pkg) return res.status(404).json({ status: 'fail', message: 'Package not found' });

    const start = startDate ? new Date(startDate) : new Date();
    const expiryDate = addDays(start, pkg.durationDays);

    const tenant = await Tenant.findByIdAndUpdate(
      libraryId,
      {
        plan: pkg.name.toLowerCase().replace(/\s+/g, '_'),
        assignedPackage: pkg._id,
        status: 'active',
        expiryDate,
        paymentStatus: 'paid',
        features: pkg.features
      },
      { new: true }
    );

    if (!tenant) return res.status(404).json({ status: 'fail', message: 'Library not found' });

    res.status(200).json({
      status: 'success',
      message: `Package "${pkg.name}" assigned to "${tenant.name}". Access valid until ${expiryDate.toISOString().split('T')[0]}.`,
      data: { tenant, package: pkg }
    });
  } catch (err) {
    next(err);
  }
};

// ── GET libraries using a specific package ─────────────────
export const getLibrariesByPackage = async (req, res, next) => {
  try {
    const libraries = await Tenant.find({ assignedPackage: req.params.id })
      .select('name email status expiryDate plan');
    res.status(200).json({ status: 'success', results: libraries.length, data: libraries });
  } catch (err) {
    next(err);
  }
};
