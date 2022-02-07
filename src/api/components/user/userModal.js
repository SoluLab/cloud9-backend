import mongoose from 'mongoose';
import db from '../../connections/dbConnection.js';

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
		passwordChangedAt: Date,
		wallet: String,
	},

	{
		timestamps: true,
	}
);

const user = db.model('User', userSchema);

export default user;
