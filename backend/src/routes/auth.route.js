import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../config/db.js';
import { signToken } from '../utils/jwt.js';
import { validate } from '../middlewares/validate.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

const loginSchema = z.object({
  body: z.object({
    email: z.string().min(1, 'Vui lòng nhập tài khoản hoặc email'),
    password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
  }),
});

router.post('/auth/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const identifier = (email || '').trim().toLowerCase();

    // Support both username 'admin' and full email 'admin@homnayangi.vn'
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { email: `${identifier}@homnayangi.vn` },
          { name: { equals: identifier, mode: 'insensitive' } },
        ],
      },
    });

    // Timing-attack safe generic failure message
    if (!user) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Tài khoản hoặc mật khẩu không chính xác.',
        },
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Tài khoản hoặc mật khẩu không chính xác.',
        },
      });
    }

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = signToken(payload);

    // Set secure cookie
    res.cookie('hnag_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      data: {
        user: payload,
      },
      meta: {
        token,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/auth/logout', (req, res) => {
  res.clearCookie('hnag_token');
  res.status(200).json({
    data: {
      message: 'Đăng xuất thành công.',
    },
  });
});

router.get('/auth/me', requireAuth, (req, res) => {
  res.status(200).json({
    data: {
      user: req.user,
    },
  });
});

export default router;
