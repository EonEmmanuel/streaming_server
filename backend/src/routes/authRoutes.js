import express from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { signToken } from '../utils/jwt.js';

const router = express.Router();

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6)
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', issues: parsed.error.issues });
  }

  const { username, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const token = signToken({
    id: user.id,
    username: user.username,
    role: user.role
  });

  return res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

export default router;
