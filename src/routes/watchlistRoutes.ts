import express, { Router } from "express";
import { addToWatchlist } from "../controllers/watchlistController.js";

const router: Router = express.Router();

router.post("/", express.json(), addToWatchlist);;

// router.post("/login", );

// router.post("/logout", );

export default router;
