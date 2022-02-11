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
	password: {
		type: String,
		required: true,
		select: false,
	},
	passwordChangedAt: Date,
	walletAddress: String,
	transactions: [
		{
			_id: {
				type: mongoose.Schema.Types.ObjectId,
				default: mongoose.Types.ObjectId(),
			},
			date: {
				type: Date,
				default: Date.now(),
			},
			transactionType: String,
			amount: Number,
			currency: String,
			tokens: Number,
			details: String,
		},
	],
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
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: { type: Date },
});

const user = db.model('User', userSchema);

export default user;
