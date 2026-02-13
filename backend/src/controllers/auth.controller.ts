import type { Request, Response } from 'express';
import { UserModel } from '../models/User.js';
import { hashPassword, signToken, verifyPassword } from '../services/auth.service.js';

export async function signup(req: Request, res: Response): Promise<void> {
  const { name, email, password } = req.body as { name: string; email: string; password: string };

  const existing = await UserModel.findOne({ email });
  if (existing) {
    res.status(409).json({ message: 'Email already in use.' });
    return;
  }

  const passwordHash = await hashPassword(password);
  const user = await UserModel.create({ name, email, passwordHash });
  const token = signToken(user.id, user.email);
  res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email: string; password: string };
  const user = await UserModel.findOne({ email });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    res.status(401).json({ message: 'Invalid credentials.' });
    return;
  }

  const token = signToken(user.id, user.email);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
}
