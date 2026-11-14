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

const nearbyQuerySchema = z.object({
  query: z.object({
    lat: z.string({ required_error: 'Tọa độ vĩ độ (lat) là bắt buộc.' })
      .transform(Number)
      .refine((v) => !isNaN(v) && v >= -90 && v <= 90, 'Tọa độ lat phải nằm trong khoảng [-90, 90]'),
    lng: z.string({ required_error: 'Tọa độ kinh độ (lng) là bắt buộc.' })
      .transform(Number)
      .refine((v) => !isNaN(v) && v >= -180 && v <= 180, 'Tọa độ lng phải nằm trong khoảng [-180, 180]'),
    radiusKm: z.string().optional().default('10')
      .transform(Number)
      .refine((v) => !isNaN(v) && v >= 1 && v <= 10, 'Bán kính tìm kiếm (radiusKm) phải từ 1 đến 10 km'),
    companion: z.enum(['couple', 'friends', 'solo']).optional(),
    diningType: z.enum(['snack', 'meal', 'drinking']).optional(),
    page: z.string().optional().default('1').transform(Number),
    limit: z.string().optional().default('20').transform(Number),
    sort: z.enum(['distance', 'relevance']).optional().default('distance'),
  }),
});

router.get('/restaurants/nearby', validate(nearbyQuerySchema), async (req, res, next) => {
  try {
    const result = await restaurantService.getNearbyRestaurants(req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
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
