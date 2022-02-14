import { initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import admin from 'firebase-admin';

import logger from '../../config/logger.js';
import firebaseConfig from '../../../../firebaseAdminSDK.json';
import Notification from './notificationModal.js';

export const getnotifications = async (id) => {
	const data = await Notification.find({ userId: id });
	return data;
};

export const pushNotification = async (data) => {
	try {
		initializeApp({
			credential: admin.credential.cert(firebaseConfig),
		});

		const notificationData = {
			title: data.title,
			body: data.body,
		};
		const message = {
			notification: notificationData,
			token: res.locals.user.firebaseClientToken,
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
	} catch (err) {
		logger.info(err.messsage);
	}
};
