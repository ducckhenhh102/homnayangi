import { ZodError } from 'zod';

export function errorHandler(err, req, res, next) {
  // If headers already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Zod validation error
  if (err instanceof ZodError) {
    const errorDetails = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));
    const summaryMsg = errorDetails.map((d) => d.message).filter(Boolean).join('; ') || 'Dữ liệu yêu cầu không hợp lệ.';

    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: summaryMsg,
        details: errorDetails,
      },
    });
  }

  // Custom App Error with statusCode and code
  const statusCode = err.statusCode || err.status || 500;
  const code = err.code || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');
  const message = err.message || 'Đã có lỗi xảy ra trên hệ thống.';

  const response = {
    error: {
      code,
      message,
    },
  };

  if (err.details) {
    response.error.details = err.details;
  }

  // In production, avoid leaking stack traces
  if (process.env.NODE_ENV !== 'production' && statusCode >= 500) {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
}
