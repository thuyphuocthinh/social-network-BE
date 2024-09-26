import express, { Express } from "express";
import multer from 'multer';
import * as controller from "../../../../controllers/clients/users.controller";
import * as uploadMiddleware from "../../../../middlewares/clients/upload.middleware";
import { permissionsMiddleware } from "../../../../middlewares/clients/permission.middleware";
const router: express.Router = express.Router();
const upload = multer();

router.patch("/update", permissionsMiddleware, controller.update);
router.get("/getDetail/:userId", controller.getDetailById);
router.patch("/updateCover", upload.single("cover"), permissionsMiddleware, uploadMiddleware.uploadSingle ,controller.updateCover);
router.patch("/updateAvatar", upload.single("avatar"), permissionsMiddleware, uploadMiddleware.uploadSingle, controller.updateAvatar);
router.get("/getAllFriends/:userId/:skipItem", controller.getAllFriends);

export default router;
