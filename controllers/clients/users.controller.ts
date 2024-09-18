import { Request, Response } from "express";
import Users from "../../models/users.model";
import Roles from "../../models/roles.model";
import md5 from "md5";
import jwt from "jsonwebtoken";
import { generateToken } from "../../helpers/jwtHelper.js";
import { ROLE, STATUS, User } from "../../config/system.config";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (email && password) {
      const findEmail = await Users.findOne({
        email,
        deleted: false,
        status: STATUS.ACTIVE,
      });
      if (!findEmail) {
        return res.status(400).json({
          success: false,
          message: "Email does not exist",
        });
      }
      if (findEmail.password !== md5(password)) {
        return res.status(400).json({
          success: false,
          message: "Password is incorrect",
        });
      }
      // Generate JWT token
      const token = generateToken({
        username: findEmail.username,
        password: findEmail.password,
      });

      // success
      return res.status(200).json({
        success: true,
        message: "Login successfully",
        data: {
          id: findEmail.id,
          username: findEmail.username,
          email: findEmail.email,
          roleId: findEmail.roleId,
          avatar: findEmail.avatar,
          token: token,
        },
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "Email and password are required",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Server error",
    });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body;
    if (email && password && username) {
      const findEmail = await Users.findOne({
        email,
        deleted: false,
        status: STATUS.ACTIVE,
      });
      if (findEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
      const roleUser = await Roles.findOne({
        title: ROLE.USER,
        deleted: false,
      });
      const newUser: User = {
        email,
        password: md5(password),
        username,
        avatar:
          "https://i.pinimg.com/736x/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg",
        roleId: roleUser.id,
      };
      const newRecord = new Users(newUser);
      await newRecord.save();
      const token = generateToken({
        username: newRecord.username,
        password: newRecord.password,
      });
      return res.status(200).json({
        success: true,
        message: "Registerred successfully",
        data: {
          id: newRecord.id,
          email: newRecord.email,
          username: newRecord.username,
          avatar: newRecord.avatar,
          roleId: newRecord.roleId,
          token: token,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Email, password, username are required",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Server error",
    });
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  try {
    if (req.body) {
      const secretKey = process.env.SECRET_KEY;
      const token = req.body.token;
      if (token) {
        jwt.verify(token, secretKey, (err: any, playload: any) => {
          if (err) {
            return res.status(400).json({
              success: false,
              message: "Invalid token",
            });
          } else {
            return res.status(200).json({
              success: true,
              message: "Valid token",
            });
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Token is not provided",
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: "Token is not provided",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Error server",
    });
  }
};
