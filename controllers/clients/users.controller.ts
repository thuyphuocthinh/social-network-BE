import { Request, Response } from "express";
import Users from "../../models/users.model";
import Roles from "../../models/roles.model";
import md5 from "md5";
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
          message: "Email does not exist",
        });
      }
      if (findEmail.password !== md5(password)) {
        return res.status(400).json({
          message: "Password is incorrect",
        });
      }
      // success
      return res.status(200).json({
        message: "Login successfully",
        data: {
          username: findEmail.username,
          email: findEmail.email,
          roleId: findEmail.roleId,
          avatar: findEmail.avatar,
        },
      });
    } else {
      return res.status(400).json({
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
          message: "Email already exist",
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
      return res.status(200).json({
        message: "Registerred successfully",
        data: {
          email: newRecord.email,
          username: newRecord.username,
          avatar: newRecord.avatar,
          roleId: findEmail.roleId,
        },
      });
    } else {
      return res.status(400).json({
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
