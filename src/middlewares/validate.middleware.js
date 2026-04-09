const logger = require('../logger');

const validate = (schema, route) => (req, res, next) => {
	const result = schema.safeParse(req.body);
	if (!result.success) {
		logger.error(
			`VALIDATE_ERROR | user=${req.session.user?.id} | ip=${req.ip} | error=${result.error}`,
		);
		req.session.errorMessage = result.error.issues[0].message;
		const path = typeof route === 'function' ? route(req) : route;
		return res.redirect(path);
	}

	req.data = result.data;
	next();
};

module.exports = validate;