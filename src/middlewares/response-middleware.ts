import type { NextFunction, Request, Response } from "express";

export const ResponseMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  res.sendResponse = <T = null>(statusCode: number, options: SendResponseType<T>) => {
    const { data, message } = options;

    return res.status(statusCode || 200).json({
      status: "success",
      status_code: statusCode,
      message,
      data,
      length: Array.isArray(data) ? data.length : undefined,
    } as SendResponseType<T>);
  };

  res.sendError = (statusCode: number, message: string) => res.status(statusCode).json({
    status: "error/failed",
    status_code: statusCode,
    message,
  } as SendResponseType);

  next();
};
