import { getnotifications } from './notificationService.js';
import logger from '../../config/logger.js';

export const getUserNotifications = async (req, res) => {
	try {
		logger.info('Inside notification Controller');
		const data = await getnotifications(res.locals.user._id);
		if (!data)
			return handleError({
				res,
				statusCode: 400,
				err,
				err_msg: 'Something went wrong',
			});
		return handleResponse({
			res,
			statusCode: 200,
			msg: 'notifications fetched successfully',
			data,
		});
	} catch (err) {
		logger.info(err.messsage);
	}
};
