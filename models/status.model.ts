import mongoose from "mongoose";
import slug from "mongoose-slug-updater";
import { TASK_STATUS } from "../config/system.config";
mongoose.plugin(slug);

const statusSchema = new mongoose.Schema(
  {
    code: String,
    title: String,
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Status = mongoose.model("Status", statusSchema, "status");
export default Status;
