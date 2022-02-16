import express from 'express';
import { getUserNotifications } from './notificationController.js';
import { isLoggedIn } from '../user/userController.js';
const router = express.Router();

router.get('/getNotifications', isLoggedIn, getUserNotifications);

export default router;
