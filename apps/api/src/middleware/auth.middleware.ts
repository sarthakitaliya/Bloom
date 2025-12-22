import type { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";

interface userSession {
  id: string;
  name: string;
  email: string;
  image: string;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session) {
      console.log("Authentication failed: No session found");
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.user = session.user as userSession;
    next();
  } catch (error) {
    next(error);
  }
};
