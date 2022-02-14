import express from 'express';
import {
	signUp,
	getUserProfile,
	updateUserProfile,
	userLogin,
	isLoggedIn,
	userLogout,
	storeWalletAddress,
	getCheckout,
	getTransactions,
	getLoginHistory,
	sendTokensToUserController,
} from './userController.js';
import {
	validateSignup,
	validateUpdateUserProfile,
} from '../../middleware/validator.js';

const router = express.Router();

router.post('/signup', validateSignup, signUp);
router.get('/profile', isLoggedIn, getUserProfile);
router.post('/login', userLogin);
router.post(
	'/updateProfile',
	isLoggedIn,
	validateUpdateUserProfile,
	updateUserProfile
);
router.get('/logout', isLoggedIn, userLogout);
router.post('/storeWalletAddress', isLoggedIn, storeWalletAddress);
router.post('/checkout', isLoggedIn, getCheckout);
router.get('/transactions', isLoggedIn, getTransactions);
router.get('/loginHistory', isLoggedIn, getLoginHistory);
router.post('/sendTokensToUser', sendTokensToUserController);

export default router;
