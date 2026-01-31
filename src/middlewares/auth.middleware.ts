import { fromNodeHeaders } from "better-auth/node";
import { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth";

export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string | undefined;
        name: string | undefined;
        email: string | undefined;
        role: UserRole | undefined | null;
        emailVerified: boolean | undefined;
      };
    }
  }
}
const middleware = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.cookie;
    if (!token) {
      return res.send("you are not authenticate");
    }
    // decode token
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    req.user = {
      id: session?.user.id,
      name: session?.user.name,
      email: session?.user.name,
      role: session?.user.role as UserRole,
      emailVerified: session?.user.emailVerified,
    };
    if (roles.length && !roles.includes(req.user.role as UserRole)) {
      return res.send("Forbidden access");
    }
    next();
  };
};

export default middleware;
