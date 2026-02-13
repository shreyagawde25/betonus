import { Router } from 'express';
import { body } from 'express-validator';
import { getIngestionStatus, ingestBulkLogs, ingestLog } from '../controllers/logs.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { handleValidation } from '../middleware/validate.middleware.js';

const router = Router();

router.post(
  '/',
  requireAuth,
  body('host').isString().notEmpty(),
  body('source').isString().notEmpty(),
  body('level').isIn(['info', 'warn', 'error']),
  body('message').isString().notEmpty(),
  body('timestamp').isISO8601(),
  handleValidation,
  ingestLog
);

router.post(
  '/bulk',
  requireAuth,
  body('logs').isArray({ min: 1 }),
  body('logs.*.host').isString().notEmpty(),
  body('logs.*.source').isString().notEmpty(),
  body('logs.*.level').isIn(['info', 'warn', 'error']),
  body('logs.*.message').isString().notEmpty(),
  body('logs.*.timestamp').isISO8601(),
  handleValidation,
  ingestBulkLogs
);

router.get('/status', requireAuth, getIngestionStatus);

export default router;
