// src/routes/klaimKegiatanRoutes.js
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

// semua harus auth dulu
router.get("/", authMiddleware, getAllKlaim);
router.get("/:id", authMiddleware, getKlaimById);

// Mahasiswa: create & edit revisi (upload bukti pdf/image)
router.post(
  "/",
  authMiddleware,
  mahasiswaOnly,
  upload.single("bukti_kegiatan"),
  createKlaim
);
router.put(
  "/:id",
  authMiddleware,
  mahasiswaOnly,
  upload.single("bukti_kegiatan"),
  updateKlaim
);

// Admin: patch status & delete
router.patch("/:id/status", authMiddleware, adminOnly, approveKlaim);
router.delete("/:id", authMiddleware, adminOnly, deleteKlaim);

export default router;
