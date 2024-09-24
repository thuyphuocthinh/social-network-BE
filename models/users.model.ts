import mongoose from "mongoose";
import slug from "mongoose-slug-updater";
mongoose.plugin(slug);

const usersSchema = new mongoose.Schema(
  {
    username: String,
    email: String,
    password: String,
    roleId: String,
    avatar: {
      type: String,
      default: "https://i.pinimg.com/736x/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg"
    },
    cover: {
      type: String,
      default: "http://res.cloudinary.com/dy0m9udjz/image/upload/v1727169456/uk9vostn002odvkbq85v.jpg"
    },
    listPostId: {
      type: Array,
      default: []
    },
    listFriendId: {
      type: Array,
      default: []
    },
    listPostShareId: {
      type: Array,
      default: []
    },
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

const Users = mongoose.model("Users", usersSchema, "users");
export default Users;
