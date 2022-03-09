import { initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import admin from 'firebase-admin';

import firebaseConfig from '../../../../firebaseAdminSDK.json';
import Notification from './notificationModel.js';

// Initialize firebase
initializeApp({
	credential: admin.credential.cert(firebaseConfig),
});

export const getnotifications = async (id) => {
	const data = await Notification.find({ userId: id }, 'title body -_id');
	return data;
};

export const pushNotifications = async (data) => {
	const notificationData = {
		title: data.title,
		body: data.body,
	};

	await Notification.create({
		...notificationData,
		userId: data.userId,
	});

	const message = {
		notification: notificationData,
		token: data.token,
	};
	await getMessaging().send(message);
	return;
};

export const updateNotifications = async (userId, queryString) => {
	const { markAll, id } = queryString;
	let data;
	if (markAll)
		data = await Notification.updateMany(
			{ userId: userId, isRead: false },
			{ $set: { isRead: true } }
		);
	if (!markAll)
		data = await Notification.updateOne({ _id: id }, { isRead: true });
	if (!data)
		return {
			err_msg: 'Something went wrong please try again',
			statusCode: 400,
		};
	return data;
};
