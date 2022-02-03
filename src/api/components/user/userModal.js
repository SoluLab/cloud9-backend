import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
// eslint-disable-next-line no-unused-vars
import validator from 'validator';

const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			unique: true,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		confirmPassword: {
			type: String,
			required: [true, 'Please confirm your password'],
			validate: {
				validator(el) {
					return el === this.password;
				},
				message: 'Passwords are not the same!',
			},
		},
	},
	{
		timestamps: true,
	}
);

userSchema.pre('save', async function (next) {
	this.password = await bcrypt.hash(this.password, 12);
	// Delete confirmPassword field
	this.confirmPassword = undefined;
	next();
});

const User = mongoose.model('User', userSchema);

export default User;
