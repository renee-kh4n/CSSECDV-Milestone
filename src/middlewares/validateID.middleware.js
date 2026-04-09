function validateID(req, res, next) {
  for (const key in req.params) {
    const rawValue = req.params[key];
    const value = Number(rawValue);

    if (!Number.isInteger(value) || value <= 0) {
      logger.warn(
        `INVALID_ROUTE_PARAM | key=${key} | value=${rawValue} | route=${req.originalUrl} | ip=${req.ip}`
      );
      return res.render('error', {
        title: 'Invalid input',
        message: `Invalid input`
      });
    }

    req.params[key] = value;
  }

  next();
}

module.exports = validateID;