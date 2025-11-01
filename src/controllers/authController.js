import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Mahasiswa from "../models/mahasiswaModel.js";
import { Op } from "sequelize";

const JWT_SECRET = process.env.JWT_SECRET || "please-change-this";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

// 🔹 LOGIN (bisa pakai NIM atau NIP)
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    // identifier bisa NIM (mahasiswa) atau NIP (admin)

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ message: "NIM/NIP dan password wajib diisi." });
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [{ nim: identifier }, { nip: identifier }],
      },

      include: { model: Mahasiswa },
    });

    if (!user)
      return res.status(404).json({ message: "User tidak ditemukan." });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Password salah." });

    // Buat token JWT
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        nim: user.nim,
        nip: user.nip,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      message: "Login berhasil.",
      token,
      role: user.role,
      user: {
        id: user.id,
        nama: user.nama || user.Mahasiswa?.nama,
        nim: user.nim,
        nip: user.nip,
        email: user.email || user.Mahasiswa?.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 🔹 GET PROFILE (berdasarkan token)
export const getProfile = async (req, res) => {
  try {
    const { role, nim, nip } = req.user;

    let data;
    if (role === "mahasiswa") {
      data = await Mahasiswa.findOne({ where: { nim } });
    } else {
      data = await User.findOne({ where: { nip } });
    }

    if (!data)
      return res.status(404).json({ message: "Data tidak ditemukan." });

    res.json({ message: "Profile ditemukan.", data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 GANTI PASSWORD
export const changePassword = async (req, res) => {
  try {
    const { id } = req.user;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword)
      return res
        .status(400)
        .json({ message: "Old & new password wajib diisi." });

    const user = await User.findByPk(id);
    if (!user)
      return res.status(404).json({ message: "User tidak ditemukan." });

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) return res.status(401).json({ message: "Old password salah." });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password berhasil diubah." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// 🔹 LOGOUT
export const logout = async (req, res) => {
  try {
    // Hapus cookie token
    res.clearCookie("token", { httpOnly: true, sameSite: "strict" });
    return res.status(200).json({ message: "Logout berhasil." });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Gagal logout." });
  }
};
