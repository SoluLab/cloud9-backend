import express from 'express';
import { signUp, getUserProfile, updateUserProfile } from './userController.js';

const router = express.Router();

router.post('/signup', signUp);
router.get('/userProfile/:id', getUserProfile);
router.post('/updateProfile/:id', updateUserProfile);

export default router;
