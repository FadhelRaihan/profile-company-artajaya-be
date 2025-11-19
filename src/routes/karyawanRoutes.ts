import { Router } from "express";
import { KaryawanController } from "../controllers/karyawanController";
import { authMiddleware } from "../middlewares/auth.middleware";
import { uploadKaryawan } from "../config/uploadConfig";

const router = Router();
const karyawanController = new KaryawanController();

// ✅ Semua route butuh authentication
router.use(authMiddleware);

router.get("/", karyawanController.getAll);
router.get("/inactive", karyawanController.getAllInactive);
router.get("/active", karyawanController.getAllActive);
router.get("/:id", karyawanController.getById);
router.post(
  "/",
  uploadKaryawan.single("photo"), // single photo upload
  karyawanController.create
);
router.put(
  "/:id",
  uploadKaryawan.single("photo"), // single photo upload (optional)
  karyawanController.update
);
router.patch("/:id/soft-delete", karyawanController.softDelete);
router.patch("/:id/restore", karyawanController.restore);
router.delete("/:id", karyawanController.hardDelete);

export default router;