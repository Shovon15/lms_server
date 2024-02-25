
import { Secret } from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";

require("dotenv").config({ path: ".env" });

const serverPort = process.env.PORT || 5001;
const nodeEnv = process.env.NODE_ENV;


const clientOrigin = process.env.CLIENT_ORIGIN || "";

const mongoDbUrl = process.env.MONGODB_URI as string;
const redisUrl = process.env.REDIS_URI;

const activationTokenSecret = process.env.ACTIVATION_TOKEN_SECRET as Secret;
const accessTokenSecret = process.env.ACCESS_TOKEN as Secret;
const refreshTokenSecret = process.env.REFESH_TOKEN as Secret;
const accessTokenExpireTime = process.env.ACCESS_TOKEN_EXPIRE;
const refreshTokenExpireTime = process.env.REFESH_TOKEN_EXPIRE;

const cloudName = process.env.CLOUD_NAME;
const cloudApiKey = process.env.CLOUD_API_KEY;
const cloudApiSecret = process.env.CLOUD_API_SECRET;

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT;
const smtpPassword = process.env.SMTP_PASSWORD;
const smtpService = process.env.SMTP_SERVICE;
const smtpMail = process.env.SMTP_MAIL;

// console.log(typeof (accessTokenExpire))

export {
    cloudinary,
    serverPort,
    nodeEnv,
    mongoDbUrl,
    clientOrigin,
    redisUrl,
    activationTokenSecret,
    accessTokenSecret,
    refreshTokenSecret,
    accessTokenExpireTime,
    refreshTokenExpireTime,
    cloudName,
    cloudApiKey,
    cloudApiSecret,
    smtpHost,
    smtpPort,
    smtpPassword,
    smtpService,
    smtpMail,
}

