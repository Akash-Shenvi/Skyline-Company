import express from 'express';
import {
    approveInstitutionRequest,
    deleteResolvedInstitutionRequest,
    getAdminInstitutionRequests,
    rejectInstitutionRequest,
} from '../controllers/institution.controller';
import { isAdmin, protect } from '../middlewares/auth.middleware';

const router = express.Router();

router.use(protect, isAdmin);

router.get('/requests', getAdminInstitutionRequests);
router.post('/requests/:id/approve', approveInstitutionRequest);
router.post('/requests/:id/reject', rejectInstitutionRequest);
router.delete('/requests/:id', deleteResolvedInstitutionRequest);

export default router;
