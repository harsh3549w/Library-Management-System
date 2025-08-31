import express from 'express';
import { getClientImages } from '../controllers/clientController.js';

const router = express.Router();

router.get('/images', getClientImages);

export default router;
