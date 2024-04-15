import { JwtPayload, verify } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from "express";
import { accessTokenSecret } from '../secret';
import { decode } from 'punycode';
import { redis } from '../config/redis';
import { asyncHandler } from '../utils/asyncHandler';
import CustomErrorHandler from '../utils/errorHandler';

export const isAuthenticated = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.cookies.access_token;

    if (!access_token) {
        return next(new CustomErrorHandler(400, "Please login to access this resource."));
    }

    try {
        // console.log(access_token, accessTokenSecret);

        const decoded = jwt.verify(access_token, accessTokenSecret) as JwtPayload;

        if (!decoded) {
            return next(new CustomErrorHandler(400, "Access token is not valid."));
        }

        const user = await redis.get(decoded.id);
        // console.log(user, "user");

        if (!user) {
            return next(new CustomErrorHandler(400, "User session not found in Redis. please login"));
        }

        // // Attach the decoded user information to the request for later use
        // // req.user = decoded;
        // req.user = JSON.parse(user);
        req.cookies = access_token;

        next();
    } catch (error: any) {
        return next(new CustomErrorHandler(400, "Error verifying access token."));
    }
});
