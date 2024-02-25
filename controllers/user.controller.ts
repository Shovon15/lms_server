import { Request, Response, NextFunction } from "express";
import { catchAsyncError } from "../middleware/catchAsyncError";
import CustomError from "../config/errorHandler";
import UserModel, { IAvatar, IUser } from "../models/user.models";
import { accessTokenSecret, activationTokenSecret, refreshTokenSecret, cloudinary } from "../secret";
import { JwtPayload, sign, verify } from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import sendMail from "../config/sendMail";
import { successResponse } from "./responseController";
import { findUserByEmail, getUserById, getUserByIdUsingRedis, uploadImage } from "../services/user.service";
import { accessTokenOptions, refreshTokenOptions, sendToken } from "../utils/jwt";
import { redis } from "../config/redis";

import bcrypt from "bcryptjs";

interface IActivationToken {
	token: string;
	activationCode: string;
}

interface IRegistrationBody {
	name: string;
	email: string;
	password: string;
	avatar?: string;
}

const createActivationToken = (user: IRegistrationBody): IActivationToken => {
	const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
	const token = sign({ activationCode, user }, activationTokenSecret, { expiresIn: "30m" });

	return { token, activationCode };
};

export const userRegister = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { name, email, password } = req.body;

		// Check if the email already exists
		const isEmailExist = await UserModel.findOne({ email });
		if (isEmailExist) {
			throw new CustomError(400, "Email already in use.");
		}

		// Generate activation token
		const user: IRegistrationBody = {
			name,
			email,
			password,
		};
		const { token, activationCode } = createActivationToken(user);
		// const data = { user: { name }, activationCode };

		// Create the user
		await UserModel.create(user);

		// Send activation email

		// await sendMail({
		// 	email: user.email,
		// 	subject: "Activate your account",
		// 	template: "activationEmail.ejs",
		// 	data,
		// });

		// Respond with success
		return successResponse(res, {
			statusCode: 201,
			message: `Check your ${user.email} to activate your account.`,
			payload: {
				activationToken: token,
			},
		});
	} catch (error: any) {
		// Handle errors appropriately
		if (error instanceof CustomError) {
			return next(error);
		} else {
			return next(new CustomError(400, error.message));
		}
	}
});

export const userDeleteDev = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
	try {
		// Delete all users
		await UserModel.deleteMany();

		// Get the count of users after deletion
		const userCount = await UserModel.countDocuments();

		// Respond with success and user count
		return successResponse(res, {
			statusCode: 200,
			message: `Deleted all users.`,
			payload: {
				userCount: userCount,
			},
		});
	} catch (error: any) {
		// Handle errors appropriately
		if (error instanceof CustomError) {
			return next(error);
		} else {
			return next(new CustomError(400, error.message));
		}
	}
});

interface IActivationRequest {
	activation_token: string;
	activation_code: string;
}
export const userActivation = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { activation_token, activation_code } = req.body as IActivationRequest;

		// // Verify the activation token
		const decodedToken = verify(activation_token, activationTokenSecret) as {
			user: IUser;
			activationCode: string;
		};

		const { user, activationCode } = decodedToken;

		if (activation_code !== activationCode) {
			throw new CustomError(400, "Invalid code");
		}
		if (!decodedToken) {
			throw new CustomError(400, "Invalid token");
		}

		const existUser = await findUserByEmail(UserModel, user.email);

		if (!existUser) {
			throw new CustomError(400, "email does not exist.");
		}

		existUser.isVerified = true;

		await existUser.save();
		return successResponse(res, {
			statusCode: 200,
			message: `account verified`,
			payload: {
				// activation_token,
				// activation_code,
				// decodedToken,
				// existUser,
				// user,
			},
		});
	} catch (error: any) {
		// Handle errors appropriately
		return next(new CustomError(400, error.message));
	}
});

