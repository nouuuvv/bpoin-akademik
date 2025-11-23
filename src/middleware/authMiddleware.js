// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const JWT_SECRET = process.env.JWT_SECRET || "please-change-this";

export const authMiddleware = async (req, res, next) => {
  let token =
    req.cookies.token ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null);

  if (!token) {
    return res.status(401).json({ message: "Harus login dulu." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Simpan payload langsung
    req.user = {
      id: decoded.id,
      role: decoded.role,
      nim: decoded.nim,
      nip: decoded.nip,
    };

    next();
  } catch (err) {
    return res
      .status(403)
      .json({ message: "Token tidak valid atau kadaluarsa." });
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
