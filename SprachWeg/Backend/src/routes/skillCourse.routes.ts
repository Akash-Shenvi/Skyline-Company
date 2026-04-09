import { Router } from 'express';
import { createCourse, getAllCourses, updateCourse, deleteCourse } from '../controllers/skillCourse.controller';
import { upload } from '../config/multer';
import { protect, isAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/', getAllCourses);

// Protected routes (Only Admin)
router.post('/', protect, isAdmin, upload.single('image'), createCourse);
router.put('/:id', protect, isAdmin, upload.single('image'), updateCourse);
router.delete('/:id', protect, isAdmin, deleteCourse);

export default router;
