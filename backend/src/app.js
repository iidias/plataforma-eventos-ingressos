import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { errorHandler } from './middlewares/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import catalogRoutes from './routes/catalogRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import gateRoutes from './routes/gateRoutes.js';
import organizerRoutes from './routes/organizerRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/catalog', catalogRoutes);
app.use('/events', eventRoutes);
app.use('/gate', gateRoutes);
app.use('/organizer', organizerRoutes);
app.use('/reservations', reservationRoutes);
app.use('/tickets', ticketRoutes);
app.use('/public', publicRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Sempre registrar o errorHandler por último, depois de todas as rotas.
app.use(errorHandler);

export default app;
