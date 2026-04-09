import { Request, Response } from 'express';
import Contact from '../models/contact.model';
import { EmailService } from '../utils/email.service';

const emailService = new EmailService();

// POST /api/contact
export const submitContactForm = async (req: Request, res: Response) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const contact = await Contact.create({
            name,
            email,
            subject,
            message
        });

        // Forward to admin email
        await emailService.forwardContactMessage({ name, email, subject, message });

        // Send auto-reply to user
        await emailService.sendContactAutoReply(email);

        res.status(201).json({ message: 'Message sent successfully', contact });
    } catch (error) {
        console.error('Contact submission error:', error);
        res.status(500).json({ message: 'Failed to send message' });
    }
};

// GET /api/contact/admin/messages
export const getAllMessages = async (req: Request, res: Response) => {
    try {
        const messages = await Contact.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
};

// PATCH /api/contact/admin/messages/:id/read
export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const contact = await Contact.findByIdAndUpdate(
            id,
            { isRead: true },
            { new: true }
        );

        if (!contact) {
            return res.status(404).json({ message: 'Message not found' });
        }

        res.json(contact);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update message' });
    }
};

// DELETE /api/contact/admin/messages/:id
export const deleteMessage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const contact = await Contact.findByIdAndDelete(id);

        if (!contact) {
            return res.status(404).json({ message: 'Message not found' });
        }

        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete message' });
    }
};
