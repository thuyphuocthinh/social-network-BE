import { Request, Response } from "express";
import { emptyValidation } from "../../validation/clients/emptyValidation.validation";
import { Reminder } from "../../interfaces/reminders.interface";
import Reminders from "../../models/reminders.model";
import { timeValidation } from "../../validation/clients/timeValidation.validation";
import Tasks from "../../models/tasks.model";

export const create = async (req: Request, res: Response) => {
    try {
        const result1 = emptyValidation(req, ["taskId", "createdBy", "remindedAt"]);
        if(!result1.isValid) {
            const message = result1.invalidFieldsString + " cannot be empty";
            return res.status(400).json({
                success: false,
                message: message
            });
        }
        const result2 = timeValidation(req, ["remindedAt"]);
        if(!result2.isValid) {
            const message = result1.invalidFieldsString + " must be a date";
            return res.status(400).json({
                success: false,
                message: message
            }); 
        }

        const task = await Reminders.findOne({
            taskId: req.body.taskId,
            deleted: false,
        })
        
        if(task) {
            await Reminders.updateOne({
                taskId: req.body.taskId,
                deleted: false
            }, {
                remindedAt: req.body.remindedAt
            })
        } else {
            const reminder: Reminder = {
                createdBy: req.body.createdBy,
                taskId: req.body.taskId,
                remindedAt: req.body.remindedAt
            }
            const newRecord = new Reminders(reminder);
            await newRecord.save();
            await Tasks.updateOne({
                _id: req.body.taskId
            }, {
               reminderId: newRecord.id
            })
        }

        return res.status(200).json({
            success: true,
            message: "Created reminder successfully",
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error server"
        });
    }
}

export const deleteById = async (req: Request, res: Response) => {
    try {
        if(!req.params.reminderId) {
            return res.status(400).json({
                success: false,
                message: "Please provide reminder id"
            });
        }
        const reminderId: String = req.params.reminderId;
        await Reminders.updateOne({
            _id: reminderId
        }, {
            deleted: true
        });
        return res.status(200).json({
            success: true,
            message: "Deleted reminder successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error server"
        }) 
    }
}

export const updateById = async (req: Request, res: Response) => {
    try {
        const result = emptyValidation(req, ["taskId", "remindedAt"]);
        if(!result.isValid) {
            const message = result.invalidFieldsString;
            return res.status(400).json({
                success: false,
                message: message
            });
        }
        const result2 = timeValidation(req, ["remindedAt"]);
        if(!result2.isValid) {
            const message = result2.invalidFieldsString;
            return res.status(400).json({
                success: false,
                message: message
            }); 
        }
        
        const taskId: String = req.body.taskId;
        const remindedAt: Date = req.body.remindedAt;

        await Reminders.updateOne({
            _id: taskId
        }, {
            remindedAt: remindedAt
        });

        return res.status(200).json({
            success: true,
            message: "Updated reminder successfully",
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error server"
        });
    }
}

export const remind = async (req: Request, res: Response) => {

}
