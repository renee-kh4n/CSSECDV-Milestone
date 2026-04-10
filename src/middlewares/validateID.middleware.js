function validateID(req, res, next) {
  for (const key in req.params) {
    const rawValue = req.params[key];
    const value = Number(rawValue);

    if (!Number.isInteger(value) || value <= 0) {
      logger.warn(
        `INVALID_ROUTE_PARAM | key=${key} | value=${rawValue} | route=${req.originalUrl} | ip=${req.ip}`
      );
      const isDev = process.env.NODE_ENV === 'development';
      return res.render('error', {
        title: 'Invalid input',
        message: isDev ? `Invalid ${key}` : `Invalid input`,
        noNavbar: true
      });
    }

    req.params[key] = value;
  }

  next();
}

module.exports = validateID;