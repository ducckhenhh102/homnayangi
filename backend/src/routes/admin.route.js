import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/db.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { formatRestaurant } from '../services/restaurant.service.js';
import { generateUploadSignature, destroyImage } from '../integrations/cloudinary.js';

const router = Router();

function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// Apply auth + admin guard to /admin routes
router.use('/admin', requireAuth, requireAdmin);

// Schema for creating / updating restaurant
const restaurantCreateSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Tên quán tối thiểu 2 ký tự').max(200),
    slug: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    latitude: z.union([z.number(), z.string().transform((v) => parseFloat(v))]),
    longitude: z.union([z.number(), z.string().transform((v) => parseFloat(v))]),
    description: z.string().optional().nullable(),
    priceMin: z.union([z.number().int().nonnegative(), z.string().transform((v) => (v ? parseInt(v, 10) : null))]).optional().nullable(),
    priceMax: z.union([z.number().int().nonnegative(), z.string().transform((v) => (v ? parseInt(v, 10) : null))]).optional().nullable(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'HIDDEN']).default('DRAFT'),
    diningTypeIds: z.array(z.enum(['snack', 'meal', 'drinking'])).min(1, 'Chọn ít nhất một kiểu ăn'),
    companionScores: z.array(z.object({
      companionTypeId: z.enum(['couple', 'friends', 'solo']),
      score: z.number().int().min(0).max(100).default(100),
    })).optional(),
    foodItems: z.array(z.object({
      name: z.string().min(1, 'Tên món không được để trống'),
      priceVnd: z.union([z.number().int().nonnegative(), z.string().transform((v) => (v ? parseInt(v, 10) : null))]).optional().nullable(),
      category: z.string().optional().nullable(),
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
        orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
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

// 1b. Get single restaurant for editing
router.get('/admin/restaurants/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        diningTypes: true,
        companionTypes: true,
        images: { orderBy: { sortOrder: 'asc' } },
        foods: { include: { food: true } },
      },
    });

    if (!item) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Không tìm thấy quán ăn.' },
      });
    }

    res.status(200).json({ data: item });
  } catch (err) {
    next(err);
  }
});

