import express from 'express';
import admin from './admin/adminRoute.js';

const router = express.Router();

router.use('/admin', admin);

export default router;
