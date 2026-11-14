import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/db.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { formatRestaurant } from '../services/restaurant.service.js';

const router = Router();

// Apply auth + admin guard to /admin routes
router.use('/admin', requireAuth, requireAdmin);

// Schema for creating / updating restaurant
const restaurantCreateSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Tên quán tối thiểu 2 ký tự').max(200),
    slug: z.string().min(2, 'Slug tối thiểu 2 ký tự').max(240).regex(/^[a-z0-9-]+$/, 'Slug chỉ bao gồm chữ thường, số và dấu gạch ngang'),
    address: z.string().min(5, 'Địa chỉ tối thiểu 5 ký tự'),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    description: z.string().optional().nullable(),
    priceMin: z.number().int().nonnegative().optional().nullable(),
    priceMax: z.number().int().nonnegative().optional().nullable(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'HIDDEN']).default('DRAFT'),
    diningTypeIds: z.array(z.enum(['snack', 'meal', 'drinking'])).min(1, 'Chọn ít nhất một kiểu ăn'),
    companionScores: z.array(z.object({
      companionTypeId: z.enum(['couple', 'friends', 'solo']),
      score: z.number().int().min(0).max(100).default(100),
    })).optional(),
    foodIds: z.array(z.string()).optional(),
  }).refine((data) => {
    if (data.priceMin != null && data.priceMax != null) {
      return data.priceMin <= data.priceMax;
    }
    return true;
  }, {
    message: 'Giá tối thiểu không được lớn hơn giá tối đa',
    path: ['priceMin'],
  }),
});

// 1. List all restaurants for admin (including drafts and hidden)
router.get('/admin/restaurants', async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.restaurant.findMany({
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          diningTypes: true,
          companionTypes: true,
          images: { take: 1, orderBy: { sortOrder: 'asc' } },
          _count: { select: { foods: true, images: true } },
        },
      }),
      prisma.restaurant.count(),
    ]);

    res.status(200).json({
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

// 2. Create new restaurant
router.post('/admin/restaurants', validate(restaurantCreateSchema), async (req, res, next) => {
  try {
    const data = req.body;

    // Check slug uniqueness
    const existing = await prisma.restaurant.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      return res.status(400).json({
        error: {
          code: 'SLUG_EXISTS',
          message: `Slug '${data.slug}' đã tồn tại. Vui lòng chọn slug khác.`,
        },
      });
    }

    const created = await prisma.restaurant.create({
      data: {
        name: data.name,
        slug: data.slug,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        description: data.description || null,
        priceMin: data.priceMin ?? null,
        priceMax: data.priceMax ?? null,
        status: data.status,
        createdById: req.user.id,
        diningTypes: {
          create: data.diningTypeIds.map((dtId) => ({
            diningTypeId: dtId,
          })),
        },
        companionTypes: {
          create: (data.companionScores || []).map((cs) => ({
            companionTypeId: cs.companionTypeId,
            suitabilityScore: cs.score,
          })),
        },
        foods: data.foodIds && data.foodIds.length > 0 ? {
          create: data.foodIds.map((fid) => ({
            foodId: fid,
          })),
        } : undefined,
      },
      include: {
        diningTypes: true,
        companionTypes: true,
        foods: { include: { food: true } },
      },
    });

    res.status(201).json({
      data: formatRestaurant(created),
    });
  } catch (err) {
    next(err);
  }
});

// 3. Update existing restaurant
router.patch('/admin/restaurants/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const existing = await prisma.restaurant.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Không tìm thấy quán để chỉnh sửa.',
        },
      });
    }

    const updated = await prisma.restaurant.update({
      where: { id },
      data: {
        name: body.name !== undefined ? body.name : undefined,
        description: body.description !== undefined ? body.description : undefined,
        address: body.address !== undefined ? body.address : undefined,
        latitude: body.latitude !== undefined ? body.latitude : undefined,
        longitude: body.longitude !== undefined ? body.longitude : undefined,
        priceMin: body.priceMin !== undefined ? body.priceMin : undefined,
        priceMax: body.priceMax !== undefined ? body.priceMax : undefined,
        status: body.status !== undefined ? body.status : undefined,
      },
      include: {
        diningTypes: true,
        companionTypes: true,
        foods: { include: { food: true } },
      },
    });

    res.status(200).json({
      data: formatRestaurant(updated),
    });
  } catch (err) {
    next(err);
  }
});

// 4. Soft delete restaurant (mark as HIDDEN)
router.delete('/admin/restaurants/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.restaurant.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Không tìm thấy quán để xóa/ẩn.',
        },
      });
    }

    await prisma.restaurant.update({
      where: { id },
      data: { status: 'HIDDEN' },
    });

    res.status(200).json({
      data: {
        message: 'Đã ẩn quán ăn thành công.',
      },
    });
  } catch (err) {
    next(err);
  }
});

// 5. Foods list and create for admin
router.get('/admin/foods', async (req, res, next) => {
  try {
    const foods = await prisma.food.findMany({
      orderBy: { name: 'asc' },
    });
    res.status(200).json({ data: foods });
  } catch (err) {
    next(err);
  }
});

router.post('/admin/foods', async (req, res, next) => {
  try {
    const { name, slug, description, category } = req.body;
    if (!name || !slug) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Tên món và slug là bắt buộc.' },
      });
    }

    const created = await prisma.food.create({
      data: { name, slug, description, category },
    });

    res.status(201).json({ data: created });
  } catch (err) {
    next(err);
  }
});

export default router;
