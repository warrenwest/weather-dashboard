import { Router } from 'express';
import weatherRoutes from './weatherRoutes.js';  // Adjust path if needed

const router = Router();

// Mount the weather routes on '/api/weather'
router.use('/weather', weatherRoutes);

export default router;
