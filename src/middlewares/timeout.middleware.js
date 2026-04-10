const IDLE_TIMEOUT_MS = Number(15 * 60 * 1000);
const logger = require('../logger');

function sessionTimeout(req, res, next) {
	if (!req.session || !req.session.user) return next();

	const now = Date.now();
	const last = req.session.lastActivity;

	if (last && now - last > IDLE_TIMEOUT_MS) {
		const userId = req.session.user?.id;
		const ip = req.ip;
		
		return req.session.destroy((err) => {
			if (err) {
				logger.error(
					`TIMEOUT | user=${userId} | ip=${ip} | error=${err}`,
				);
				return next(err);
			} else {
				return res.redirect('/login?timeout=1');
			}
		});
	}

	req.session.lastActivity = now;
	next();
}

module.exports = sessionTimeout;
