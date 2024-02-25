import { Response } from "express";
import { IUser } from "../models/user.models";
import { accessTokenExpireTime, nodeEnv, refreshTokenExpireTime } from "../secret";
import { sign } from "jsonwebtoken";
import { redis } from "../config/redis";
import { successResponse } from "../controllers/responseController";

interface ITokenOptions {
    expires: Date;
    maxAge: number;
    httpOnly: boolean;
    sameSite: "lax" | "strict" | "none" | undefined;
    secure?: boolean;
}
// ------------
if (accessTokenExpireTime === undefined) {
    throw new Error("ACCESS_TOKEN_EXPIRE environment variable is not defined");
}
if (refreshTokenExpireTime === undefined) {
    throw new Error("REFRESH_TOKEN_EXPIRE environment variable is not defined");
}

const accessTokenExpire: number = parseInt(accessTokenExpireTime, 10); //   minutes
const refreshTokenExpire: number = parseInt(refreshTokenExpireTime, 10); //  days


export const accessTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + accessTokenExpire * 60 * 1000), // minutes
    maxAge: accessTokenExpire * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "lax",
};

export const refreshTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000), // day * hour * minute * second * milisecond
    maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "lax",
};

export const sendToken = (user: IUser, statusCode: number, res: Response, message: string) => {


    const accessToken = user.SignAccessToken();
    const refreshToken = user.SignRefreshToken();

    const userWithoutSensitiveData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
        courses: user.courses,
    };

    //upload seassion to redis
    redis.set(user._id, JSON.stringify(userWithoutSensitiveData) as any);

    if (nodeEnv === "production") {
        accessTokenOptions.secure = true;
    }

    res.cookie("access_token", accessToken, accessTokenOptions);
    res.cookie("refresh_token", refreshToken, refreshTokenOptions);

    // res.status(statusCode).json({
    //     success: true,

    // });

    return successResponse(res, {
        statusCode,
        message,
        payload: {
            accessToken,
            user: userWithoutSensitiveData,
            // refreshToken,
        }
    });
    // return {
    //     user,
    //     accessToken,
    //     refreshToken
    // }
};
