import { Express } from "express";
import usersRoutes from "./users.route";
import { SYSTEM } from "../../../../config/system.config";
export const appRoutes = (app: Express) => {
  app.use(`${SYSTEM.API_V1}/auth`, usersRoutes);
};
