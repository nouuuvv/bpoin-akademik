import express from "express";
import {
  getAllMahasiswa,
  getMahasiswaById,
  createMahasiswa,
  updateMahasiswa,
  deleteMahasiswa,
  getMahasiswaMe,
} from "../controllers/mahasiswaController.js";
import { authMiddleware, adminOnly } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Semua khusus admin
router.get("/", authMiddleware, adminOnly, getAllMahasiswa);
router.get("/me", authMiddleware, getMahasiswaMe);
router.get("/:id", authMiddleware, getMahasiswaById);
router.post(
  "/",
  authMiddleware,
  adminOnly,
  upload.single("foto"),
  createMahasiswa
);
router.put(
  "/:id",
  authMiddleware,
  adminOnly,
  upload.single("foto"),
  updateMahasiswa
);
router.delete("/:id", authMiddleware, adminOnly, deleteMahasiswa);

export default router;
