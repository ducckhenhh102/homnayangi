export function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Đường dẫn '${req.method} ${req.originalUrl}' không tồn tại.`,
    },
  });
}
