import type { Request, Response } from "express";
import { prisma } from "../config/db.js";
import { WatchlistStatus } from "@prisma/client";

interface UpdateWatchlistBody {
  status?: WatchlistStatus;
  rating?: number;
  notes?: string;
}

const addToWatchlist = async (req: Request, res: Response) => {
  const { movieId, status, rating, notes } = req.body;

  if (!movieId) {
    return res.status(400).json({ error: "movieId and userId are required" });
  }

  // Verify movie exists
  const movie = await prisma.movie.findUnique({
    where: { id: movieId },
  });

  if (!movie) {
    return res.status(404).json({
      error: "Movie not found",
    });
  }

  // Check already added
  const existingInWatchlist = await prisma.watchlistItem.findUnique({
    where: {
      userId_movieId: {
        userId: req.user.id,
        movieId: movieId,
      },
    },
  });

  if (existingInWatchlist) {
    return res.status(400).json({
      error: "Movie already in the watchlist",
    });
  }

  const watchlistItem = await prisma.watchlistItem.create({
    data: {
      userId: req.user.id,
      movieId,
      status: status || "PLANNED",
      rating,
      notes,
    },
  });

  res.status(201).json({
    status: "success",
    data: watchlistItem,
  });
};

const removeFromWatchlistItem = async (req: Request, res: Response) => {
  // find item watchlsit
  const watchlistItem = await prisma.watchlistItem.findUnique({
    where: { id: req.params.id as string },
  });
  // checl is avaible item
  if (!watchlistItem) {
    return res.status(404).json({ error: "Watchlist item not found" });
  }
  // checl persmission to delete item
  if (watchlistItem.userId !== req.user.id) {
    return res.status(403).json({
      error: "Not allowed to update this watchlist item",
    });
  }
  //detle item
  await prisma.watchlistItem.delete({
    where: { id: req.params.id as string },
  });
  // send finished info
  res.status(200).json({
    status: "success",
    message: "Movie remove from watchlist",
  });
};

const updateWatchlistItem = async (req: Request, res: Response) => {
  const { status, rating, notes } = req.body as UpdateWatchlistBody;

  // Find watchlist item and verify ownership
  const watchlistItem = await prisma.watchlistItem.findUnique({
    where: { id: req.params.id as string },
  });
  // checl is avaible item
  if (!watchlistItem) {
    return res.status(404).json({ error: "Watchlist item not found" });
  }
  // checl persmission to update item
  if (watchlistItem.userId !== req.user.id) {
    return res.status(403).json({
      error: "Not allowed to update this watchlist item",
    });
  }

  //Build update data
  const updateData: UpdateWatchlistBody = {};
  if (status !== undefined)
    updateData.status = status.toUpperCase() as WatchlistStatus;
  if (rating !== undefined) updateData.rating = rating;
  if (notes !== undefined) updateData.notes = notes;

  await prisma.watchlistItem.update({
    where: { id: req.params.id as string },
    data: updateData,
  });
};

export { addToWatchlist, removeFromWatchlistItem, updateWatchlistItem };
