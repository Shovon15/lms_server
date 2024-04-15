import { NextFunction, Request, Response } from "express";
import courseModel from "../models/course.model";
import ResponseHandler from "../utils/responseHanlder";
import CustomErrorHandler from "../utils/errorHandler";
import { asyncHandler } from "../utils/asyncHandler";

interface IUploadCourse {

}
export const uploadcourse = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body as IUploadCourse;

        courseModel.create(data);


        // return ResponseHandler(res, {
        //     statusCode: 200,
        //     success:true,
        //     message: "new course uploaded.",
        //     payload: {
        //         data
        //     },
        // });
        return res.status(200).json(new ResponseHandler(200, { data }, "new course uploaded."));


    } catch (error: any) {
        
        if (error instanceof CustomErrorHandler) {
            return next(error);
        } else {
            return next(new CustomErrorHandler(400, error.message));
        }
    }
});
export const getCourses = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courses = await courseModel.find({});
        if (!courses) {
            return new CustomErrorHandler(400, "no course data found")
        }

        // return ResponseHandler(res, {
        //     statusCode: 200,
        //     message: "courses return",
        //     payload: {
        //         courses
        //     },
        // });

        return res.status(200).json(new ResponseHandler(200, { courses }, "courses return"));
    } catch (error: any) {

        if (error instanceof CustomErrorHandler) {
            return next(error);
        } else {
            return next(new CustomErrorHandler(400, error.message));
        }
    }
});