import mongoose, { Schema, Document, model, models, Model } from 'mongoose';
import bcrypt from "bcryptjs";
import { idText } from 'typescript';
import { accessTokenExpireTime, accessTokenSecret, refreshTokenSecret } from '../secret';
import { sign } from 'jsonwebtoken';

export interface IAvatar {
    public_id: string;
    url: string;
}

interface ICourse {
    courseId: string;
}

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    avatar: IAvatar;
    role: string;
    isVerified: boolean;
    courses: ICourse[];
    comparePassword: (password: string) => Promise<boolean>;
    SignAccessToken: () => string;
    SignRefreshToken: () => string;
}

const userSchema: Schema<IUser> = new Schema({
    name: {
        type: String,
        required: [true, 'name is required']
    },
    email: {
        type: String,
        required: [true, "email is required"],
        trim: true,
        unique: true,
        lowercase: true,
        validate: {
            validator: function (value: string) {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value);
            },
            message: "Please enter a valid email",
        },
    },
    password: {
        type: String,
        // required: [true, "password is required"],
        trim: true,
        minLength: [6, "password should be minimum 6 charectures"],
        select: false,

    },
    avatar: {
        public_id: String,
        url: String,
    },
    role: {
        type: String,
        default: "user",
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    courses: [
        {
            courseId: String,
        }
    ]
}, { timestamps: true });


// Pre-save middleware to hash the password before saving to the database
userSchema.pre<IUser>('save', async function (next) {
    try {
        // Check if the password field exists and if it's modified (or new)
        if (this.password && this.isModified('password')) {
            // Generate a salt and hash the password
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }

         next();
    } catch (error: any) {
        return next(error);
    }
});

//signin access token
// userSchema.methods.SignAccessToken = function () {
//     return sign({ id: this._id }, accessTokenSecret || "", {
//         expiresIn: ,
//     });
// }

// const accessTokenSecret = "yourAccessTokenSecret"; // Replace with your actual secret
// const accessTokenExpireMinutes = 30; // Set the expiration time in minutes

userSchema.methods.SignAccessToken = function () {
    // Calculate the expiration time in seconds from the current time
    // const expirationTimeInSeconds = Math.floor(Date.now() / 1000) + (accessTokenExpireTime * 60);

    return sign({ id: this._id }, accessTokenSecret || "", {
        expiresIn: "30m",
    });
};

//signin refresh token
userSchema.methods.SignRefreshToken = function () {
    return sign({ id: this._id }, refreshTokenSecret || "", {
        expiresIn: "30d",
    });
}

//compare password
userSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password)
}

// const UserModel = model<IUser>('Users', userSchema);
// const UserModel = models.Users || model<IUser>('Users', userSchema);
// const UserModel =  Model<IUser> = mongoose.model("users", userSchema);
const UserModel: Model<IUser> = (models.Users || mongoose.model<IUser>('Users', userSchema)) as Model<IUser>;

export default UserModel;