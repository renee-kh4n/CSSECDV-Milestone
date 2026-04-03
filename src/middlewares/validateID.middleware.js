function validateID(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.send('Invalid FAQ ID');
  }

  req.params.id = id;
  next();
}

module.exports = validateID;