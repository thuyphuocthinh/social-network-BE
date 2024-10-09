import { Express, Request, Response } from "express";
import { SYSTEM } from "../../../../config/system.config";
import { authMiddleware } from "../../../../middlewares/clients/auth.middleware";
import authRoutes from "./auth.route";
import statusRoutes from "./status.route";
import tasksRoutes from "./tasks.route";
import labelsRoutes from "./labels.route";
import usersRoutes from "./users.route";
import remindersRoutes from "./reminders.route";
import postsRoutes from "./posts.route";
import * as amqp from "amqplib";

export const appRoutes = (app: Express) => {
  app.use(`${SYSTEM.API_V1}/auth`, authRoutes);
  app.use(`${SYSTEM.API_V1}/tasks`, authMiddleware, tasksRoutes);
  app.use(`${SYSTEM.API_V1}/status`, authMiddleware, statusRoutes);
  app.use(`${SYSTEM.API_V1}/labels`, authMiddleware, labelsRoutes);
  app.use(`${SYSTEM.API_V1}/users`, authMiddleware, usersRoutes);
  app.use(`${SYSTEM.API_V1}/reminder`, authMiddleware, remindersRoutes);
  app.use(`${SYSTEM.API_V1}/posts`, authMiddleware, postsRoutes);
  app.post(`${SYSTEM.API_V1}/notify`, async (req: Request, res: Response) => {
    try {
      const { channelFromClient, message } = req.body;
      console.log("channelFromClient", channelFromClient);
      console.log("message", message);
      const connection = await amqp.connect(process.env.AMQP_URL);
      const channel = await connection.createChannel();
      await channel.assertQueue(channelFromClient);
      channel.sendToQueue(channelFromClient, Buffer.from(JSON.stringify(message)));
      await channel.close();
      await connection.close();
      res.status(200).json({ message: 'Notification sent' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message:"Failed to send notification"
      })
    }
  })
};
