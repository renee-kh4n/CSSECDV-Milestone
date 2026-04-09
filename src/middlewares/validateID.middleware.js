function validateID(req, res, next) {
  for (const key in req.params) {
    const value = Number(req.params[key]);

    if (!Number.isInteger(value) || value <= 0) {
      return res.status(400).send(`Invalid ${key}`);
    }

    req.params[key] = value;
  }

  next();
}

module.exports = validateID;