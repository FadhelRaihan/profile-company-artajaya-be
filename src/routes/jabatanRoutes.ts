import { Router } from "express";
import { JabatanController } from "../controllers/jabatanController";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const jabatanController = new JabatanController();

// ✅ Semua route butuh authentication
router.use(authMiddleware);

router.get("/", jabatanController.getAll);
router.get("/inactive", jabatanController.getAllinActive);
router.get("/active", jabatanController.getAllActive);
router.get("/:id", jabatanController.getById);
router.post("/",jabatanController.create);
router.put("/:id",jabatanController.update);

export default router;
