import Joi from 'joi';
import logger from '../config/logger.js';

import { handleError } from '../helpers/responseHandler.js';

export const validateSignup = async (req, res, next) => {
	try {
		const schema = Joi.object({
			email: Joi.string().required(),
			password: Joi.string().min(6).max(20).required(),
			confirmPassword: Joi.string().required().valid(Joi.ref('password')),
			firstName: Joi.string().required(),
			lastName: Joi.string().required(),
		});
		const validation = schema.validate(req.body, { abortEarly: false });

		if (validation.error)
			return handleError({
				res,
				statusCode: 201,
				err_msg: 'validation Error',
				err: validation.error.message,
				result: 0,
			});

		next();
	} catch (err) {
		logger.info(err.message);
	}
};

export const validateUpdateUserProfile = async (req, res, next) => {
	try {
		const schema = Joi.object({
			email: Joi.string().optional(),
			newPassword: Joi.string().min(6).max(20).optional(),
			oldPassword: Joi.when('newPassword', {
				then: Joi.string().required(),
				otherwise: Joi.string().allow('').optional(),
			}),
			userName: Joi.string().allow('').optional(),
			firstName: Joi.string().allow('').optional(),
			lastName: Joi.string().allow('').optional(),
			name: Joi.string().allow('').optional(),
		});
		const validation = schema.validate(req.body, { abortEarly: false });

		if (validation.error)
			return handleError({
				res,
				statusCode: 201,
				err_msg: 'validation Error',
				err: validation.error.message,
				result: 0,
			});

		next();
	} catch (err) {
		logger.info(err.message);
	}
};
