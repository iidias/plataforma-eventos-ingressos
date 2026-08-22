import express from 'express';
import { z } from 'zod';
import { login, getById } from '../services/authService.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await login(data.email, data.password);

    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Email e senha são obrigatórios',
      });
    }

    next(error);
  }
});

router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await getById(req.user.sub);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
