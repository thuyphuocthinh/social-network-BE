import express, { Express } from "express";
import * as controller from "../../../../controllers/clients/reminders.controller";
const router: express.Router = express.Router();

router.patch("/delete/:reminderId", controller.deleteById);
router.post("/create", controller.create);
router.get("/remind", controller.remind);
router.patch("/update/:reminderId", controller.updateById);
router.get("/remind/:userId", controller.remind);

export default router;
    