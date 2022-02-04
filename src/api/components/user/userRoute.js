import express from 'express';
import {
	signUp,
	getUserProfile,
	updateUserProfile,
	getWalletBalance,
	userLogin,
} from './userController.js';
import {
	validateSignup,
	validateUpdateUserProfile,
} from '../../middleware/validator.js';

const router = express.Router();

router.post('/signup', validateSignup, signUp);
router.get('/userProfile/:id', getUserProfile);
router.post('/login', userLogin);
router.post('/updateProfile/:id', validateUpdateUserProfile, updateUserProfile);
router.get('/walletBalance/:id', getWalletBalance);

export default router;
