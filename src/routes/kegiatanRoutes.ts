import { Router } from 'express';
import { KegiatanController } from '../controllers/kegiatanController';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const kegiatanController = new KegiatanController();

// ✅ Semua route butuh authentication
router.use(authMiddleware);

router.get('/', kegiatanController.getAll);
router.get('/:id', kegiatanController.getById);
router.post('/', kegiatanController.create);
router.put('/:id', kegiatanController.update);

export default router;