import express from 'express';
import { subscribeEmailController } from './subscriptionController.js';

const router = express.Router();

router.post('/subscribeEmail', subscribeEmailController);

export default router;
