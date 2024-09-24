import { Request, Response } from "express";
import Users from "../../models/users.model";
import Roles from "../../models/roles.model";
import md5 from "md5";
import jwt from "jsonwebtoken";
import { generateToken } from "../../helpers/jwtHelper.js";
import { ROLE, STATUS, User } from "../../config/system.config";
import Posts from "../../models/posts.model";

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
    return res.status(500).json({
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
    return res.status(500).json({
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
    return res.status(500).json({
      message: "Error server",
    });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const {userId, username, oldPassword, newPassword} = req.body;
    if(!userId) {
      return res.status(400).json({
        message: "Please provide user id"
      });
    }

    const user = await Users.findOne({_id: userId, deleted: false});
    if(user) {
      const updateInfo: {
        username?: string,
        password?: string
      } = {};

      if(username) {
        updateInfo.username = username;
      }

      if(oldPassword && newPassword) {
        if(md5(oldPassword) !== user.password) {
          return res.status(400).json({
            message: "Please provide a correct old password",
          });
        }
        updateInfo.password = md5(newPassword);
      }

      
      await Users.updateOne({_id: userId, deleted: false}, updateInfo);
  
      return res.status(200).json({
        message: "Updated successfully",
        success: true,
        data: {
          id: user.id,
          username: username,
          email: user.email,
          roleId: user.roleId,
          avatar: user.avatar
        }
      })
    } else {
      return res.status(400).json({
        message: "Please provide a valid user id",
      });
    }

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
}

export const getDetailById = async(req: Request, res: Response) => {
  try {
    const userId: string = req.params.userId;
    if(!userId) {
      return res.status(400).json({
        message: "Please provide user id",
      });
    }

    const user = await Users.findOne({_id: userId, status: STATUS.ACTIVE, deleted: false});

    const [listPosts, listFriends] = await Promise.all([
      Posts.find({ _id: { $in: user.listPostId}, deleted: false, status: STATUS.ACTIVE}).sort({createdAt: "desc"}),
      Users.find({ _id: { $in: user.listFriendId, $ne: user.id}, deleted: false, status: STATUS.ACTIVE}).limit(9).select("-password"),
    ])

    const userReturn = {
      id: user.id,
      username: user.username,
      email: user.email,
      roleId: user.roleId,
      avatar: user.avatar,
      cover: user.cover,
      slug: user.slug,
      listPosts,
      listFriends
    }

    return res.status(200).json({
      success: true,
      data: userReturn
    })

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error server",
    })
  }
}

export const updateCover = async(req: Request, res: Response) => {
  try {
    const userId: string = req.body.userId;
    const cover: string = req.body.cover;

    if(!userId) {
      return res.status(400).json({
        success: false,
        message: "Please send user id"
      });
    }

    if(!cover) {
      return res.status(400).json({
        success: false,
        message: "Please send cover"
      });
    }

    await Users.updateOne({
      _id: userId
    }, {
      cover: cover
    });
    
    return res.status(200).json({
      success: true,
      message: "Updated cover successfully"
    });
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error server"
    })
  }
}

export const updateAvatar = async (req: Request, res: Response) => {
  try {
    const userId: string = req.body.userId;
    const avatar: string = req.body.avatar;

    if(!userId) {
      return res.status(400).json({
        success: false,
        message: "Please send user id"
      });
    }

    if(!avatar) {
      return res.status(400).json({
        success: false,
        message: "Please send avatar"
      });
    }

    await Users.updateOne({
      _id: userId
    }, {
      avatar: avatar
    });

    return res.status(200).json({
      success: true,
      message: "Updated avatar successfully"
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error server"
    })
  }
}