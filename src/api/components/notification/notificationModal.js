import mongoose from 'mongoose';
import db from '../../connections/dbConnection.js';

const notificationSchema = new mongoose.Schema({
	title: {
		type: String,
	},
	body: {
		type: String,
	},
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: { type: Date },
});

const Notification = db.model('Notification', notificationSchema);

export default Notification;
