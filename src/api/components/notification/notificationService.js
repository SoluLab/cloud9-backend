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
		userId: res.locals.user._id,
	});

	const message = {
		notification: notificationData,
		token:
			'eKU31mQsKU9q:APA91bE7VB0knfs7keWGtfUOWCCfc7-kEeSL4Z90gvys9s0BJul74nIG_H9WDO6RTtdlNYuehKoHU8c3zjL3PwipFttLVA798oVStYFWC8uSA9uF6Sy3-vsQi4qfpGVgxfWZeYQKUS5l',
	};
	await getMessaging().send(message);
	return;
};
