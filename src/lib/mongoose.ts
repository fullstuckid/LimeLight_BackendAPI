/* eslint-disable no-console */
import mongoose from "mongoose";

export const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.info("MongoDB Connected!");
  } catch (error: any) {
    console.error(error);
  }
};
