import {
	createUser,
	getUser,
	updateUser,
	login,
	loggedIn,
	saveWalletAddress,
	checkout,
	transactions,
	loginHistory,
	sendTokensToUser,
} from './userService.js';
import { handleResponse, handleError } from '../../helpers/responseHandler.js';
import logger from '../../config/logger.js';

export const signUp = async (req, res) => {
	try {
		logger.info('Inside signUp Controller');
		const data = await createUser(req.body);
		if (data.err_msg)
			return handleError({
				res,
				statusCode: data.statusCode,
				err_msg: data.err_msg,
			});
		return handleResponse({
			res,
			statusCode: 200,
			msg: 'User signup success',
			data,
		});
	} catch (err) {
		logger.error(err.message);
	}
};

export const getUserProfile = async (req, res) => {
	try {
		logger.info('Inside getUserProfile Controller');
		const data = await getUser(res.locals.user._id);
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

export const updateUserProfile = async (req, res) => {
	try {
		logger.info('Inside updateUserProfile Controller');
		const data = await updateUser(res.locals.user._id, req.body);
		if (data.err_msg)
			return handleError({
				res,
				statusCode: data.statusCode,
				err_msg: data.err_msg,
			});
		return handleResponse({
			res,
			statusCode: 200,
			msg: 'Profile updated successfully',
			data,
		});
	} catch (err) {
		logger.error(err.message);
	}
};

export const userLogin = async (req, res) => {
	try {
		logger.info('Inside userLogin Controller');
		const data = await login(req.body);
		if (data.err_msg)
			return handleError({
				res,
				statusCode: data.statusCode,
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
		logger.error(err.message);
	}
};

export const userLogout = async (req, res) => {
	try {
		logger.info('Inside userLogout Controller');
		res.cookie('jwt', 'loggedout', {
			expires: new Date(Date.now() + 10 * 1000),
			httpOnly: true,
		});
		return handleResponse({
			res,
			statusCode: 200,
			msg: 'Logged out successfully',
		});
	} catch (err) {
		logger.error(err.message);
	}
};

export const isLoggedIn = async (req, res, next) => {
	try {
		logger.info('Inside isLoggedIn Controller');
		let user = {};
		if (process.env.NODE_ENV === 'development') {
			if (req.headers.authorization)
				user = await loggedIn(req.headers.authorization.split(' ')[1]);
			if (!req.headers.authorization)
				user = { err_msg: 'Please login', statusCode: 401 };
		}
		if (process.env.NODE_ENV === 'production') {
			if (req.cookies.jwt) user = await loggedIn(req.cookies.jwt);
			if (!req.cookies.jwt) user = { err_msg: 'Please login', statusCode: 401 };
		}

		if (user.err_msg)
			return handleError({
				res,
				statusCode: user.statusCode,
				err_msg: user.err_msg,
			});

		res.locals.user = user;
		next();
	} catch (err) {
		logger.error(err.message);
		return handleError({
			res,
			statusCode: 400,
			err,
			err_msg: 'Something went wrong please login again',
		});
	}
};

export const storeWalletAddress = async (req, res) => {
	try {
		logger.info('Inside storeWalletAddress Controller');
		const data = await saveWalletAddress(res.locals.user.email, req.body);
		if (data.err_msg)
			return handleError({
				res,
				statusCode: data.statusCode,
				err_msg: data.err_msg,
			});
		return handleResponse({
			res,
			statusCode: 200,
			msg: 'walletAddress saved successfully',
		});
	} catch (err) {
		logger.error(err.message);
	}
};

export const getCheckout = async (req, res) => {
	try {
		logger.info('Inside getCheckout Controller');
		const data = await checkout(req.body);
		return handleResponse({
			res,
			statusCode: 200,
			msg: 'checkout done successfully',
			data,
		});
	} catch (err) {
		logger.error(err.message);
		return handleError({
			res,
			statusCode: 201,
			err,
			err_msg: 'Stripe error',
		});
	}
};

export const getTransactions = async (req, res) => {
	try {
		logger.info('Inside getTransactions Controller');
		const data = await transactions(res.locals.user._id);
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
			msg: 'Transactions fetched successfully',
			data,
		});
	} catch (err) {
		logger.info(err.messsage);
	}
};

export const getLoginHistory = async (req, res) => {
	try {
		logger.info('Inside getLoginHistory Controller');
		const data = await loginHistory(res.locals.user._id);
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
			msg: 'Login history fetched successfully',
			data,
		});
	} catch (err) {
		logger.info(err.messsage);
	}
};

export const sendTokensToUserController = async (req, res) => {
	try {
		logger.info('Inside getReceipt Controller');
		const data = await sendTokensToUser(req.body.recipient, req.body.amount);
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
			msg: 'Transaction done successfully',
			data,
		});
	} catch (err) {
		logger.info(err.messsage);
		handleError({ res, err });
	}
};