// 2. Create new restaurant
router.post('/admin/restaurants', validate(restaurantCreateSchema), async (req, res, next) => {
  try {
    const data = req.body;

    // Generate robust slug and check uniqueness
    const rawSlug = data.slug ? slugify(data.slug) : slugify(data.name);
    const baseSlug = rawSlug || `quan-${Date.now()}`;

    // If explicit slug was provided, check if it already exists
    if (data.slug && data.slug.trim()) {
      const explicitSlug = slugify(data.slug);
      const existing = await prisma.restaurant.findUnique({ where: { slug: explicitSlug } });
      if (existing) {
        return res.status(400).json({
          error: {
            code: 'SLUG_EXISTS',
            message: `Đường dẫn (slug) '${explicitSlug}' đã tồn tại. Vui lòng chọn một slug khác.`,
          },
        });
      }
    }

    let finalSlug = baseSlug;
    let counter = 1;
    while (await prisma.restaurant.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter++}`;
    }

    // Ensure valid address
    const finalAddress = (data.address && data.address.trim().length >= 5)
      ? data.address.trim()
      : `Tọa độ ${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}, Hà Nội`;

    const created = await prisma.restaurant.create({
      data: {
        name: data.name.trim(),
        slug: finalSlug,
        address: finalAddress,
        latitude: data.latitude,
        longitude: data.longitude,
        description: data.description ? data.description.trim() : null,
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

    // Create custom food items if provided
    if (data.foodItems && Array.isArray(data.foodItems) && data.foodItems.length > 0) {
      for (const item of data.foodItems) {
        if (!item.name || !item.name.trim()) continue;
        const foodName = item.name.trim();
        const baseFoodSlug = slugify(foodName) || `mon-${Date.now()}`;
        let foodSlug = baseFoodSlug;
        let fCounter = 1;

        let food = await prisma.food.findUnique({ where: { slug: foodSlug } });
        if (!food) {
          food = await prisma.food.create({
            data: {
              name: foodName,
              slug: foodSlug,
              category: item.category || 'Món đặc trưng',
            },
          });
        }

        await prisma.restaurantFood.create({
          data: {
            restaurantId: created.id,
            foodId: food.id,
            priceVnd: item.priceVnd != null ? Number(item.priceVnd) : (data.priceMin || 30000),
          },
        }).catch(() => {});
      }
    }

    // Refetch complete restaurant with foods
    const fullRestaurant = await prisma.restaurant.findUnique({
      where: { id: created.id },
      include: {
        diningTypes: true,
        companionTypes: true,
        images: true,
        foods: { include: { food: true } },
      },
    });

    res.status(201).json({
      data: formatRestaurant(fullRestaurant),
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

    // If slug is changed, check uniqueness
    let patchSlug = undefined;
    if (body.slug && body.slug !== existing.slug) {
      const baseSlug = slugify(body.slug) || existing.slug;
      patchSlug = baseSlug;
      let counter = 1;
      while (true) {
        const slugExists = await prisma.restaurant.findUnique({
          where: { slug: patchSlug },
        });
        if (!slugExists || slugExists.id === id) break;
        patchSlug = `${baseSlug}-${counter++}`;
      }
    }

    const updated = await prisma.restaurant.update({
      where: { id },
      data: {
        name: body.name !== undefined ? body.name.trim() : undefined,
        slug: patchSlug !== undefined ? patchSlug : undefined,
        description: body.description !== undefined ? (body.description?.trim() || null) : undefined,
        address: body.address !== undefined ? body.address.trim() : undefined,
        latitude: body.latitude !== undefined ? Number(body.latitude) : undefined,
        longitude: body.longitude !== undefined ? Number(body.longitude) : undefined,
        priceMin: body.priceMin !== undefined ? (body.priceMin ? Number(body.priceMin) : null) : undefined,
        priceMax: body.priceMax !== undefined ? (body.priceMax ? Number(body.priceMax) : null) : undefined,
        status: body.status !== undefined ? body.status : undefined,
        diningTypes: body.diningTypeIds ? {
          deleteMany: {},
          create: body.diningTypeIds.map((dtId) => ({ diningTypeId: dtId })),
        } : undefined,
      },
      include: {
        diningTypes: true,
        companionTypes: true,
        foods: { include: { food: true } },
      },
    });

    // If custom food items provided in PATCH
    if (body.foodItems && Array.isArray(body.foodItems)) {
      // Clear old associations
      await prisma.restaurantFood.deleteMany({ where: { restaurantId: id } });

      for (const item of body.foodItems) {
        if (!item.name || !item.name.trim()) continue;
        const foodName = item.name.trim();
        const foodSlug = slugify(foodName) || `mon-${Date.now()}`;

        let food = await prisma.food.findUnique({ where: { slug: foodSlug } });
        if (!food) {
          food = await prisma.food.create({
            data: {
              name: foodName,
              slug: foodSlug,
              category: item.category || 'Món đặc trưng',
            },
          });
        }

        await prisma.restaurantFood.create({
          data: {
            restaurantId: id,
            foodId: food.id,
            priceVnd: item.priceVnd != null ? Number(item.priceVnd) : (updated.priceMin || 30000),
          },
        }).catch(() => {});
      }
    }

    const fullUpdated = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        diningTypes: true,
        companionTypes: true,
        images: true,
        foods: { include: { food: true } },
      },
    });

    res.status(200).json({
      data: formatRestaurant(fullUpdated),
    });
  } catch (err) {
    next(err);
  }
});

// 3b. Quick status toggle (PUBLISHED <-> HIDDEN) without touching other fields
router.patch('/admin/restaurants/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['PUBLISHED', 'HIDDEN', 'DRAFT'].includes(status)) {
      return res.status(400).json({
        error: { message: 'Trạng thái không hợp lệ. Chỉ chấp nhận PUBLISHED, HIDDEN, DRAFT.' },
      });
    }

    const updated = await prisma.restaurant.update({
      where: { id },
      data: { status },
      select: { id: true, name: true, status: true, updatedAt: true },
    });

    res.status(200).json({ data: updated });
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

// 4b. Permanent delete restaurant (remove completely from DB)
router.delete('/admin/restaurants/:id/permanent', async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.restaurant.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Không tìm thấy quán để xóa vĩnh viễn.',
        },
      });
    }

    await prisma.restaurant.delete({ where: { id } });

    res.status(200).json({
      data: {
        message: 'Đã xóa vĩnh viễn quán ăn khỏi cơ sở dữ liệu.',
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

// 6. Cloudinary Upload Signature endpoint
router.post('/admin/uploads/signature', (req, res, next) => {
  try {
    const subfolder = req.query.type === 'food' ? 'foods' : 'restaurants';
    const signatureData = generateUploadSignature(subfolder);
    res.status(200).json({ data: signatureData });
  } catch (err) {
    next(err);
  }
});

// 7. Attach uploaded image metadata to restaurant
const imageAttachSchema = z.object({
  body: z.object({
    cloudinaryPublicId: z.string().min(1, 'Public ID là bắt buộc'),
    secureUrl: z.string().url('URL ảnh không hợp lệ'),
    width: z.number().int().optional().nullable(),
    height: z.number().int().optional().nullable(),
    altText: z.string().optional().nullable(),
    rightsSource: z.string().optional().nullable(),
    sortOrder: z.number().int().default(0),
  }),
});

router.post('/admin/restaurants/:id/images', validate(imageAttachSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const restaurant = await prisma.restaurant.findUnique({ where: { id } });
    if (!restaurant) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Không tìm thấy quán để gắn ảnh.' },
      });
    }

    const createdImage = await prisma.restaurantImage.create({
      data: {
        restaurantId: id,
        cloudinaryPublicId: body.cloudinaryPublicId,
        secureUrl: body.secureUrl,
        width: body.width ?? null,
        height: body.height ?? null,
        altText: body.altText ?? null,
        rightsSource: body.rightsSource || 'Do admin tải lên',
        sortOrder: body.sortOrder,
        uploadedBy: req.user.id,
      },
    });

    res.status(201).json({ data: createdImage });
  } catch (err) {
    next(err);
  }
});

// 8. Delete restaurant image (from Cloudinary and DB)
router.delete('/admin/restaurants/:id/images/:imageId', async (req, res, next) => {
  try {
    const { id, imageId } = req.params;

    const img = await prisma.restaurantImage.findFirst({
      where: { id: imageId, restaurantId: id },
    });

    if (!img) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Không tìm thấy ảnh để xóa.' },
      });
    }

    // Delete from Cloudinary
    await destroyImage(img.cloudinaryPublicId);

    // Delete from DB
    await prisma.restaurantImage.delete({ where: { id: imageId } });

    res.status(200).json({ data: { message: 'Đã xóa ảnh thành công.' } });
  } catch (err) {
    next(err);
  }
});

// 9. List user submissions (separated table)
router.get('/admin/submissions', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const where = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      prisma.restaurantSubmission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.restaurantSubmission.count({ where }),
    ]);

    res.status(200).json({
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 10. Approve submission -> creates official restaurant in restaurants table
router.post('/admin/submissions/:id/approve', async (req, res, next) => {
  try {
    const { id } = req.params;
    const submission = await prisma.restaurantSubmission.findUnique({ where: { id } });

    if (!submission) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Không tìm thấy đề xuất quán.' },
      });
    }

    if (submission.status === 'APPROVED') {
      return res.status(400).json({
        error: { code: 'ALREADY_APPROVED', message: 'Đề xuất này đã được duyệt trước đó.' },
      });
    }

    // Generate unique slug
    let baseSlug = slugify(submission.name);
    let finalSlug = baseSlug;
    let counter = 1;
    while (await prisma.restaurant.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create restaurant in restaurants table
    const createdRestaurant = await prisma.restaurant.create({
      data: {
        name: submission.name,
        slug: finalSlug,
        address: submission.address,
        latitude: submission.latitude,
        longitude: submission.longitude,
        description: submission.description,
        priceMin: submission.priceMin,
        priceMax: submission.priceMax,
        status: 'PUBLISHED',
        createdById: req.user?.id ? (await prisma.user.findUnique({ where: { id: req.user.id } })) ? req.user.id : null : null,
        diningTypes: {
          create: (submission.diningTypes || ['meal']).map((dt) => ({
            diningTypeId: dt,
          })),
        },
        companionTypes: {
          create: [
            { companionTypeId: 'couple', suitabilityScore: 85 },
            { companionTypeId: 'friends', suitabilityScore: 85 },
            { companionTypeId: 'solo', suitabilityScore: 80 },
          ],
        },
      },
    });

    // If submission had an uploaded image, attach it to the new restaurant
    if (submission.imageUrl && submission.cloudinaryPublicId) {
      await prisma.restaurantImage.create({
        data: {
          restaurantId: createdRestaurant.id,
          cloudinaryPublicId: submission.cloudinaryPublicId,
          secureUrl: submission.imageUrl,
          altText: `Ảnh quán ${submission.name}`,
          sortOrder: 0,
          uploadedBy: submission.submitterName || 'Cộng đồng',
        },
      });
    }

    // Update submission status to APPROVED
    await prisma.restaurantSubmission.update({
      where: { id },
      data: { status: 'APPROVED' },
    });

    res.status(200).json({
      data: {
        message: 'Đã duyệt quán thành công! Quán đã xuất hiện chính thức trên hệ thống.',
        restaurant: createdRestaurant,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 11. Reject submission
router.post('/admin/submissions/:id/reject', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};

    const submission = await prisma.restaurantSubmission.findUnique({ where: { id } });
    if (!submission) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Không tìm thấy đề xuất quán.' },
      });
    }

    const updated = await prisma.restaurantSubmission.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason || 'Không phù hợp tiêu chí',
      },
    });

    res.status(200).json({
      data: {
        message: 'Đã từ chối đề xuất quán.',
        submission: updated,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 12. Delete submission
router.delete('/admin/submissions/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.restaurantSubmission.delete({ where: { id } });

    res.status(200).json({
      data: { message: 'Đã xóa bản ghi đề xuất.' },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
