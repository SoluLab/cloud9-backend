import mongoose from 'mongoose';
import db from '../../connections/dbConnection.js';

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		unique: true,
		required: true,
	},
	firstName: String,
	lastName: String,
	userName: String,
	profilePic: String,
	name: String,
	companyName: String,
	password: {
		type: String,
		required: true,
		select: false,
	},
	passwordChangedAt: Date,
	walletAddress: String,
	loginHistory: [
		{
			_id: {
				type: mongoose.Schema.Types.ObjectId,
				default: mongoose.Types.ObjectId(),
			},
			date: {
				type: Date,
				default: Date.now(),
			},
			browser: String,
			ip: String,
			region: String,
			status: String,
		},
	],
	isAdmin: {
		type: Boolean,
		default: false,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: { type: Date },
});

const user = db.model('User', userSchema);

export default user;
