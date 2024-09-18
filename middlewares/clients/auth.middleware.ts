import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader: string = req.headers.authorization;
    const secretKey = process.env.SECRET_KEY;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      jwt.verify(token, secretKey, (err: any, playload: any) => {
        if (err) {
          return res.status(400).json({
            success: false,
            message: "Invalid token",
          });
        } else {
          next();
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Token is not provided",
      });
    }
  } catch (error) {
    console.log(error);
  }
};
