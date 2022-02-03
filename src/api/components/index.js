import express from 'express';
import admin from './admin/adminRoute.js';
import user from './user/userRoute.js';

const router = express.Router();

router.use('/admin', admin);
router.use('/user', user);

export default router;
