import {
	getnotifications,
	pushNotifications,
	updateNotifications,
} from './notificationService.js';
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

export const updateUserNotifications = async (req, res) => {
	logger.info('Inside updateUserNotifications Controller');
	try {
		const data = await updateNotifications(res.locals.user._id, req.query);
		if (data.err_msg)
			return handleError({
				res,
				statusCode: data.statusCode,
				err_msg: data.err_msg,
			});
		return handleResponse({
			res,
			statusCode: 200,
			msg: 'Notifications updated successfully',
		});
	} catch (err) {
		logger.error(err.message);
	}
};
