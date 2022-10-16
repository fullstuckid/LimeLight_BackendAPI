/// <reference types="./express-env" />

import dotenv from "dotenv";
import express from "express";
import type { Request, Response } from "express";
import http from "http";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import ApiRouter from "./routes";
import { ResponseMiddleware } from "./middlewares";

dotenv.config({
  path: `${process.cwd()}/${process.env.NODE_ENV === "development" ? ".env.development" : ".env.production"}`,
});

const app = express();
const server = http.createServer(app);

// Express Middlewares
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(ResponseMiddleware);

app.use("/api/v1", ApiRouter);

app.get("/", (_req: Request, res: Response) => {
  res.sendResponse(200, {
    message: "OK",
  });
});

app.use("*", (_req: Request, res: Response) => {
  res.sendError(404, "Route not found");
});

export default server;
