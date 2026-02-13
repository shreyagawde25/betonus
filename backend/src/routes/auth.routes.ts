import { Router } from 'express';
import { body } from 'express-validator';
import { login, signup } from '../controllers/auth.controller.js';
import { handleValidation } from '../middleware/validate.middleware.js';

const router = Router();

router.post(
  '/signup',
  body('name').isLength({ min: 2, max: 80 }),
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  handleValidation,
  signup
);

router.post('/login', body('email').isEmail(), body('password').isLength({ min: 8 }), handleValidation, login);

export default router;
