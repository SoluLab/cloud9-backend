import {
	createUser,
	getUser,
	updateUser,
	login,
	getBalance,
} from './userService.js';
import { handleResponse, handleError } from '../../helpers/responseHandler.js';
import logger from '../../config/logger.js';

export const signUp = async (req, res) => {
	try {
		const data = await createUser(req.body);
		if (data.err_msg)
			return handleError({
				res,
				statusCode: 400,
				err_msg: data.err_msg,
			});
		return handleResponse({
			res,
			statusCode: 201,
			msg: 'User signup success',
			data,
		});
	} catch (err) {
		logger.info(err.message);
	}
};

export const getUserProfile = async (req, res) => {
	try {
		const data = await getUser(req.params.id);
		if (!data)
			return handleError({
				res,
				statusCode: 401,
				err_msg: `User doesn't exist`,
			});
		return handleResponse({
			res,
			statusCode: 200,
			msg: 'Profile fetched successfully',
			data,
		});
	} catch (err) {
		logger.info(err.message);
	}
};

export const updateUserProfile = async (req, res) => {
	try {
		const data = await updateUser(req.params.id, req.body);
		if (data.err_msg)
			return handleError({
				res,
				statusCode: 401,
				err_msg: data.err_msg,
			});
		return handleResponse({
			res,
			statusCode: 200,
			msg: 'Profile updated successfully',
			data,
		});
	} catch (err) {
		logger.info(err.message);
	}
};

export const userLogin = async (req, res) => {
	try {
		const data = await login(req.body);
		if (data.err_msg)
			return handleError({
				res,
				statusCode: 401,
				err_msg: data.err_msg,
			});

		const { token, cookieOptions, user } = data;
		res.cookie('jwt', token, cookieOptions);

		return handleResponse({
			res,
			statusCode: 200,
			msg: 'Logged in  successfully',
			data: { user, token },
		});
	} catch (err) {
		logger.info(err.message);
	}
};

export const getWalletBalance = async (req, res) => {
	try {
		const data = await getBalance(req.params.id);
		if (data.err_msg)
			return handleError({
				res,
				statusCode: 401,
				err_msg: data.err_msg,
			});
		return handleResponse({
			res,
			statusCode: 200,
			msg: 'User Wallet Balance',
			data,
		});
	} catch (err) {
		logger.info(err.message);
	}
};
