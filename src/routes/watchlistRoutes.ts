import express, { Router } from "express";
import {
  addToWatchlist,
  removeFromWatchlistItem,
  updateWatchlistItem,
} from "../controllers/watchlistController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router: Router = express.Router();

router.use(authMiddleware);

router.post("/", addToWatchlist);

router.put("/:id", updateWatchlistItem);

router.delete("/:id", removeFromWatchlistItem);

export default router;
