// import
import express, { Express } from "express";
import cors from "cors";
import http from "http";
import cookieParser from "cookie-parser";
import * as dotenv from "dotenv";
import * as bodyParser from "body-parser";
import * as amqp from "amqplib";
import { connect } from "./config/database.config";
import { appRoutes } from "./api/v1/routes/clients/index.route";
import { startProducer } from "./helpers/rabbitmqSchedule";
import WebSocket from "ws"; // Import WebSocket

const app: Express = express();

const start = async () => {
  // dotenv
  dotenv.config();

  // connect db
  await connect();

  // bodyparser
  app.use(bodyParser.json());
  app.use(express.urlencoded({ extended: true }));

  // cookie-parser
  app.use(cookieParser("TPT"));

  // cors
  app.use(
    cors({
      origin: "http://localhost:5173", // No trailing slash
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: true, // If you need to send cookies or other credentials
      allowedHeaders: [
        "Authorization",
        "Content-Type",
        "Cache-Control",
      ], // Ensure 'Authorization' is allowed
    })
  );

  // routes
  appRoutes(app);

  // Create HTTP server and attach WebSocket
  const server = http.createServer(app);
  const wss = new WebSocket.Server({ server });

  // WebSocket connection handling
  wss.on("connection", (ws: any) => {
    console.log("A user is connected.");

    ws.on("message", (message: any) => {
      const { userId } = JSON.parse(message);
      ws["userId"] = userId; // Store userId in the WebSocket instance
      console.log("User ID from client: ", ws["userId"]);
      startProducer(userId);
      // Start the producer with the userId
      startProducer(ws["userId"]);
    });

    ws.on("close", () => {
      console.log("User disconnected.");
    });

    // Example of sending a message back to the client
    ws.send(JSON.stringify({ message: "Welcome to the WebSocket server!" }));
  });

  /*** Websocket */
  // Initialize the producer with an empty userId
  // You may also want to update this logic depending on your specific needs
  /** */

  /** port */
  const port: string | number = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });
  /** */
};

start();
