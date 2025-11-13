import { Router } from "express";
import { LaporanController } from "../controllers/laporanController";
import { authMiddleware } from "../middlewares/auth.middleware";
import { uploadLaporan } from "../config/uploadConfig"; // pastikan ada middleware ini

const router = Router();
const laporanController = new LaporanController();

// ✅ Semua route butuh authentication
router.use(authMiddleware);

router.get("/", laporanController.getAll);
router.get("/:id", laporanController.getById);

router.post(
  "/",
  uploadLaporan.array("photos", 10), // max 10 photos
  laporanController.create
);

router.put(
  "/:id",
  uploadLaporan.array("photos", 10), // max 10 photos
  laporanController.update
);

export default router;
