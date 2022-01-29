import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { handleError } from './helpers/responseHandler.js';
import router from './components/index.js';
import config from './config/config.js';
import logger from './config/logger.js';

dotenv.config();

const app = express();

if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

const limiter = rateLimit({
	max: 1000,
	windowMs: 60 * 60 * 1000,
	message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/api', limiter);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(config.apiVersionUrl, router);
app.get(config.apiVersionUrl, () => {
	logger.info('Response');
});

app.all('*', (req, res, next) => {
	// next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
	next(
		handleError({
			res,
			statusCode: 404,
			err: `Can't find ${req.originalUrl} on this server!`,
		})
	);
});

export default app;