interface ILoginRequest {
	email: string;
	password: string;
}
export const userLogin = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { email, password } = req.body as ILoginRequest;

		if (!email) {
			return next(new CustomError(400, "please enter email"));
		}
		if (!password) {
			return next(new CustomError(400, "Please enter password"));
		}
		let existingUser = await UserModel.findOne({ email }).select("+password");
		// let existingUser = await UserModel.findOne({ email });

		if (!existingUser) {
			return next(new CustomError(400, "Email is not found, please signup"));
		}

		const isPasswordMatched = await existingUser.comparePassword(password);

		if (!isPasswordMatched) {
			return next(new CustomError(400, "password did not matched"));
		}

		sendToken(existingUser, 200, res, "login succesful");
	} catch (error: any) {
		return next(new CustomError(400, error.message));
	}
});

export const userLogout = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
	try {
		// Clear access_token and refresh_token cookies
		const cookie_access_token = res.cookie("access_token", "", { maxAge: 1 });
		const cookie_refresh_token = res.cookie("refresh_token", "", { maxAge: 1 });

		// Get user ID from the decoded information attached to the request
		const userId = req.user?._id;
		// console.log(userId, "userId");

		// If user ID exists, delete the user session from Redis
		if (userId) {
			await redis.del(userId);
		}

		return successResponse(res, {
			statusCode: 200,
			message: `Logged out successfully.`,
			payload: {
				accessToken: "",
				user: null
			}
		});
	} catch (error: any) {
		return next(new CustomError(400, error.message));
	}
});

export const updateAccessToken = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const refresh_token = req.cookies.refresh_token as string;
		const decoded = verify(refresh_token, refreshTokenSecret) as JwtPayload;

		if (!decoded) {
			return next(new CustomError(400, "could not refesh token"));
		}

		const session = await redis.get(decoded.id);

		if (!session) {
			return next(new CustomError(400, "User session not found in Redis."));
		}
		const user = JSON.parse(session);

		const accessToken = sign({ id: user._id }, accessTokenSecret, { expiresIn: "30m" });
		const refreshToken = sign({ id: user._id }, refreshTokenSecret, { expiresIn: "30d" });

		res.cookie("access_token", accessToken, accessTokenOptions);
		res.cookie("refresh_token", refreshToken, refreshTokenOptions);

		req.user = user;

		return successResponse(res, {
			statusCode: 200,
			message: `update access token`,
			payload: {
				accessToken,
				// refresh_token,
				// decoded,
				// user,
			},
		});
	} catch (error: any) {
		return next(new CustomError(400, error.message));
	}
});

export const getUserInfo = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = req.user?._id;
		const access_token = req.cookies;

		if (!userId) {
			// Handle the case where user ID is not available in the request
			return next(new CustomError(400, "User ID not provided in the request"));
		}

		// Assuming userId is a valid MongoDB ObjectId
		// const userinfo = await getUserById(UserModel, userId);
		const userinfo = await getUserByIdUsingRedis(userId);

		if (!userinfo) {
			throw new CustomError(404, "User not found, Please login");
		}
		// const userInfo = getUserById(userId);
		// const userInfo = UserModel.findById(userId);

		return successResponse(res, {
			statusCode: 200,
			message: `user info return`,
			payload: {
				// userId,
				access_token,
				user: userinfo,
			},
		});
	} catch (error: any) {
		return next(new CustomError(400, error.message));
	}
});

interface ISocialBody {
	name: string;
	email: string;
	avatar: IAvatar;
}
export const socialAuth = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { name, email, avatar } = req.body as ISocialBody;

		const existingUser = await findUserByEmail(UserModel, email);
		let accessToken;
		let user;

		if (!existingUser) {
			const newUser = await UserModel.create({ name, email, avatar, isVerified: true });
			// ({ user, accessToken } = sendToken(newUser, 200, res, "social login successful"));
			sendToken(newUser, 200, res, "social login successful");
		} else {
			sendToken(existingUser, 200, res, "social login successful");
		}

		// return successResponse(res, {
		// 	statusCode: 200,
		// 	message: `Social login successful`,
		// 	payload: {
		// 		accessToken,
		// 		user,
		// 	},
		// });
	} catch (error: any) {
		return next(new CustomError(400, error.message));
	}
});

