import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import Stripe from 'stripe';

import User from './userModel.js';

const hashPassword = async (password) => {
	password = await bcrypt.hash(password, 12);
	return password;
};

export const createUser = async (data) => {
	const { email } = data;
	let { password } = data;
	const user = await User.findOne({ email });
	if (user) return { err_msg: 'User already exists' };
	password = await hashPassword(password);

	const newUser = await User.create({
		email,
		password,
	});
	if (!newUser) return { err_msg: 'Something went wrong please try again' };
	return newUser;
};

export const getUser = async (id) => {
	const user = await User.findById(id, 'email username');
	return user;
};

export const updateUser = async (id, body) => {
	const user = await User.findOne({ _id: id }).select('+password');
	if (body.newPassword) {
		if (!(await bcrypt.compare(body.oldPassword, user.password)))
			return { err_msg: 'oldPassword is not correct' };
		body.password = await hashPassword(body.newPassword);
		body.passwordChangedAt = Date.now();
		delete body.newPassword;
		delete body.oldPassword;
	}
	if (body.oldPassword)
		return { err_msg: 'Please provide newPassword to update password' };

	const data = await User.findByIdAndUpdate(id, body);
	if (!data) return { err_msg: 'Something went wrong please try again' };
	return data;
};

export const login = async (body) => {
	const { email, password } = body;
	const user = await User.findOne({ email }).select('+password');
	if (!user)
		return { err_msg: `User doesn't exist with this email please signUp` };

	if (!(await bcrypt.compare(password, user.password)))
		return { err_msg: 'email or password is not correct' };

	delete user.password;
	const token = jwt.sign(
		{ id: user._id, email: user.email },
		process.env.JWT_SECRET,
		{
			expiresIn: process.env.JWT_EXPIRES_IN,
		}
	);

	const cookieOptions = {
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
		),
		httpOnly: true,
	};
	if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
	return { token, cookieOptions, user };
};

export const loggedIn = async (token) => {
	// verify token
	const verifiedToken = await promisify(jwt.verify)(
		token,
		process.env.JWT_SECRET
	);

	// Check if user exists
	const user = await User.findById(verifiedToken.id);
	if (!user) {
		return { err_msg: `User doesn't exists` };
	}

	// Check if user changed password after the jwt_token was issued
	if (
		user.passwordChangedAt &&
		verifiedToken.iat < parseInt(user.passwordChangedAt.getTime() / 1000, 10)
	)
		return { err_msg: 'Password changed please login again' };

	return user;
};

export const saveWalletAddress = async (email, body) => {
	const { walletAddress } = body;
	if (!walletAddress)
		return {
			err_msg: 'Please include walletAddress to save',
			statusCode: 401,
		};
	const data = await User.findOneAndUpdate({ email }, { walletAddress });
	if (!data)
		return {
			err_msg: 'Something went wrong please try again',
			statusCode: 400,
		};
	return data;
};

export const checkout = async (data) => {
	const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

	// Add card by creating paymentMethod
	const { number, exp_month, exp_year, cvc } = data;
	const { id } = await stripe.paymentMethods.create({
		type: 'card',
		card: {
			number,
			exp_month,
			exp_year,
			cvc,
		},
	});

	// Create PaymentIntent
	const { client_secret } = await stripe.paymentIntents.create({
		amount: 2000,
		currency: 'usd',
		payment_method: id,
		description: 'Cloud9',
	});

	return client_secret;
};
