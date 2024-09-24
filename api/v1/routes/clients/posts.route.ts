import express, { Express } from "express";
import * as controller from "../../../../controllers/clients/posts.controller";
const router: express.Router = express.Router();

router.get("/getByUser/:userId/:skipItem", controller.getByUser);

export default router;
