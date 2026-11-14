import { verifyToken } from '../utils/jwt.js';

export function requireAuth(req, res, next) {
  let token = null;

  // 1. Try Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // 2. Try cookie
  if (!token && req.cookies && req.cookies.hnag_token) {
    token = req.cookies.hnag_token;
  }

  if (!token) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Yêu cầu đăng nhập để truy cập tài nguyên này.',
      },
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ.',
      },
    });
  }

  req.user = decoded;
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: 'Bạn không có quyền quản trị để thực hiện thao tác này.',
      },
    });
  }
  next();
}
