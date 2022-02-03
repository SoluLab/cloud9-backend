import User from './userModal.js';

export const createUser = async (data) => {
	const { email, password, confirmPassword } = data;
	const newUser = await User.create({
		email,
		password,
		confirmPassword,
	});
	return newUser;
};

export const getUser = async (id) => {
	const user = await User.findById(id);
	return user;
};

export const updateUser = async (id, body) => {
	const user = await User.findByIdAndUpdate(id, body);
	return user;
};
