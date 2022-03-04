import { sendMail } from '../../helpers/sendEmail.js';
import logger from '../../config/logger.js';
import Subscription from './subscriptionModal.js';

export const subscribeEmailService = async (receiptMail) => {
	try {
		logger.info('Inside subscribeEmail Service');
		const subscriber = await Subscription.findOne({ email: receiptMail });
		if (subscriber)
			return { err_msg: 'Email subscribed already', statusCode: 201 };
		const data = await Subscription.create({ email: receiptMail });
		if (!data)
			return {
				err_msg: 'Something went wrong please try again',
				statusCode: 400,
			};
		return data;
	} catch (error) {
		throw error;
	}
};
