import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validate.js';
import restaurantService from '../services/restaurant.service.js';

const router = Router();

const listQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((v) => (v ? Number(v) : 1)),
    limit: z.string().optional().transform((v) => (v ? Number(v) : 20)),
    diningType: z.enum(['snack', 'meal', 'drinking']).optional(),
    companionType: z.enum(['couple', 'friends', 'solo']).optional(),
  }),
});

router.get('/restaurants', validate(listQuerySchema), async (req, res, next) => {
  try {
    const result = await restaurantService.getRestaurants(req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/restaurants/:id', async (req, res, next) => {
  try {
    const result = await restaurantService.getRestaurantDetail(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
