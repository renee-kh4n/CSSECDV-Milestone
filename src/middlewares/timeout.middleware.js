const IDLE_TIMEOUT_MS = Number(15 * 60 * 1000);
const logger = require('../logger');

function sessionTimeout(req, res, next) {
	if (!req.session || !req.session.user) return next();

	const now = Date.now();
	const last = req.session.lastActivity;

	if (last && now - last > IDLE_TIMEOUT_MS) {
		return req.session.destroy((err) => {
			if (err) {
				logger.error(
					`TIMEOUT | user=${req.session.user?.id} | ip=${req.ip} | error=${err.stack || err}`,
				);
				console.error((process.env.DEBUG === 'true' ? err?.stack : err?.message) ?? err ?? 'Unknown error');
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
