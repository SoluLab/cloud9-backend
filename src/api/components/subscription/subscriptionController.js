import { handleResponse, handleError } from '../../helpers/responseHandler.js';
import logger from '../../config/logger.js';

import { subscribeEmailService } from './subscriptionService.js';

export const subscribeEmailController = async (req, res) => {
	try {
		logger.info('Inside subscribeEmail Controller');
		const data = await subscribeEmailService(req.body.email);
		if (data.err_msg)
			return handleError({
				res,
				statusCode: data.statusCode,
				err_msg: data.err_msg,
			});
		return handleResponse({
			res,
			statusCode: 200,
			msg: 'Subscribed successfully',
			data: data.email,
		});
	} catch (error) {
		logger.info(error.message);
		return handleError({ res, error });
	}
};
