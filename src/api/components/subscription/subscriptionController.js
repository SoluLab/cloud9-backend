import { handleResponse, handleError } from '../../helpers/responseHandler.js';
import logger from '../../config/logger.js';

import { subscribeEmailService } from './subscriptionService.js';

export const subscribeEmailController = async (req, res) => {
	try {
		logger.info('Inside subscribeEmail Controller');
		const data = await subscribeEmailService(req.body.email);
		if (data[0].statusCode === 202)
			return handleResponse({
				res,
				statusCode: 200,
				msg: 'Subscribed successfully',
			});
		return handleError({
			res,
			statusCode: 400,
			err,
			err_msg: 'Something went wrong',
		});
	} catch (error) {
		logger.info(error.message);
		return handleError({ res, error });
	}
};
