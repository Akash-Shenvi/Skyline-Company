import express from 'express';
import { createTrialRequest, getTrialRequests, deleteTrialRequest } from '../controllers/trialRequestController';

const router = express.Router();

// Public route to submit a trial request
router.post('/trials', createTrialRequest);

// Admin routes (should ideally be protected with middleware, but keeping open for now per pattern or user instruction)
router.get('/trials', getTrialRequests);
router.delete('/trials/:id', deleteTrialRequest);

export default router;
