import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validate.js';
import prisma from '../config/db.js';
import { generateUploadSignature } from '../integrations/cloudinary.js';

const router = Router();

// Public endpoint for users to get Cloudinary upload signature for submitting restaurant photos
router.post('/submissions/upload-signature', (req, res, next) => {
  try {
    const signatureData = generateUploadSignature('submissions');
    res.status(200).json({ data: signatureData });
  } catch (err) {
    next(err);
  }
});

const createSubmissionSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Tên quán ăn phải có ít nhất 2 ký tự').max(200),
    address: z.string().min(5, 'Địa chỉ quán phải có ít nhất 5 ký tự'),
    latitude: z.number().min(-90).max(90, 'Vĩ độ (latitude) không hợp lệ'),
    longitude: z.number().min(-180).max(180, 'Kinh độ (longitude) không hợp lệ'),
    description: z.string().optional().nullable(),
    diningTypes: z.array(z.enum(['meal', 'snack', 'drinking'])).min(1, 'Chọn ít nhất 1 loại hình ăn uống'),
    priceMin: z.number().int().positive().optional().nullable(),
    priceMax: z.number().int().positive().optional().nullable(),
    imageUrl: z.string().optional().nullable(),
    cloudinaryPublicId: z.string().optional().nullable(),
    submitterName: z.string().max(100).optional().nullable(),
    submitterContact: z.string().max(100).optional().nullable(),
    note: z.string().max(500).optional().nullable(),
  }),
});

// Public endpoint: Any user can submit/share a new restaurant
router.post('/submissions', validate(createSubmissionSchema), async (req, res, next) => {
  try {
    const data = req.body;

    const submission = await prisma.restaurantSubmission.create({
      data: {
        name: data.name.trim(),
        address: data.address.trim(),
        latitude: data.latitude,
        longitude: data.longitude,
        description: data.description ? data.description.trim() : null,
        diningTypes: data.diningTypes,
        priceMin: data.priceMin || null,
        priceMax: data.priceMax || null,
        imageUrl: data.imageUrl || null,
        cloudinaryPublicId: data.cloudinaryPublicId || null,
        submitterName: data.submitterName ? data.submitterName.trim() : null,
        submitterContact: data.submitterContact ? data.submitterContact.trim() : null,
        note: data.note ? data.note.trim() : null,
        status: 'PENDING',
      },
    });

    res.status(201).json({
      data: {
        id: submission.id,
        message: 'Gửi đề xuất quán ăn thành công! Quán của bạn sẽ hiển thị sau khi được Admin kiểm duyệt.',
        createdAt: submission.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
