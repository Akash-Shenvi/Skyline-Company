import express from 'express';
import {
    createCareerProgram,
    deleteCareerProgram,
    getAdminCareerPrograms,
    getCareerProgramBySlug,
    getPublicCareerPrograms,
    updateCareerProgram,
} from '../controllers/careerProgram.controller';
import { careerProgramUpload } from '../config/careerProgramUpload';
import { isAdmin, protect } from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/', getPublicCareerPrograms);
router.get('/admin', protect, isAdmin, getAdminCareerPrograms);
router.post(
    '/admin',
    protect,
    isAdmin,
    careerProgramUpload.fields([
        { name: 'heroImage', maxCount: 1 },
        { name: 'cardImage', maxCount: 1 },
    ]),
    createCareerProgram
);
router.put(
    '/admin/:id',
    protect,
    isAdmin,
    careerProgramUpload.fields([
        { name: 'heroImage', maxCount: 1 },
        { name: 'cardImage', maxCount: 1 },
    ]),
    updateCareerProgram
);
router.delete('/admin/:id', protect, isAdmin, deleteCareerProgram);
router.get('/:slug', getCareerProgramBySlug);

export default router;
