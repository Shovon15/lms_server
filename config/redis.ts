import { Redis } from "ioredis";
import { redisUrl } from "../secret";

const redisClient = () => {
    if (redisUrl) {
        console.log(`---------------------------`);
        console.log(`redis connected`);
        return redisUrl;
    }
    throw new Error("redis connection failed");
};

export const redis = new Redis(redisClient());
