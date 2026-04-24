import express from "express";
import { protect, restrictTo } from "../../middleware/auth.js";
import {
  createQuote,
  getAllQuotes,
  getQuote,
  updateQuote,
  deleteQuote,
  getDailyQuote,
} from "./quote.controller.js";

const router = express.Router();

router.get("/daily", protect, getDailyQuote);

router.use(protect, restrictTo("librarian", "super_admin"));

router
  .route("/")
  .get(getAllQuotes)
  .post(createQuote);

router
  .route("/:id")
  .get(getQuote)
  .patch(updateQuote)
  .delete(deleteQuote);

export default router;
