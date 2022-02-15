import { initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import admin from 'firebase-admin';

import firebaseConfig from '../../../../firebaseAdminSDK.json';
import Notification from './notificationModal.js';

export const getnotifications = async (id) => {
	const data = await Notification.find({ userId: id });
	return data;
};

export const pushNotifications = async (data) => {
	initializeApp({
		credential: admin.credential.cert(firebaseConfig),
	});

	const notificationData = {
		title: 'data.title',
		body: 'data.body',
	};
	const message = {
		notification: notificationData,
		token:
			'BNdLxhDptTOs_89f--Zmry_6K2eTvqIo9rKDHtY20xutAyOi8zye1IFtmmhGa4das9keN-ctxlfWdpF5IkVzm00',
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
