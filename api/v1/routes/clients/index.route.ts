import { Express, Request, Response } from "express";
import { SYSTEM } from "../../../../config/system.config";
import { authMiddleware } from "../../../../middlewares/clients/auth.middleware";
import authRoutes from "./auth.route";
import statusRoutes from "./status.route";
import tasksRoutes from "./tasks.route";
import labelsRoutes from "./labels.route";
import usersRoutes from "./users.route";
import remindersRoutes from "./reminders.route";

export const appRoutes = (app: Express) => {
  app.use(`${SYSTEM.API_V1}/auth`, authRoutes);
  app.use(`${SYSTEM.API_V1}/tasks`, authMiddleware, tasksRoutes);
  app.use(`${SYSTEM.API_V1}/status`, authMiddleware, statusRoutes);
  app.use(`${SYSTEM.API_V1}/labels`, authMiddleware, labelsRoutes);
  app.use(`${SYSTEM.API_V1}/users`, authMiddleware, usersRoutes);
  app.use(`${SYSTEM.API_V1}/reminder`, authMiddleware, remindersRoutes);
};
