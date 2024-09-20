import { Request, Response } from "express";
import Labels from "../../models/labels.model";
import Tasks from "../../models/tasks.model";

export const getListLabels = async (req: Request, res: Response) => {
    try {
        if(req.params.userId) {
            const labels = await Labels.find({deleted: false, createdBy: req.params.userId});
            return res.status(200).json({
                success: true,
                data: labels,
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Please provide user id"
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error server"
        });
    }
}

export const createLabel = async (req: Request, res: Response) => {
    try {
        if(req.body.title && req.body.createdBy) {
            const newRecord = new Labels({title: req.body.title, createdBy: req.body.createdBy});
            await newRecord.save();
            return res.status(200).json({
                success: true,
                message: "Created new label successfully"
            })
        } else {
            return res.status(400).json({
                success: false,
                message: "Please provide title"
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error server"
        });
    }
}

export const updateLabelTitle = async (req: Request, res: Response) => {
    try {
        if(req.body.labelUpdate) {
            const labelId: string = req.body.labelUpdate.labelId;
            const newTitle: string = req.body.labelUpdate.newTitle;
            if(!labelId) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide label id"
                })
            }
            if(!newTitle) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide new label title"
                })
            }
            await Labels.updateOne({
                _id: labelId
            }, {
                title: newTitle
            });
            return res.status(200).json({
                success: true,
                message: "Updated label successfully"
            })
        } else {
            return res.status(400).json({
                success: false,
                message: "Please provide label update info"
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error server"
        });
    }
}

export const deleteLabel = async (req: Request, res: Response) => {
    try {
        if(req.params.labelId) {
            const labelId: string = req.params.labelId;
            const label = await Labels.findOne({
                _id: labelId,
                deleted: false
            })

            const tasksByLabel = label.tasks;
            if(tasksByLabel.length > 0) {
                for (const taskId of label.tasks) {
                    await Tasks.updateOne({
                        _id: taskId
                    }, {
                        $pull: {label: labelId}
                    })
                }
            }
            await Labels.updateOne({
                _id: labelId
            }, {
                deleted: true
            })
            return res.status(200).json({
                success: true,
                message: "Deleted label successfully"
            })
        } else {
            return res.status(400).json({
                success: false,
                message: "Please provide label Id"
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error server"
        });
    }
}

export const getLabelById = async (req: Request, res: Response) => {
    try {
      const labelId: string | undefined = req.params.labelId;
  
      if (!labelId) {
        return res.status(400).json({
          success: false,
          message: "Please provide label ID",
        });
      }
  
      // Fetch label by ID
      const label = await Labels.findOne({
        _id: labelId,
        deleted: false,
      });
  
      if (!label) {
        return res.status(404).json({
          success: false,
          message: "Label not found",
        });
      }
  
      // Fetch tasks concurrently
      const taskList = await Promise.all(
        label.tasks.map(async (taskId) => {
          const task = await Tasks.findOne({ _id: taskId, deleted: false });
          if (task) {
            const labelTitles = await Promise.all(
              task.label.map(async (labelId) => {
                const labelItem = await Labels.findOne({ _id: labelId, deleted: false });
                return labelItem?.title || "Unknown Label"; // Handle label not found
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
          }
          return null; // Filter out null values later
        })
      );
  
      // Filter out any null values in the task list
      const validTasks = taskList.filter((task) => task !== null);
  
      const data = {
        label,
        taskList: validTasks,
      };
  
      return res.status(200).json({
        success: true,
        data: data,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
};
  