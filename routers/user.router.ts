import express from 'express';
import {
    getUserInfo, socialAuth, updateAccessToken, updateAvatar, updateInfo, updatePassword, userActivation,
    userDeleteDev, userLogin, userLogout, userRegister
} from '../controllers/user.controller';
import { isAuthenticated } from '../middleware/auth';

const userRouter = express.Router();

userRouter.get("/userDeleteDEv", userDeleteDev);


userRouter.post("/signup", userRegister);
userRouter.post("/activation", userActivation);
userRouter.post("/login", userLogin);
userRouter.get("/logout", isAuthenticated, userLogout);
userRouter.get("/refresh-token", updateAccessToken);
userRouter.get("/user-info", isAuthenticated, getUserInfo);
userRouter.post("/social-auth", socialAuth);
userRouter.put("/update-user-info", isAuthenticated, updateInfo);
userRouter.put("/update-password", isAuthenticated, updatePassword);
userRouter.put("/update-avatar", isAuthenticated, updateAvatar);

export default userRouter;