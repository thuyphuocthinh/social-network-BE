import mongoose from "mongoose";
import slug from "mongoose-slug-updater";
mongoose.plugin(slug);

const reminders = new mongoose.Schema(
  {
    taskId: String,
    remindedAt: Date,
    createdBy: String,
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
    updatedBy: String,
    deletedBy: String,
  },
  { timestamps: true }
);

const Reminders = mongoose.model("Reminders", reminders, "reminders");
export default Reminders;
