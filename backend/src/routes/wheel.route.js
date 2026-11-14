import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validate.js';
import wheelService from '../services/wheel.service.js';

const router = Router();

const spinSchema = z.object({
  body: z.object({
    mode: z.enum(['restaurant', 'food']).default('restaurant'),
    filters: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      radiusKm: z.number().min(1).max(10).default(10),
      companion: z.enum(['couple', 'friends', 'solo']).optional(),
      diningType: z.enum(['snack', 'meal', 'drinking']).optional(),
    }),
    excludeIds: z.array(z.string()).optional().default([]),
  }),
});

router.post('/wheel/spin', validate(spinSchema), async (req, res, next) => {
  try {
    const result = await wheelService.spin(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
