import express from "express";
import {
  createKlaim,
  getAllKlaim,
  getKlaimById,
  updateKlaim,
  deleteKlaim,
  approveKlaim,
} from "../controllers/klaimKegiatanController.js";
import {
  authMiddleware,
  adminOnly,
  mahasiswaOnly,
} from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// 🧑‍🎓 Mahasiswa
router.get("/", authMiddleware, getAllKlaim);
router.get("/:id", authMiddleware, getKlaimById);
router.post(
  "/",
  authMiddleware,
  mahasiswaOnly,
  upload.single("bukti_kegiatan"),
  createKlaim
); // <─ tambahin upload
router.put(
  "/:id",
  authMiddleware,
  mahasiswaOnly,
  upload.single("bukti_kegiatan"),
  updateKlaim
);

// 🧑‍💼 Admin
router.patch("/:id/status", authMiddleware, adminOnly, approveKlaim);
router.delete("/:id", authMiddleware, adminOnly, deleteKlaim);

export default router;
