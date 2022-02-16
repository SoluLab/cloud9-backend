import { getnotifications, pushNotifications } from './notificationService.js';
import logger from '../../config/logger.js';
import { handleResponse, handleError } from '../../helpers/responseHandler.js';

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

export const pushNotification = async (data) => {
	try {
		logger.info('Inside pushNotifications Controller');
		await pushNotifications(data);
		return;
	} catch (err) {
		logger.info(err.messsage);
	}
};
