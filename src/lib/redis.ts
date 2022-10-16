/* eslint-disable no-console */
import { createClient } from "redis";

export const redisClient = createClient({
  url: "redis://127.0.0.1:6379",
});

export const connectRedisDB = async () => {
  try {
    await redisClient.connect();
    console.log("Redis Connected!");
  } catch (error) {
    console.error(`Redis error: ${error}`);
  }
};
