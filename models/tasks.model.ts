import mongoose from "mongoose";
import slug from "mongoose-slug-updater";
import { TASK_STATUS } from "../config/system.config";
mongoose.plugin(slug);

const tasksSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    createdBy: String,
    label: {
      type: Array,
      default: []
    },
    reminderId: {
      type: String,
      default: ""
    },
    timeStart: {
      type: Date,
      default: new Date(),
    },
    timeEnd: {
      type: Date,
      default: new Date(),
    },
    image: {
      type: String,
      default: "",
    },
    backgroundColor: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: TASK_STATUS.TODO,
    },
    slug: {
      type: String,
      slug: "title",
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    pinned: {
      type: Boolean,
      default: false
    },
    deletedAt: Date,
    updatedBy: String,
    deletedBy: String,
  },
  { timestamps: true }
);

const Tasks = mongoose.model("Tasks", tasksSchema, "tasks");
export default Tasks;
