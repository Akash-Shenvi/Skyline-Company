import express from 'express';
import { getStudentDashboard, getTrainerDashboard } from '../controllers/dashboard.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

// All dashboard routes require authentication
router.use(protect);

// Student Dashboard Data
router.get('/student', getStudentDashboard);

// Trainer Dashboard Data
router.get('/trainer', getTrainerDashboard);

export default router;
