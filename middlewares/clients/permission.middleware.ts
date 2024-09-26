// src/middlewares/authMiddleware.ts

import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export const permissionsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId: string = req.body.userId;

    if(!userId) {
        return res.status(400).json({
          success: false,
          message: "Please send user id"
        });
    }

    if(req["user"].id !== req.body.userId) {
        return res.status(403).json({
          success: false,
          message: "Permissions are denied"
        })
    }

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
