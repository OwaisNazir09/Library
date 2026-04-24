import { getModels } from "../../utils/helpers.js";

// @desc    Create new quote
// @route   POST /api/quotes
// @access  Private (Admin/SuperAdmin)
export const createQuote = async (req, res, next) => {
  try {
    const { Quote } = getModels(req.db);
    const isSuperAdmin = req.user.role === "super_admin";

    const quoteData = {
      ...req.body,
      createdBy: req.user.id,
    };

    if (!isSuperAdmin) {
      quoteData.isGlobal = false;
      quoteData.libraryId = req.tenantId;
    } else if (!req.body.libraryId) {
      quoteData.isGlobal = true;
    }

    const newQuote = await Quote.create(quoteData);

    res.status(201).json({
      status: "success",
      data: { quote: newQuote },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all quotes
// @route   GET /api/quotes
// @access  Private (Admin/SuperAdmin)
export const getAllQuotes = async (req, res, next) => {
  try {
    const { Quote } = getModels(req.db);
    const isSuperAdmin = req.user.role === "super_admin";

    let filter = {};
    if (!isSuperAdmin) {
      filter = {
        $or: [{ libraryId: req.tenantId }, { isGlobal: true }],
      };
    }

    const quotes = await Quote.find(filter).sort("-createdAt");

    res.status(200).json({
      status: "success",
      results: quotes.length,
      data: { quotes },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single quote
// @route   GET /api/quotes/:id
// @access  Private (Admin/SuperAdmin)
export const getQuote = async (req, res, next) => {
  try {
    const { Quote } = getModels(req.db);
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      const error = new Error("No quote found with that ID");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      status: "success",
      data: { quote },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update quote
// @route   PATCH /api/quotes/:id
// @access  Private (Admin/SuperAdmin)
export const updateQuote = async (req, res, next) => {
  try {
    const { Quote } = getModels(req.db);
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      const error = new Error("No quote found with that ID");
      error.statusCode = 404;
      throw error;
    }

    if (req.user.role !== "super_admin" && quote.isGlobal) {
      const error = new Error("You cannot edit global quotes");
      error.statusCode = 403;
      throw error;
    }

    if (req.user.role !== "super_admin" && quote.libraryId.toString() !== req.tenantId.toString()) {
      const error = new Error("You cannot edit quotes for other libraries");
      error.statusCode = 403;
      throw error;
    }

    const updatedQuote = await Quote.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      data: { quote: updatedQuote },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete quote
// @route   DELETE /api/quotes/:id
// @access  Private (Admin/SuperAdmin)
export const deleteQuote = async (req, res, next) => {
  try {
    const { Quote } = getModels(req.db);
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      const error = new Error("No quote found with that ID");
      error.statusCode = 404;
      throw error;
    }

    if (req.user.role !== "super_admin" && quote.isGlobal) {
      const error = new Error("You cannot delete global quotes");
      error.statusCode = 403;
      throw error;
    }

    if (req.user.role !== "super_admin" && quote.libraryId.toString() !== req.tenantId.toString()) {
      const error = new Error("You cannot delete quotes for other libraries");
      error.statusCode = 403;
      throw error;
    }

    await Quote.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

export const getDailyQuote = async (req, res, next) => {
  try {
    const { Quote } = getModels(req.db);

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const filter = {
      active: true,
      dateScheduled: { $lte: today },
      $or: [{ libraryId: req.tenantId }, { isGlobal: true }],
    };

    const quotes = await Quote.find(filter)
      .sort({ featured: -1, dateScheduled: -1, createdAt: -1 })
      .limit(1);

    const dailyQuote = quotes.length > 0 ? quotes[0] : null;

    res.status(200).json({
      status: "success",
      data: { quote: dailyQuote },
    });
  } catch (err) {
    next(err);
  }
};
