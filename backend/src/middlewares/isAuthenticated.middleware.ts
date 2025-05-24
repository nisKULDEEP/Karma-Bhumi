import { NextFunction, Request, Response } from "express";
import { UnauthorizedException } from "../utils/appError";
import { ErrorCodeEnum } from "../enums/error-code.enum";

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  // Log authentication information for debugging
  console.log('Authentication check:', {
    hasSession: !!req.session,
    hasPassport: !!req.user,
    userId: req.user?._id
  });

  if (!req.user || !req.user._id) {
    throw new UnauthorizedException(
      "Unauthorized. Please log in.",
      ErrorCodeEnum.ACCESS_UNAUTHORIZED
    );
  }
  next();
};

// Keep default export for backward compatibility
export default isAuthenticated;
