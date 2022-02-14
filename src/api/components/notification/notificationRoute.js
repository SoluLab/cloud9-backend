import express from 'express';
import { getUserNotifications } from './notificationController.js';

const router = express.Router();

router.get('/getNotifications', getUserNotifications);

export default router;
