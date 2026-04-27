function log(level, msg, data = {}) {
  process.stdout.write(JSON.stringify({
    ts: new Date().toISOString(),
    level,
    svc: 'game-service',
    msg,
    ...data,
  }) + '\n');
}

export const logger = {
  info:  (msg, data = {}) => log('INFO',  msg, data),
  warn:  (msg, data = {}) => log('WARN',  msg, data),
  error: (msg, data = {}) => log('ERROR', msg, data),
};

export function requestLogger(req, res, next) {
  const t0 = Date.now();
  res.on('finish', () => logger.info('http', {
    method: req.method,
    path:   req.path,
    status: res.statusCode,
    ms:     Date.now() - t0,
    trace:  req.headers['x-b3-traceid'] ?? null,
  }));
  next();
}
