import mongoose from 'mongoose';
import db from '../../connections/dbConnection.js';

const subscriptionSchema = new mongoose.Schema({
	email: {
		type: String,
		unique: true,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: { type: Date },
});

const subscription = db.model('Subscription', subscriptionSchema);

export default subscription;
