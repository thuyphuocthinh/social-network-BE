import express, { Express } from "express";
import * as controller from "../../../../controllers/clients/labels.controller";
const router: express.Router = express.Router();

router.get("/getListLabels/:userId", controller.getListLabels);
router.post("/create", controller.createLabel);
router.patch("/updateTitle", controller.updateLabelTitle);
router.patch("/delete/:labelId", controller.deleteLabel);
router.get("/getLabelById/:labelId", controller.getLabelById);

export default router;
