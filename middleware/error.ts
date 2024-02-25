import { NextFunction, Request, Response } from "express";
import CustomError from "../config/errorHandler";


export const ErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {

  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // wrong mongodb id error
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid ${err.path}`;
    err = new CustomError(400, message);
  }

  // duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err = new CustomError(400, message);
  }

  // jwt token error
  if (err.name === "JsonWebTokenError") {
    const message = `Invalid token`;
    err = new CustomError(400, message);
  }

  // token expired error
  if (err.name === "TokenExpiredError") {
    const message = `Expired token, create a new one`;
    err = new CustomError(400, message);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });

  next();
};
