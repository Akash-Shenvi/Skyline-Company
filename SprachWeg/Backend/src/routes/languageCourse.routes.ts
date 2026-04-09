import express from 'express';
import {
    getAllLanguages,
    getLanguageById,
    createLanguage,
    updateLanguage,
    deleteLanguage
} from '../controllers/languageCourse.controller';
import multer from 'multer';
import path from 'path';

import { protect, isAdmin } from '../middlewares/auth.middleware';

const router = express.Router();

// Multer setup for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/home/sovirtraining/file_serve/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Public Routes
router.get('/', getAllLanguages);
router.get('/:id', getLanguageById);

// Admin Routes
router.post('/', protect, isAdmin, upload.single('image'), createLanguage);
router.put('/:id', protect, isAdmin, upload.single('image'), updateLanguage);
router.delete('/:id', protect, isAdmin, deleteLanguage);

export default router;
