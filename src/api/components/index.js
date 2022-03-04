import express from 'express';
import user from './user/userRoute.js';
import admin from './admin/adminRoute.js';
import notification from './notification/notificationRoute.js';
import subscribe from './subscription/subscriptionRoute.js';

const router = express.Router();

router.use('/user', user);
router.use('/notification', notification);
router.use('/admin', admin);
router.use('/subscribe', subscribe);

export default router;
