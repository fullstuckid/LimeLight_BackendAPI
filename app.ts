/// <reference types="./express-env" />

import apicache from "apicache";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import type { Request, Response } from "express";
import express from "express";
import helmet from "helmet";
import http from "http";
import morgan from "morgan";
import { connectMongoDB, connectRedisDB, redisClient } from "./src/lib";
import { ResponseMiddleware } from "./src/middlewares";
import ApiRouter from "./src/routes";

dotenv.config();

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
