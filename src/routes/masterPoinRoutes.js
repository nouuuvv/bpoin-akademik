import express from "express";
import {
  createMasterPoin,
  getAllMasterPoin,
  getMasterPoinById,
  updateMasterPoin,
  deleteMasterPoin,
} from "../controllers/masterPoinController.js";
import { authMiddleware, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Mahasiswa & Admin bisa lihat
router.get("/", authMiddleware, getAllMasterPoin);
router.get("/:id", authMiddleware, getMasterPoinById);

// Hanya admin bisa CRUD
router.post("/", authMiddleware, adminOnly, createMasterPoin);
router.put("/:id", authMiddleware, adminOnly, updateMasterPoin);
router.delete("/:id", authMiddleware, adminOnly, deleteMasterPoin);


export default router;
