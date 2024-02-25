import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../middleware/catchAsyncError";
import { successResponse } from "./responseController";
import CustomError from "../config/errorHandler";
import courseModel from "../models/course.model";

interface IUploadCourse {

}
export const uploadcourse = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body as IUploadCourse;

        courseModel.create(data);


        return successResponse(res, {
            statusCode: 200,
            message: "new course uploaded.",
            payload: {
                data
            },
        });
    } catch (error: any) {
        return next(new CustomError(400, error.message));
    }
});
export const getCourses = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courses = await courseModel.find({});
        if (!courses) {
            return new CustomError(400, "no course data found")
        }

        return successResponse(res, {
            statusCode: 200,
            message: "courses return",
            payload: {
                courses
            },
        });
    } catch (error: any) {
        return next(new CustomError(400, error.message));
    }
});