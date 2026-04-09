const winston = require('winston');
const path = require('path');
const fs = require('fs');

const { Logtail } = require("@logtail/node");
const { LogtailTransport } = require("@logtail/winston");


const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
	fs.mkdirSync(logDir);
}

const logtail = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN, {
  endpoint: process.env.LOGTAIL_ENDPOINT,
});

const logger = winston.createLogger({
	level: process.env.DEBUG === 'true' ? 'debug' : 'info',
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.printf(({ timestamp, level, message }) => {
			return `${timestamp} [${level.toUpperCase()}] ${message}`;
		}),
	),
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({
			filename: path.join(logDir, 'app.log'),
		}),
		new LogtailTransport(logtail),
	],
});

module.exports = logger;
