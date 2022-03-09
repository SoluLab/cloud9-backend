import express from 'express';
import {
	getAllUsersController,
	getAllTransactionsController,
} from './adminController.js';

const router = express.Router();

router.get('/getAllUsers', getAllUsersController);
router.get('/getAllTransactions', getAllTransactionsController);
export default router;
