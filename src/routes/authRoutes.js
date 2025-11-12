import express from "express";
import {
  login,
  getProfile,
  changePassword,
  logout, // <── tambahin ini
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { Mahasiswa, User } from "../models/associations.js";

const router = express.Router();

router.post("/login", login);
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    if (!req.mahasiswa || !req.mahasiswa.nim) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const mahasiswa = await Mahasiswa.findOne({
      where: { nim: req.mahasiswa.nim },
      include: [{ model: User }], // include relasi User
    });

    if (!mahasiswa) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.json({ data: mahasiswa });
  } catch (error) {
    console.error("Error get profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


router.put("/change-password", authMiddleware, changePassword);
router.post("/logout", authMiddleware, logout); // <── ini route logout

export default router;
