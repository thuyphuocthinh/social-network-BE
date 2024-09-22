// import
import express, { Express } from "express";
import * as dotenv from "dotenv";
import { connect } from "./config/database.config";
import * as bodyParser from "body-parser";
import { appRoutes } from "./api/v1/routes/clients/index.route";
import cors from "cors";
import cookieParser from "cookie-parser";

const start = async () => {
  // app
  const app: Express = express();

  // dotenv
  dotenv.config();

  //   connect db
  await connect();

  // bodyparser
  app.use(bodyParser.json());

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

  // port
  const port: string | number = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });
};

start();
