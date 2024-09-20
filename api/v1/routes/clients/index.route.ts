import { Express, Request, Response } from "express";
import { SYSTEM } from "../../../../config/system.config";
import { authMiddleware } from "../../../../middlewares/clients/auth.middleware";
import usersRoutes from "./users.route";
import statusRoutes from "./status.route";
import tasksRoutes from "./tasks.route";
import labelsRoutes from "./labels.route";

export const appRoutes = (app: Express) => {
  app.use(`${SYSTEM.API_V1}/auth`, usersRoutes);
  app.use(`${SYSTEM.API_V1}/tasks`, authMiddleware, tasksRoutes);
  app.use(`${SYSTEM.API_V1}/status`, authMiddleware, statusRoutes);
  app.use(`${SYSTEM.API_V1}/labels`, authMiddleware, labelsRoutes);
};
