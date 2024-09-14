import express, { Express } from "express";
import * as controller from "../../../../controllers/clients/status.controller";
const router: express.Router = express.Router();

router.get("/getListTaskStatus", controller.getListTaskStatus);

export default router;
