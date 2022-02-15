import { initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import admin from 'firebase-admin';

import firebaseConfig from '../../../../firebaseAdminSDK.json';
import Notification from './notificationModel.js';

export const getnotifications = async (id) => {
	const data = await Notification.find({ userId: id });
	return data;
};

export const pushNotifications = async (data) => {
	initializeApp({
		credential: admin.credential.cert(firebaseConfig),
	});

	const notificationData = {
		title: data.title,
		body: data.body,
	};
	const message = {
		notification: notificationData,
		token: res.locals.user.firebaseToken,
	};

	const result = await getMessaging().send(message);
	if (result) {
		await Notification.create({
			...notificationData,
			userId: res.locals.user._id,
		});
		return result;
	}
	return;
};
