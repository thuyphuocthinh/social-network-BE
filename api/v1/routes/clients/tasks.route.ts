import express, { Express } from "express";
import * as controller from "../../../../controllers/clients/tasks.controller";
const router: express.Router = express.Router();

router.post("/create", controller.createTask);
router.get("/getAllTasksByUser/:userId", controller.getAllTasksByUser);
router.get(
  "/getAllTasksDeletedByUser/:userId",
  controller.getAllTasksDeletedByUser
);
router.get("/getDetail/:taskId", controller.getTaskDetailById);
router.patch("/deleteTask/:taskId", controller.deleteTask);
router.patch("/deleteManyTask", controller.deleteManyTasks);
router.delete(
  "/deleteTaskPermanently/:taskId",
  controller.deleteTaskPermanently
);
router.patch(
  "/deleteManyTaskPermanently",
  controller.deleteManyTaskPermanently
);
router.patch("/updateTask", controller.updateTask);
router.patch("/changeStatus", controller.changeTaskStatus);
router.patch("/recoverTask/:taskId", controller.recoverOneTask);
router.patch("/recoverManyTask", controller.recoverManyTasks);
router.get("/search/:userId", controller.search);
router.patch("/detachLabel/:taskId/:labelId", controller.detachLabel);
router.patch("/attachLabel/:taskId/:labelId", controller.attachLabel);

export default router;
