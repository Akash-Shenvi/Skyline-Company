import express from 'express';
import {
    createCareerProgram,
    deleteCareerProgram,
    getAdminCareerPrograms,
    getCareerProgramBySlug,
    getPublicCareerPrograms,
    updateCareerProgram,
} from '../controllers/careerProgram.controller';
import { isAdmin, protect } from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/', getPublicCareerPrograms);
router.get('/admin', protect, isAdmin, getAdminCareerPrograms);
router.post('/admin', protect, isAdmin, createCareerProgram);
router.put('/admin/:id', protect, isAdmin, updateCareerProgram);
router.delete('/admin/:id', protect, isAdmin, deleteCareerProgram);
router.get('/:slug', getCareerProgramBySlug);

export default router;
