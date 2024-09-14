import express, { Express } from "express";
import * as controller from "../../../../controllers/clients/tasks.controller";
const router: express.Router = express.Router();

router.post("/create", controller.createTask);
router.get("/getAllTasksByUser/:userId", controller.getAllTasksByUser);
router.get("/getDetail/:taskId", controller.getTaskDetailById);
router.patch("/deleteTask/:taskId", controller.deleteTask);
router.patch("/deleteManyTask", controller.deleteManyTasks);
router.delete(
  "/deleteTaskPermanently/:taskId",
  controller.deleteTaskPermanently
);
router.delete(
  "/deleteManyTaskPermanently",
  controller.deleteManyTaskPermanently
);
router.patch("/updateTask", controller.updateTask);
router.patch("/changeStatus", controller.changeTaskStatus);
router.patch("/recoverTask/:taskId", controller.recoverOneTask);
router.patch("/recoverManyTask", controller.recoverManyTasks);

export default router;
