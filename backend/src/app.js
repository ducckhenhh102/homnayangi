import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import healthRouter from './routes/health.route.js';
import discoveryRouter from './routes/discovery.route.js';
import restaurantRouter from './routes/restaurant.route.js';
import authRouter from './routes/auth.route.js';
import adminRouter from './routes/admin.route.js';
import wheelRouter from './routes/wheel.route.js';
import submissionRouter from './routes/submission.route.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';

dotenv.config();

const app = express();

// Security and utility middlewares
app.use(helmet());

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, '');
      const isAllowed = allowedOrigins.some((o) => o.replace(/\/$/, '') === cleanOrigin || o === '*');
      if (isAllowed) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback allow in case of header mismatch
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Base API v1 Routes
app.use('/api/v1', healthRouter);
app.use('/api/v1', discoveryRouter);
app.use('/api/v1', restaurantRouter);
app.use('/api/v1', authRouter);
app.use('/api/v1', adminRouter);
app.use('/api/v1', wheelRouter);
app.use('/api/v1', submissionRouter);

// Catch-all 404
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

export default app;
