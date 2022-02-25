import express from 'express';
import user from './user/userRoute.js';
import admin from './admin/adminRoute.js';
import notification from './notification/notificationRoute.js';

const router = express.Router();

router.use('/user', user);
router.use('/notification', notification);
router.use('/admin', admin);

export default router;
