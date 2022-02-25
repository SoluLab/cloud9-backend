import bcrypt from 'bcryptjs';
import User from '../user/userModel.js';
import { default as config } from '../../config/config.js';

const hashPassword = async (password) => {
	password = await bcrypt.hash(password, 12);
	return password;
};

export const signUpService = async () => {
	try {
		let password = '';
		const user = await User.findOne({ email: config.adminCreds.adminEmail });
		if (user) return { err_msg: 'User already exists', statusCode: 201 };
		password = await hashPassword(config.adminCreds.adminPassword);

		const newUser = await User.create({
			email: config.adminCreds.adminEmail,
			password: password,
			name: config.adminCreds.adminName,
			isAdmin: true,
		});
		if (!newUser)
			return {
				err_msg: 'Something went wrong please try again',
				statusCode: 400,
			};
		return { _id: newUser._id, email: newUser.email, name: newUser.name };
	} catch (error) {
		throw error;
	}
};
