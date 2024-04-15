import express, { NextFunction, Request, Response } from "express"
import cors from "cors";
import cookieParser from "cookie-parser";
import { clientOrigin } from "./secret";
import { ErrorHandler } from "./utils/error";
import userRouter from "./routers/user.router";
import courseRouter from "./routers/course.router";

export const app = express();

app.use(express.json({ limit: "100mb" }));
// middleware--------------------
app.use(cors({
    origin: clientOrigin,
    credentials: true,
}));


app.use(cookieParser());


app.use("/api/v1", userRouter);
app.use("/api/v1", courseRouter);

app.get("/", (req: Request, res: Response, next: NextFunction) => {

    // console.log(`Welcome to lms platform.`);
    res.status(200).send({
        success: true,
        message: "Welcome to lms platform!!!",
    });
});

app.get("/test", (req: Request, res: Response, next: NextFunction) => {
    res.status(200).send({
        success: true,
        message: "test route working!!!",
    });
});

app.all("*", (req: Request, res: Response, next: NextFunction) => {
    const err = new Error(`route ${req.originalUrl} not found`) as any;
    err.statusCode = 404;
    next(err);
});

app.use(ErrorHandler);