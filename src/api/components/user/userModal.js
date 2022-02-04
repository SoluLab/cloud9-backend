import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			unique: true,
			required: true,
		},
		firstName: String,
		lastName: String,
		userName: String,
		password: {
			type: String,
			required: true,
			select: false,
		},
		wallet: String,
	},

	{
		timestamps: true,
	}
);

const User = mongoose.model('User', userSchema);

export default User;
