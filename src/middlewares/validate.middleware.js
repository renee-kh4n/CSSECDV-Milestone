const validate = (schema, viewName) => (req, res, next) => {
	const result = schema.safeParse(req.body);
	if (!result.success) {
		req.session.errorMessage = result.error.issues[0].message;
		return res.redirect(viewName);
	}
	req.data = result.data;  
	next();
};

module.exports = validate;