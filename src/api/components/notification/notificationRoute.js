import express from 'express';
import {
	getUserNotifications,
	updateUserNotifications,
} from './notificationController.js';
import { isLoggedIn } from '../user/userController.js';
const router = express.Router();

router.get('/getNotifications', isLoggedIn, getUserNotifications);
router.get('/updateNotifications', isLoggedIn, updateUserNotifications);

export default router;
