export enum STATUS {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export enum ROLE {
  USER = "user",
  ADMIN = "admin",
}

export interface User {
  email: string;
  password: string;
  username: string;
  roleId: string;
  avatar?: string;
}

export enum TASK_STATUS {
  TODO = "todo",
  PROGRESS = "progress",
  DONE = "done",
}

export const SYSTEM = {
  API_V1: "/api/v1",
};
