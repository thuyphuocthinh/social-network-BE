import mongoose from "mongoose";
import slug from "mongoose-slug-updater";
mongoose.plugin(slug);

const labelsSchema = new mongoose.Schema(
  {
    title: String,
    createdBy: String,
    tasks: {
      type: Array,
      default: []
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  { timestamps: true }
);

const Labels = mongoose.model("Labels", labelsSchema, "labels");
export default Labels;
