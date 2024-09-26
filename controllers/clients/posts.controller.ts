import { Request, Response } from "express";
import Posts from "../../models/posts.model";
import { STATUS } from "../../config/system.config";
import Users from "../../models/users.model";

export const getByUser = async (req: Request, res: Response) => {
    try {
        const userId: string = req.params.userId;
        const skipItem: number = Number(req.params.skipItem);
        if(!userId) {
            return res.status(400).json({
                success: false,
                message: "Please provider user id"
            });
        }
        
        const [user, posts] = await Promise.all([
            Users.findOne({deleted: false, status: STATUS.ACTIVE, _id: userId}),
            Posts.find({
                userId: userId,
                deleted: false,
                status: STATUS.ACTIVE
            }).limit(4).skip(skipItem)
        ])
        
        return res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                },
                posts: posts
            }
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error server"
        })
    }
}