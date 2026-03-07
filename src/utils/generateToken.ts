import jwt from "jsonwebtoken";

//types
import type { SignOptions } from "jsonwebtoken";
import type { Response } from "express";

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error("JWT_SECRET is not defined in env");
}

export const generateToken = (userId: string, res: Response) => {
  const payload: object = { id: userId };
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as any,
  };

  const token = jwt.sign(payload, secret, options);

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
  return token;
};
