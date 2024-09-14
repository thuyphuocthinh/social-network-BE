import { Request, Response } from "express";
import { AllTask, Task } from "../../interfaces/task.interface";
import { emptyValidation } from "../../validation/clients/emptyValidation.validation";
import { timeValidation } from "../../validation/clients/timeValidation.validation";
import Tasks from "../../models/tasks.model";
import Status from "../../models/status.model";

export const getAllTasksByUser = async (req: Request, res: Response) => {
  try {
    if (req.params.userId) {
      const userId: string = req.params.userId;
      const statusList = await Status.find({
        deleted: false,
      });

      const tasksList = await Tasks.find({
        deleted: false,
        createdBy: userId,
      });

      const tasks: AllTask[] = [];

      for (const status of statusList) {
        const tasksByStatus: AllTask = {
          status: undefined,
          list: [],
        };
        tasksByStatus.status = status.title;
        for (const task of tasksList) {
          if (task.status === status.code && !task.deleted) {
            const taskReturn = {
              id: task.id,
              title: task.title,
              content: task.content,
              createdBy: task.createdBy,
              label: task.label,
              timeStart: task.timeStart,
              timeEnd: task.timeEnd,
              image: task.image,
              backgroundColor: task.backgroundColor,
              status: task.status,
              createdAt: task.createdAt,
              deleted: task.deleted,
            };
            tasksByStatus.list.push(taskReturn);
          }
        }
        tasks.push(tasksByStatus);
      }

      return res.status(200).json({
        data: tasks,
      });
    } else {
      return res.status(400).json({
        message: "Please provide user id",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Error server",
    });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    if (req.body) {
      const validation1 = emptyValidation(req, [
        "title",
        "content",
        "status",
        "timeEnd",
        "timeStart",
      ]);
      if (!validation1.isValid) {
        return res.status(400).json({
          message: validation1.invalidFieldsString + " cannot be empty",
        });
      }
      const validation2 = timeValidation(req, ["timeStart", "timeEnd"]);
      if (!validation2.isValid) {
        return res.status(400).json({
          message: validation2.invalidFieldsString + " datatype must be Date",
        });
      }
      const newTask: Task = {
        title: req.body.title,
        content: req.body.content,
        createdBy: req.body.createdBy,
        label: req.body.label,
        timeStart: new Date(req.body.timeStart),
        timeEnd: new Date(req.body.timeEnd),
        image: req.body.image,
        backgroundColor: req.body.backgroundColor,
        status: req.body.status,
      };
      const newRecord = new Tasks(newTask);
      await newRecord.save();
      return res.status(200).json({
        message: "Created new task successfully",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Error server",
    });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    if (req.params.taskId) {
      const taskId: string = req.params.taskId;
      await Tasks.updateOne(
        {
          _id: taskId,
        },
        {
          deleted: true,
        }
      );
      return res.status(200).json({
        message: "Deleted task successfully",
      });
    } else {
      return res.status(400).json({
        message: "Please provide taskId",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Deleted task successfully",
    });
  }
};

export const deleteManyTasks = async (req: Request, res: Response) => {
  try {
    if (req.body.listTaskId) {
      const listTaskId: string[] = req.body.listTaskId;
      for (const taskId of listTaskId) {
        await Tasks.updateOne(
          {
            _id: taskId,
          },
          {
            deleted: true,
          }
        );
      }
      return res.status(400).json({
        message: "Deleted tasks successfully",
      });
    } else {
      return res.status(400).json({
        message: "Please provide list of taskId",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Error server",
    });
  }
};

export const deleteTaskPermanently = async (req: Request, res: Response) => {
  try {
    if (req.params.taskId) {
      const taskId: string = req.params.taskId;
      await Tasks.deleteOne({
        _id: taskId,
      });
      return res.status(400).json({
        message: "Deleted task permanently successfully",
      });
    } else {
      return res.status(400).json({
        message: "Please provide taskId",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Error server",
    });
  }
};

export const deleteManyTaskPermanently = async (
  req: Request,
  res: Response
) => {
  try {
    if (req.body.listTaskId) {
      const listTaskId: string[] = req.body.listTaskId;
      for (const taskId of listTaskId) {
        await Tasks.deleteOne({
          _id: taskId,
        });
      }
      return res.status(400).json({
        message: "Deleted many task permanently successfully",
      });
    } else {
      return res.status(400).json({
        message: "Please provide list of taskId",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Error server",
    });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    if (req.body.taskUpdate) {
      const taskId: string = req.body.taskUpdate.taskId;
      await Tasks.updateOne(
        {
          _id: taskId,
        },
        req.body
      );
      return res.status(400).json({
        message: "Updated tasks successfully",
      });
    } else {
      return res.status(400).json({
        message: "Please provide task update info",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Error server",
    });
  }
};

export const changeTaskStatus = async (req: Request, res: Response) => {
  try {
    console.log(req.body.taskUpdate);
    if (req.body.taskUpdate) {
      const taskId: string = req.body.taskUpdate.taskId;
      const newStatusCode: string = req.body.taskUpdate.newStatusCode;
      await Tasks.updateOne(
        {
          _id: taskId,
        },
        {
          status: newStatusCode,
        }
      );
      return res.status(200).json({
        message: "Changed task status successfully",
      });
    } else {
      return res.status(400).json({
        message: "Please provide task update info",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: " Error server",
    });
  }
};

export const recoverOneTask = async (req: Request, res: Response) => {
  try {
    if (req.params.taskId) {
      const taskId: string = req.params.taskId;
      const task = await Tasks.findOne({
        _id: taskId,
        deleted: true,
      });
      if (task) {
        await Tasks.updateOne(
          {
            _id: taskId,
          },
          {
            deleted: false,
          }
        );
        return res.status(200).json({
          message: "Recovered task successfully",
        });
      } else {
        return res.status(400).json({
          message: "Task is not deleted yet or does not exist",
        });
      }
    } else {
      return res.status(400).json({
        message: "Please provide taskId",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Error server",
    });
  }
};

export const recoverManyTasks = async (req: Request, res: Response) => {
  try {
    if (req.body.listTaskId) {
      const listTaskId: string[] = req.body.listTaskId;
      for (const taskId of listTaskId) {
        const task = await Tasks.findOne({
          _id: taskId,
          deleted: true,
        });
        if (task) {
          await Tasks.updateOne(
            {
              _id: taskId,
            },
            {
              deleted: false,
            }
          );
        }
      }
      return res.status(200).json({
        message: "Recovered many tasks successfully",
      });
    } else {
      return res.status(400).json({
        message: "Please provide list of taskId",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Error server",
    });
  }
};

export const getTaskDetailById = async (req: Request, res: Response) => {
  try {
    if (req.params.taskId) {
      const taskId: string = req.params.taskId;
      const task = await Tasks.findOne({
        _id: taskId,
        deleted: false,
      });
      return res.status(200).json({
        data: {
          id: task.id,
          title: task.title,
          content: task.content,
          createdBy: task.createdBy,
          label: task.label,
          timeStart: task.timeStart,
          timeEnd: task.timeEnd,
          image: task.image,
          backgroundColor: task.backgroundColor,
          status: task.status,
          createdAt: task.createdAt,
          deleted: task.deleted,
        },
      });
    } else {
      return res.status(400).json({
        message: "Please provide taskId",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Error server",
    });
  }
};
