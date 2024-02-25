import express from 'express';
import { getCourses, uploadcourse } from '../controllers/courseController';
import { isAuthenticated } from '../middleware/auth';


const courseRouter = express.Router();

courseRouter.post("/upload-course", isAuthenticated, uploadcourse);
courseRouter.get("/courses", getCourses);

export default courseRouter;