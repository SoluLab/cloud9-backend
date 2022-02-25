import {
	getAllUsersService,
	getAllTransactionsService,
} from './adminService.js';
import { handleResponse, handleError } from '../../helpers/responseHandler.js';
import logger from '../../config/logger.js';

export const getAllUsersController = async (req, res) => {
	logger.info('Inside getAllUsers Controller');
	try {
		const data = await getAllUsersService();
		if (!data)
			return handleError({
				res,
				statusCode: 201,
				err_msg: `Users doesn't exist`,
			});
		return handleResponse({
			res,
			statusCode: 200,
			msg: 'All Users fetched successfully',
			data,
		});
	} catch (err) {
		logger.error(err.message);
	}
};
export const getAllTransactionsController = async (req, res) => {
	logger.info('Inside getAllTransactions Controller');
	try {
		const data = await getAllTransactionsService();
		if (data.err_msg)
			return handleError({
				res,
				statusCode: 201,
				err: data.err,
				err_msg: data.err_msg,
			});
		return handleResponse({
			res,
			statusCode: 200,
			msg: 'All Transactions fetched successfully',
			data,
		});
	} catch (err) {
		console.log(err);
		logger.error(err.message);
	}
};
