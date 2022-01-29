import express from 'express';
import { createAdminApi } from './adminController.js';

const router = express.Router();

router.post('/', createAdminApi);

export default router;
