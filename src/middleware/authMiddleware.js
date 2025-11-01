// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const JWT_SECRET = process.env.JWT_SECRET || "please-change-this";

// 🔹 Middleware utama untuk validasi token
export const authMiddleware = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Harus login dulu untuk mengakses resource ini.",
    });
  }

  const token = auth.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Akun tidak ditemukan atau sudah dihapus.",
      });
    }

    req.user = {
      id: user.id,
      role: user.role,
      nim: user.nim,
      nip: user.nip,
      nama: user.nama,
    };

    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: "Token tidak valid atau sudah kedaluwarsa.",
    });
  }
};

// 🔹 Middleware khusus admin
export const adminOnly = (req, res, next) => {
  if (!req.user)
    return res.status(401).json({
      success: false,
      message: "Harus login dulu.",
    });

  if (req.user.role !== "admin")
    return res.status(403).json({
      success: false,
      message: "Akses ditolak. Hanya admin yang bisa melakukan aksi ini.",
    });

  next();
};

// 🔹 Middleware khusus mahasiswa
export const mahasiswaOnly = (req, res, next) => {
  if (!req.user)
    return res.status(401).json({
      success: false,
      message: "Harus login dulu.",
    });

  if (req.user.role !== "mahasiswa")
    return res.status(403).json({
      success: false,
      message: "Akses ditolak. Hanya mahasiswa yang bisa melakukan aksi ini.",
    });

  next();
};
