import express, { Express } from "express";
import multer from 'multer';
import * as controller from "../../../../controllers/clients/users.controller";
import * as uploadMiddleware from "../../../../middlewares/clients/upload.middleware";
const router: express.Router = express.Router();
const upload = multer();

router.patch("/update", controller.update);
router.get("/getDetail/:userId", controller.getDetailById);
router.patch("/updateCover", upload.single("cover"), uploadMiddleware.uploadSingle ,controller.updateCover);
router.patch("/updateAvatar", upload.single("avatar"), uploadMiddleware.uploadSingle, controller.updateAvatar);

export default router;
