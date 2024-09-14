import { Request, Response } from "express";
import Status from "../../models/status.model";

export const getListTaskStatus = async (req: Request, res: Response) => {
  try {
    const listTaskStatus = await Status.find({
      deleted: false,
    });
    res.status(200).json({
      data: listTaskStatus,
    });
  } catch (error) {
    console.log(error);
    res.json(400).json({
      message: "Error server",
    });
  }
};
