import { getAllUsersService } from './adminService.js';
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
				err_msg: `User doesn't exist`,
			});
		return handleResponse({
			res,
			statusCode: 200,
			msg: 'Profile fetched successfully',
			data,
		});
	} catch (err) {
		logger.error(err.message);
	}
};
