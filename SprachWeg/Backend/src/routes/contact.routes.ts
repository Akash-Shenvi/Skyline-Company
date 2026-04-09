import express from 'express';
import {
    submitContactForm,
    getAllMessages,
    markAsRead,
    deleteMessage
} from '../controllers/contact.controller';
import { protect, isAdmin } from '../middlewares/auth.middleware';

const router = express.Router();

// Public route
router.post('/', submitContactForm);

// Admin routes
router.get('/admin/messages', protect, isAdmin, getAllMessages);
router.patch('/admin/messages/:id/read', protect, isAdmin, markAsRead);
router.delete('/admin/messages/:id', protect, isAdmin, deleteMessage);

export default router;
