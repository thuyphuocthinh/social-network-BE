// src/middlewares/authMiddleware.ts

import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader: string | undefined = req.headers.authorization;
    const secretKey = process.env.SECRET_KEY;
    // console.log(authHeader);
    // Ensure that secretKey is set
    if (!secretKey) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error: Secret key not set",
      });
    }

    // Ensure authHeader exists and has correct format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Token is not provided or invalid format",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    jwt.verify(token, secretKey, (err: any, payload: JwtPayload | undefined) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: "Invalid token",
        });
      }

      // Optionally attach user info to request
      // req.user = payload;

      next(); // Proceed to the next middleware or route handler
    });
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
