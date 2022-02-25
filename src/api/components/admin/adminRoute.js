import express from 'express';
import { getAllUsersController } from './adminController.js';

const router = express.Router();

router.get('/getAllUsers', getAllUsersController);
export default router;
