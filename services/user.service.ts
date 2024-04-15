import { Response } from 'express';
import mongoose, { Model, Document, model } from 'mongoose';
// import CustomError from "../config/errorHandler";
// import UserModel, { IUser, userSchema } from '../models/user.models';
// import { successResponse } from '../controllers/responseController';
import { redis } from '../config/redis';
import { IUser } from '../models/user.models';
import { cloudinary } from '../secret';
import CustomErrorHandler from '../utils/errorHandler';

// export const getUserByEmail = async <T extends Document>(Model: Model<T>, email: string, options = {}): Promise<T> => {
//     try {
//         const item = await Model.findOne({ email }, options);

//         if (!item) throw new CustomError(404, `${Model.modelName} does not exist with this email`);
//         return item;
//     } catch (error) {
//         if (error instanceof mongoose.Error) {
//             throw new CustomError(400, 'Invalid email');
//         }
//         throw error;
//     }
// };

// export const getUserByEmail = async <T extends Document>(Model: Model<T>, email: string, options = {}): Promise<T> => {
//     try {
//         const user = await Model.findOne({ email }, options);

//         if (!user) {
//             throw new CustomError(404, `${Model.modelName} not found with email: ${email}`);
//         }

//         return user;
//     } catch (error) {
//         if (error instanceof mongoose.Error) {
//             throw new CustomError(400, 'Invalid email or database error');
//         }

//         throw error;
//     }
// };




export const getUserById = async <T extends Document>(Model: Model<T>, id: string,): Promise<T> => {
    try {
        const user = await Model.findById(id);

        if (!user) {
            throw new CustomErrorHandler(404, `User does not exist with this id`);
        }

        return user;

    } catch (error: any) {
        throw new CustomErrorHandler(400, `Invalid id`);
    }
};

export const getUserByIdUsingRedis = async (id: string,) => {
    try {
        const userJson = await redis.get(id);

        if (userJson) {
            const user = JSON.parse(userJson)
            return user;
        }

    } catch (error: any) {
        throw new CustomErrorHandler(400, `Invalid id`);
    }
};






export const findUserByEmail = async (model: Model<IUser & Document>, email: string) => {
    try {
        const user = await model.findOne({ email });

        // if (!user) {
        //     throw new Error('User not found');
        // }

        return user;
    } catch (error: any) {

        throw new CustomErrorHandler(400, `${error.message}`);
    }
};


export async function uploadImage(avatar: string) {
    // const avatar = "../../lms-server/public/user-default2.jpg"
    try {
        const imageUpload = await cloudinary.uploader.upload(avatar, {
            folder: "avatar",
            width: 150,
        });
        console.log(imageUpload, "image upload");
        return imageUpload;
    } catch (error) {
        console.error("Error uploading image:", error);
        throw new CustomErrorHandler(400, "error upload image")
        // throw error; // Rethrow the error to handle it elsewhere if needed
    }
}