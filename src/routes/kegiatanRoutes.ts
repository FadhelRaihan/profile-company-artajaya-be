import { Router } from "express";
import { KegiatanController } from "../controllers/kegiatanController";
import { authMiddleware } from "../middlewares/auth.middleware";
import { uploadKegiatan } from "../config/uploadConfig";

const router = Router();
const kegiatanController = new KegiatanController();

// ✅ Semua route butuh authentication
router.use(authMiddleware);

router.get("/", kegiatanController.getAll);
router.get("/inactive", kegiatanController.getAllinActive);
router.get("/active", kegiatanController.getAllActive);
router.get("/:id", kegiatanController.getById);
router.post(
  "/",
  uploadKegiatan.array("photos", 10), // max 10 photos
  kegiatanController.create
);
router.put(
  "/:id",
  uploadKegiatan.array("photos", 10), // max 10 photos
  kegiatanController.update
);

export default router;
