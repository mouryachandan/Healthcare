export function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  const message = err.message || 'Server Error';
  if (process.env.NODE_ENV !== 'production') console.error(err);
  res.status(status).json({
    message,
    ...(err.errors && { errors: err.errors }),
  });
}

export function notFound(req, res) {
  res.status(404).json({ message: `Not found — ${req.originalUrl}` });
}
