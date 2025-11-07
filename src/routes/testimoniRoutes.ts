// src/routes/testimoniRoutes.ts
import { Router } from 'express';
import { TestimoniController } from '../controllers/testimoniController';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const testimoniController = new TestimoniController();

// ✅ Semua route butuh authentication
router.use(authMiddleware);

router.get('/', testimoniController.getAll);
router.get('/:id', testimoniController.getById);
router.post('/', testimoniController.create);
router.put('/:id', testimoniController.update);

export default router;