const validate = (schema, route) => (req, res, next) => {
	const result = schema.safeParse(req.body);
	if (!result.success) {
		req.session.errorMessage = result.error.issues[0].message;
		//console.log(req.session.errorMessage )
		const path = typeof route === 'function' ? route(req) : route;
		return res.redirect(path);
	}
	req.data = result.data;
	next();
};

module.exports = validate;