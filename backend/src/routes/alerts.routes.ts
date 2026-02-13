import { Router } from 'express';
import { listAlerts, summarizeAlert } from '../controllers/alerts.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', requireAuth, listAlerts);
router.post('/:alertId/explain', requireAuth, summarizeAlert);

export default router;
