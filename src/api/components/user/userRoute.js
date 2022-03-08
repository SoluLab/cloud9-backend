import express from 'express';
import {
	signUpController,
	getUserProfileController,
	updateUserProfileController,
	userLoginController,
	isLoggedIn,
	userLogoutController,
	storeWalletAddressController,
	getCheckoutController,
	getTransactionsController,
	getLoginHistoryController,
	sendTokensToUserController,
	getWalletBalanceController,
	getPieChartDetailsController,
	uploadProfilePicController,
	getTokenSaleProcessController,
	forgotPasswordController,
	resetPasswordController,
} from './userController.js';
import {
	validateSignup,
	validateUpdateUserProfile,
} from '../../middleware/validator.js';
import { uploadImage } from '../../middleware/uploadImage.js';
import { webhookController } from './userController.js';

const router = express.Router();

router.get('/getPieChartDetails', getPieChartDetailsController);
router.post('/signup', validateSignup, signUpController);
router.get('/profile', isLoggedIn, getUserProfileController);
router.post('/login', userLoginController);
router.post(
	'/updateProfile',
	isLoggedIn,
	validateUpdateUserProfile,
	updateUserProfileController
);
router.get('/logout', isLoggedIn, userLogoutController);
router.post('/storeWalletAddress', isLoggedIn, storeWalletAddressController);
router.post('/checkout', isLoggedIn, getCheckoutController);
router.get('/transactions', isLoggedIn, getTransactionsController);
router.get('/loginHistory', isLoggedIn, getLoginHistoryController);
router.post('/stripe-webhook', webhookController);
router.get(
	'/getWalletBalance/:walletAddress',
	isLoggedIn,
	getWalletBalanceController
);
router.post(
	'/uploadProfilePic',
	isLoggedIn,
	uploadImage,
	uploadProfilePicController
);
router.get('/getTokenSaleProcess', getTokenSaleProcessController);
router.post('/forgotPassword', forgotPasswordController);
router.post('/resetPassword', resetPasswordController);

export default router;
