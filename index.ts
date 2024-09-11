// import
import express, { Express } from "express";
import * as dotenv from "dotenv";
import { connect } from "./config/database.config";
import * as bodyParser from "body-parser";
import { appRoutes } from "./api/v1/routes/clients/index.route";

const start = async () => {
  // app
  const app: Express = express();

  // dotenv
  dotenv.config();

  //   connect db
  await connect();
  // bodyparser
  app.use(bodyParser.json());

  // routes
  appRoutes(app);

  // port
  const port: string | number = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });
};

start();
