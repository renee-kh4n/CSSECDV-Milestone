const validate = (schema, viewName) => (req, res, next) => {
	const result = schema.safeParse(req.body);
	if (!result.success) {
		req.session.errorMessage = 'Invalid credentials';
		return res.redirect(viewName);
	}
	next();
};

module.exports = validate;