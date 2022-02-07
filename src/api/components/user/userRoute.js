import express from 'express';
import {
	signUp,
	getUserProfile,
	updateUserProfile,
	userLogin,
	isLoggedIn,
	userLogout,
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

export default router;
