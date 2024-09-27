import { Request, Response } from "express";
import { AllTask, Task } from "../../interfaces/task.interface";
import { emptyValidation } from "../../validation/clients/emptyValidation.validation";
import { timeValidation } from "../../validation/clients/timeValidation.validation";
import Tasks from "../../models/tasks.model";
import Status from "../../models/status.model";
import { searchHelper } from "../../helpers/searchHelper";
import Labels from "../../models/labels.model";
import Reminders from "../../models/reminders.model";
import moment from "moment";

export const getAllTasksByUser = async (req: Request, res: Response) => {
  try {
    const userId: string | undefined = req.params.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Please provide user id",
      });
    }

    // Fetch statuses and tasks concurrently
    const [statusList, tasksList] = await Promise.all([
      Status.find({ deleted: false }),
      Tasks.find({ deleted: false, createdBy: userId }).sort({  pinned: -1, createdAt: "desc" }),
    ]);

    const tasks: AllTask[] = await Promise.all(
      statusList.map(async (status) => {
        const tasksByStatus: AllTask = {
          status: status.title,
          statusCode: status.code,
          list: [],
        };

        const filteredTasks = tasksList.filter(
          (task) => task.status === status.code && !task.deleted
        );

        // Fetch label titles concurrently for each task
        tasksByStatus.list = await Promise.all(
          filteredTasks.map(async (task) => {
            const labelTitles = await Promise.all(
              task.label.map(async (labelId) => {
                if(labelId) {
                  const labelItem = await Labels.findOne({ _id: labelId, deleted: false });
                  return labelItem?.title || "Unknown Label"; // Handle label not found
                }
              })
            );

            let reminder: any;
            if(task.reminderId) {
              reminder = await Reminders.findOne({
                _id: task.reminderId,
                deleted: false
              }) 
            }

            return {
              id: task.id,
              title: task.title,
              content: task.content,
              createdBy: task.createdBy,
              label: task.label,
              labelTitle: labelTitles,
              remindedAtString: reminder ? moment(reminder.remindedAt).format("DD/MM/YYYY hh:mm A") : "",
              remindedAtDate: reminder,
              timeStart: task.timeStart,
              timeEnd: task.timeEnd,
              image: task.image,
              backgroundColor: task.backgroundColor,
              status: task.status,
              createdAt: task.createdAt,
              deleted: task.deleted,
              reminderId: reminder ? reminder.id : "",
              pinned: task.pinned ? task.pinned : false
            };
          })
        );

        return tasksByStatus;
      })
    );

    return res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getAllTasksDeletedByUser = async (req: Request, res: Response) => {
  try {
    if (req.params.userId) {
      const userId: string = req.params.userId;

      const tasks = [];

      const tasksList = await Tasks.find({
        deleted: true,
        createdBy: userId,
      });

      for (const task of tasksList) {
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
        tasks.push(taskReturn);
      }

      return res.status(200).json({
        success: true,
        data: tasks,
      });
    } else {
      return res.status(200).json({
        success: false,
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
        return res.status(200).json({
          success: false,
          message: validation1.invalidFieldsString + " cannot be empty",
        });
      }
      const validation2 = timeValidation(req, ["timeStart", "timeEnd"]);
      if (!validation2.isValid) {
        return res.status(200).json({
          success: false,
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
        success: true,
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
        success: true,
        message: "Deleted task successfully",
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "Please provide taskId",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(200).json({
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
      return res.status(200).json({
        success: true,
        message: "Deleted tasks successfully",
      });
    } else {
      return res.status(200).json({
        success: false,
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
      return res.status(200).json({
        success: true,
        message: "Deleted task permanently successfully",
      });
    } else {
      return res.status(200).json({
        success: false,
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
      return res.status(200).json({
        success: true,
        message: "Deleted many task permanently successfully",
      });
    } else {
      return res.status(200).json({
        success: false,
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
    if (req.body) {
      const taskId: string = req.body.id;
      req.body.label = req.body.label.split(",");
      if(req.body.label[0] === '') req.body.label = [];
      await Tasks.updateOne(
        {
          _id: taskId,
        },
        req.body
      );
      return res.status(200).json({
        success: true,
        message: "Updated tasks successfully",
      });
    } else {
      return res.status(200).json({
        success: false,
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
    if (req.body.taskUpdate) {
      const taskId: string = req.body.taskUpdate.taskId;
      const newStatusCode: string = req.body.taskUpdate.newStatusCode;
      await Tasks.updateOne(
        {
          _id: taskId,
          deleted: false,
        },
        {
          status: newStatusCode,
        }
      );
      return res.status(200).json({
        success: true,
        message: "Changed task status successfully",
      });
    } else {
      return res.status(200).json({
        success: false,
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
          success: true,
          message: "Recovered task successfully",
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Task is not deleted yet or does not exist",
        });
      }
    } else {
      return res.status(200).json({
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
    if (req.body) {
      const listTaskId: string[] = req.body;
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
        success: true,
        message: "Recovered many tasks successfully",
      });
    } else {
      return res.status(200).json({
        success: false,
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
      });
      return res.status(200).json({
        success: true,
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
        success: false,
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

export const search = async (req: Request, res: Response) => {
  try {
    const userId: string | undefined = req.params.userId;

    if (!userId) {
      return res.status(400).json({ success: false, message: "Please provide user ID" });
    }

    const keyword: string | any = req.query.keyword || "";
    const regex: RegExp = searchHelper(keyword);

    // Use $or to allow searching in either title or content
    const tasks = await Tasks.find({
      createdBy: userId,
      deleted: false,
      $or: [
        { title: regex },
        { content: regex },
      ],
    });

    // Fetch label titles concurrently
    const tasksList = await Promise.all(
      tasks.map(async (task) => {
        const labelTitles = await Promise.all(
          task.label.map(async (labelId) => {
            const labelItem = await Labels.findOne({ _id: labelId, deleted: false });
            return labelItem?.title || "Unknown Label"; // Handle missing label gracefully
          })
        );

        return {
          id: task.id,
          title: task.title,
          content: task.content,
          createdBy: task.createdBy,
          label: task.label,
          labelTitle: labelTitles,
          timeStart: task.timeStart,
          timeEnd: task.timeEnd,
          image: task.image,
          backgroundColor: task.backgroundColor,
          status: task.status,
          createdAt: task.createdAt,
          deleted: task.deleted,
        };
      })
    );

    return res.status(200).json({ success: true, data: tasksList });
  } catch (error) {
    console.error("Error in search: ", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const detachLabel = async (req: Request, res: Response) => {
  try {
    if(req.params.labelId && req.params.taskId) {
      const labelId: string = req.params.labelId;
      const taskId: string = req.params.taskId;
      // check exist
      const label = await Labels.findOne({
        _id: labelId,
        deleted: false,
      })
      if(!label) {
        return res.status(400).json({
          success: false,
          message: "Label does not exist"
        })
      }
      const task = await Tasks.findOne({
        _id: taskId,
        deleted: false
      })
      if(!task) {
        return res.status(400).json({
          success: false,
          message: "Task does not exist"
        })
      }
      const findLabelInTask = task.label.includes(labelId);
      const findTaskInLabel = label.tasks.includes(taskId);
      if(findLabelInTask && findTaskInLabel) {
        // exist => detach
        await Tasks.updateOne({
          _id: taskId
        }, {
          $pull: {label: labelId}
        })
        await Labels.updateOne({
          _id: labelId
        }, {
          $pull: {tasks: taskId}
        })
        return res.status(200).json({
          success: true,
          message: "Detached label successfully"
        })
        
      } else {
        // not exist => error
        return res.status(400).json({
          success: false,
          message: "Task is not attached label"
        })
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Please provide taskId, labelId"
      })
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error server"
    })
  }
}

export const attachLabel = async (req: Request, res: Response) => {
  try {
    if(req.params.labelId && req.params.taskId) {
      const labelId: string = req.params.labelId;
      const taskId: string = req.params.taskId;
      // check exist
      const label = await Labels.findOne({
        _id: labelId,
        deleted: false,
      })
      if(!label) {
        return res.status(400).json({
          success: false,
          message: "Label does not exist"
        })
      }
      const task = await Tasks.findOne({
        _id: taskId,
        deleted: false
      })
      if(!task) {
        return res.status(400).json({
          success: false,
          message: "Task does not exist"
        })
      }
      const findLabelInTask = task.label.includes(labelId);
      const findTaskInLabel = label.tasks.includes(taskId);
      if(findLabelInTask && findTaskInLabel) {
        // exist => error
        return res.status(400).json({
          success: false,
          message: "Task already attached label"
        })
      } else {
        // not exist => attach
        await Tasks.updateOne({
          _id: taskId
        }, {
          $push: {label: labelId}
        })
        await Labels.updateOne({
          _id: labelId
        }, {
          $push: {tasks: taskId}
        })
        return res.status(200).json({
          success: true,
          message: "Attached label successfully"
        })
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Please provide taskId, labelId"
      })
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error server"
    })
  }
}

export const getTasksReminded = async (req: Request, res: Response) => {
  try {
    const userId: string = req.params.userId;
    if(!userId) {
      return res.status(400).json({
        message: "Please provide user id"
      });
    }
    
    const tasksReminded = await Tasks.find({
      deleted: false,
      reminderId: {$exists: true, $ne: ""},
      createdBy: userId
    })

    const tasksRemindedReturn = await Promise.all(tasksReminded.map(async (task) => {
      const labelTitles = await Promise.all(
        task.label.map(async (labelId) => {
          if(labelId) {
            const labelItem = await Labels.findOne({ _id: labelId, deleted: false });
            return labelItem?.title || "Unknown Label"; // Handle label not found
          }
        })
      );

      let reminder: any;
      if(task.reminderId) {
        reminder = await Reminders.findOne({
          _id: task.reminderId,
          deleted: false
        }) 
      }

      return {
        id: task.id,
        title: task.title,
        content: task.content,
        createdBy: task.createdBy,
        label: task.label,
        labelTitle: labelTitles,
        remindedAtString: reminder ? moment(reminder.remindedAt).format("DD/MM/YYYY, hh:mm A") : "",
        remindedAtDate: reminder,
        timeStart: task.timeStart,
        timeEnd: task.timeEnd,
        image: task.image,
        backgroundColor: task.backgroundColor,
        status: task.status,
        createdAt: task.createdAt,
        deleted: task.deleted,
        reminderId: reminder ? reminder.id : ""
      };
    }))

    return res.status(200).json({
      success: true,
      data: tasksRemindedReturn
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error server"
    });
  }
}

export const pinTask = async (req: Request, res: Response) => {
  try {
    const taskId: string = req.params.taskId;
    if(!taskId) {
      return res.status(400).json({
        success: false,
        message: "Please provide task id"
      });
    }

    await Tasks.updateOne({_id: taskId, deleted: false}, {
      pinned: true
    });

    return res.status(200).json({
      success: true,
      message: "Pinned task successfully"
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error"
    })
  }
}

export const unpinTask = async (req: Request, res: Response) => {
  try {
    const taskId: string = req.params.taskId;
    if(!taskId) {
      return res.status(400).json({
        success: false,
        message: "Please provide task id"
      });
    }

    await Tasks.updateOne({_id: taskId, deleted: false}, {
      pinned: false
    });

    return res.status(200).json({
      success: true,
      message: "Unpinned task successfully"
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error"
    })
  }
}