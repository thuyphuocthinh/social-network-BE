// import
import express, { Express } from "express";
import * as dotenv from "dotenv";
import { connect } from "./config/database.config";
import * as bodyParser from "body-parser";
import { appRoutes } from "./api/v1/routes/clients/index.route";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import {Server} from 'socket.io';
import * as schedule from "./helpers/schedule";

const app: Express = express();
const server = http.createServer(app);
// socketio
const io = new Server(server, {
  transports: ['polling'],
  cors: {
    origin: 'http://localhost:5173', // No trailing slash
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // If you need to send cookies or other credentials
    allowedHeaders: ['Authorization', 'Content-Type', 'Cache-Control'], // Ensure 'Authorization' is allowed
  }
})

const start = async () => {  
  // dotenv
  dotenv.config();

  //   connect db
  await connect();

  // bodyparser
  app.use(bodyParser.json());
  app.use(express.urlencoded({extended: true}));

  // cookie-parser
  app.use(cookieParser("TPT"));

  // cors
  app.use(cors({
    origin: 'http://localhost:5173', // No trailing slash
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // If you need to send cookies or other credentials
    allowedHeaders: ['Authorization', 'Content-Type', 'Cache-Control'], // Ensure 'Authorization' is allowed
  }));

  // routes
  appRoutes(app);

  io.once("connection", (socket) => {
    console.log("A user is connected: ", socket.id);
    socket.on("registerUser", (data) => {
      socket["userId"] = data;
      console.log("userId from client: ", socket["userId"]);
      schedule.getListTaskReminded(socket["userId"]);
    })
    socket.on("addReminder", data => {
      const taskId: string = data.taskId;
      const userId: string = data.userId;
      schedule.addReminder(taskId, userId);
    });
    socket.on("deleteReminder", data => {
      const taskId: string = data.taskId;
      const userId: string = data.userId;
      schedule.deleteReminder(taskId, userId);
    });
    socket.on("stop_remind_event", () => {
      schedule.stopReminding();
    })
  })


  // port
  const port: string | number = process.env.PORT || 5000;
  server.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });
};

start();

export {io};