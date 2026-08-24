import express from 'express';
import { z } from 'zod';
import { login, registerUser, getById } from '../services/authService.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Repare que não existe campo "role": o papel é decidido no backend a partir
// de isOrganizer. Qualquer "role" enviado pelo cliente é simplesmente ignorado,
// então não há caminho para alguém se cadastrar como GATE.
const registerSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome'),
  email: z.string().email('Informe um e-mail válido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  isOrganizer: z.boolean().default(false),
});

router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await registerUser(data);

    res.status(201).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }

    next(error);
  }
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
