import type { NextFunction, Request, Response } from "express";
import { createHash, timingSafeEqual } from "node:crypto";

const hash = (value: string) => createHash("sha256").update(value).digest();

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    console.error("ADMIN_PASSWORD is missing in the .env file");
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again later." });
  }

  const provided = req.header("x-admin-password") ?? "";
  if (timingSafeEqual(hash(provided), hash(expected))) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
}
