import mongoose from "mongoose";
import slug from "mongoose-slug-updater";
mongoose.plugin(slug);

const usersSchema = new mongoose.Schema(
  {
    username: String,
    email: String,
    password: String,
    roleId: String,
    avatar: String,
    status: {
      type: String,
      default: "active",
    },
    slug: {
      type: String,
      slug: "fullName",
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  { timestamps: true }
);

const Users = mongoose.model("Users", usersSchema, "users");
export default Users;
