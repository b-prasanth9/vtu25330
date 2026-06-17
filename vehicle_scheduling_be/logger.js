// Logging middleware: logs timestamp, method, URL, status code, response time in ms
module.exports = function logger(req, res, next) {
  const start = process.hrtime();
  const timestamp = new Date().toISOString();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationMs = (diff[0] * 1e3) + (diff[1] / 1e6);
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(3)}ms`);
  });

  next();
};