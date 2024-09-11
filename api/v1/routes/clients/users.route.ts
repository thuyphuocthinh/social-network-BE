import express, { Express } from "express";
import * as controller from "../../../../controllers/clients/users.controller";
const router: express.Router = express.Router();

router.post("/login", controller.login);
router.post("/register", controller.register);

export default router;
