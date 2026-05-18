import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";
import type { Response, Request, NextFunction } from "express";

// Read the token from the request
// Check if token is valid
const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log("Auth middleware reached");
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({ error: "Not authorized, no token provided" });
  }

  try {
    // Verify token and extract the user Id

    // Check to exits secret
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const decode = jwt.verify(token, secret) as jwt.JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decode.id },
    });

    if (!user) {
      return res.status(401).json({ error: "User no longer exists" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Not authorized, token failed" });
  }
};

export { authMiddleware };
