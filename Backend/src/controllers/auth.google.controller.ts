import { Request, Response } from 'express';
import { GoogleCalendarService } from '../services/google.calendar.service';
import User from '../models/user.model';
import { AuthRequest } from '../middlewares/auth.middleware';

const googleService = new GoogleCalendarService();

export const connectGoogle = (req: AuthRequest, res: Response) => {
    try {
        const url = googleService.getAuthUrl();
        res.json({ url });
    } catch (error) {
        res.status(500).json({ message: 'Error generating auth URL', error });
    }
};

export const googleCallback = async (req: Request, res: Response) => {
    try {
        const { code, state } = req.query; // state could be used to pass userId if needed, strictly speaking
        // Ideally we pass userId in state, but simpler flow: 
        // Frontend receives code, sends code + userId (via auth token) to a POST endpoint.
        // OR: We rely on the callback handling it here.
        // BETTER: Frontend handles the redirect, grabs 'code', and sends it to backend via POST /auth/google/callback with Bearer token.

        // Let's assume the frontend sends the code to a POST endpoint.
        const { code: authCode } = req.body as { code: string };
        const userId = (req as AuthRequest).user?._id;

        const tokens = await googleService.getTokens(authCode);

        if (tokens.refresh_token) {
            await User.findByIdAndUpdate(userId, { googleRefreshToken: tokens.refresh_token });
            res.json({ message: 'Google Calendar connected successfully' });
        } else {
            // Check if user already has a token (refresh token only sent on first consent)
            // If strictly needed, we force prompt: 'consent' in service.
            res.json({ message: 'Connected (No new refresh token)' });
        }

    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(500).json({ message: 'Error connecting Google Calendar', error });
    }
};
