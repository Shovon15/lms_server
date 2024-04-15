import { Request, Response, NextFunction } from "express";

//higher order func
// export const asyncHandler = (reqHandler: any) => (req: Request, res: Response, next: NextFunction) => {
//     Promise.resolve(reqHandler(req, res, next).catch((error: any) => next(error)));
// };

type ReqHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export const asyncHandler = (reqHandler: ReqHandler) => {
	return (req: Request, res: Response, next: NextFunction) => {
		return Promise.resolve(reqHandler(req, res, next).catch((error: any) => next(error)));
	};
};
