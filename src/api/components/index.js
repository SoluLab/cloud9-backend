import express from 'express';
import admin from './admin/adminRoute.js';
import user from './user/userRoute.js';
import notification from './notification/notificationRoute.js';

const router = express.Router();

router.use('/admin', admin);
router.use('/user', user);
router.use('/notification', notification);

export default router;
