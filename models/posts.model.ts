import mongoose from "mongoose";
import slug from "mongoose-slug-updater";
mongoose.plugin(slug);

const postsSchema = new mongoose.Schema(
  {
    userId: String,
    content: String,
    like: {
        type: Number,
        default: 0
    },
    share: {
        type: Number,
        default: 0
    },
    listCommentId: [],
    status: {
      type: String,
      default: "active",
    },
    slug: {
      type: String,
      slug: "username",
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  { timestamps: true }
);

const Posts = mongoose.model("Posts", postsSchema, "posts");
export default Posts;