interface IUpdateInfo {
	name?: string;
	email?: string;
}
export const updateInfo = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { name, email } = req.body as IUpdateInfo;

		const userId = await req.user?._id;
		const user = await getUserById(UserModel, userId);

		// Check if the email and user are exist
		if (email && user) {
			// Check if the new email is already in use
			const isEmailExist = await UserModel.findOne({ email });
			if (isEmailExist) {
				throw new CustomError(400, "Email already in use.");
			}
			// If the email is not in use, update the user's email
			user.email = email;
		}
		if (name && user) {
			user.name = name;
		}

		const userWithoutSensitiveData = {
			_id: user._id,
			name: user.name,
			email: user.email,
			avatar: user.avatar,
			role: user.role,
			isVerified: user.isVerified,
			courses: user.courses,
		};

		// await redis.set(userId, JSON.stringify(user));
		await redis.set(userId, JSON.stringify(userWithoutSensitiveData) as any);

		// Perform other update operations as needed

		// Save the updated user information to the database
		await user.save();

		return successResponse(res, {
			statusCode: 200,
			message: "Update successful",
			payload: {
				// name,
				// email: user.email, // Return the updated email
				// userId,
				user,
				userWithoutSensitiveData,
			},
		});
	} catch (error: any) {
		return next(new CustomError(400, error.message));
	}
});

interface IUpdatePassword {
	oldPassword: string;
	newPassword: string;
}
export const updatePassword = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { oldPassword, newPassword } = req.body as IUpdatePassword;

		const userId = await req.user?._id;
		// const user = await getUserById(UserModel, userId,);

		const existingUser = await UserModel.findById(userId).select("password");

		if (!existingUser || existingUser?.password === undefined) {
			return next(new CustomError(400, "Invalid user"));
		}

		const isPasswordMatch = await existingUser.comparePassword(oldPassword);

		if (!isPasswordMatch) {
			return next(new CustomError(400, "old password did not match"));
		}

		existingUser.password = newPassword;

		// const userWithoutSensitiveData = {
		//     _id: user._id,
		//     name: user.name,
		//     email: user.email,
		//     avatar: user.avatar,
		//     role: user.role,
		//     isVerified: user.isVerified,
		//     courses: user.courses,
		// };

		// await redis.set(userId, JSON.stringify(user));
		// await redis.set(userId, JSON.stringify(userWithoutSensitiveData) as any);

		// Perform other update operations as needed

		// Save the updated user information to the database
		await existingUser.save();

		return successResponse(res, {
			statusCode: 200,
			message: "password Update successful",
			payload: {
				oldPassword,
				newPassword,
			},
		});
	} catch (error: any) {
		return next(new CustomError(400, error.message));
	}
});

interface IUpdateAvatar {
	avatar: string;
}
export const updateAvatar = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { avatar } = req.body as IUpdateAvatar;

		const userId = req.user?._id;

		const existingUser = await getUserByIdUsingRedis(userId);

		if (existingUser && avatar) {
			if (existingUser.avatar?.public_id) {
				await cloudinary.uploader.destroy(existingUser.avatar.public_id);
			}

			const myCloud = await uploadImage(avatar);

			existingUser.avatar = {
				public_id: myCloud.public_id,
				url: myCloud.url,
			};
			// 	// Save the updated user back to Redis
			await redis.set(userId, JSON.stringify(existingUser));

			await UserModel.findByIdAndUpdate(userId, { avatar: existingUser.avatar }, { new: true });

		}

		return successResponse(res, {
			statusCode: 200,
			message: "Avatar update successful",
			payload: {
				existingUser,
			},
		});
	} catch (error: any) {
		return next(new CustomError(400, error.message));
	}
});
