import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from './userModal.js';

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
		delete body.oldPassword;
		delete body.newPassword;
	}
	if (body.oldPassword) delete body.oldPassword;

	const data = await User.findByIdAndUpdate(id, body);
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
	const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});

	const cookieOptions = {
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
		),
		httpOnly: true,
	};
	if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
	return { token, cookieOptions, user };
};

export const getBalance = async (id) => {
	const user = await User.findById(id).populate('wallet');
	if (!user) return { err_msg: `User doesn't exist` };
	if (!user.wallet.balance) return { err_msg: 'Wallet not activated' };
	return { email: user.email, balance: user.wallet.balance };
};
