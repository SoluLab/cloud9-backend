import { createUser, getUser, updateUser } from './userService.js';
import { handleResponse, handleError } from '../../helpers/responseHandler.js';
import logger from '../../config/logger.js';

export const signUp = async (req, res) => {
	try {
		const user = await createUser(req.body);
		if (!user) return handleError(res, 400, 'something went wrong');
		return handleResponse({
			res,
			statusCode: 200,
			msg: 'User signup success',
			user,
		});
	} catch (err) {
		logger.info(err);
	}
};

export const getUserProfile = async (req, res) => {
	try {
		const userData = await getUser(req.params.id);
		if (!userData)
			return handleError({
				res,
				statusCode: 401,
				err_msg: `User doesn't exist`,
			});
		return handleResponse({
			res,
			statusCode: 200,
			msg: 'Profile fetched successfully',
			userData,
		});
	} catch (err) {
		logger.info(err);
	}
};

export const updateUserProfile = async (req, res) => {
	try {
		const updatedUser = await updateUser(req.params.id, req.body);
		if (!updatedUser)
			return handleError({
				res,
				statusCode: 400,
				err_msg: `something went wrong`,
			});
		return handleResponse({
			res,
			statusCode: 200,
			msg: 'Profile fetched successfully',
			userData,
		});
	} catch (err) {
		logger.info(err);
	}
};
