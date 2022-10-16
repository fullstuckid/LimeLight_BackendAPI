/// <reference types="./express-env" />

import dotenv from "dotenv";
import express from "express";
import type { Request, Response } from "express";
import http from "http";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import apicache from "apicache";
import ApiRouter from "./routes";
import { ResponseMiddleware } from "./middlewares";
import { connectMongoDB, connectRedisDB, redisClient } from "./lib";

dotenv.config({
  path: `${process.cwd()}/${process.env.NODE_ENV === "development" ? ".env.development" : ".env.production"}`,
});

const app = express();
const server = http.createServer(app);
const cacheWithRedis = apicache.options({
  redisClient,
  defaultDuration: "30 seconds",
  trackPerformance: false,
}).middleware;

connectMongoDB();
connectRedisDB();

// Express Middlewares
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(ResponseMiddleware);

app.use("/api/v1", cacheWithRedis(), ApiRouter);

app.use("*", (_req: Request, res: Response) => {
  res.sendError(404, "Route not found");
});

export default server;
