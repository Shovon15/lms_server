import { Response } from "express";

export const errorResponse = (res: Response, { statusCode = 500, message = "Internal server error" }) => {
    return res.status(statusCode).json({ success: false, message: message });
};

export const successResponse = (res: Response, { statusCode = 200, message = "success", payload = {} }) => {
    return res.status(statusCode).json({ success: true, statusCode, message, payload });
};
