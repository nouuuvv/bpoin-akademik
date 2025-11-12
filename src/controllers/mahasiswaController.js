import Mahasiswa from "../models/mahasiswaModel.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

// ✅ Get all mahasiswa
export const getAllMahasiswa = async (req, res) => {
  try {
    const data = await Mahasiswa.findAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get mahasiswa by ID
export const getMahasiswaById = async (req, res) => {
  try {
    const data = await Mahasiswa.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: "Mahasiswa not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE Mahasiswa (admin only) -> otomatis create User
export const createMahasiswa = async (req, res) => {
  try {
    const payload = req.body;

    // Tambahkan path foto dari upload
    const foto = req.file ? `/uploads/${req.file.filename}` : null;

    if (!payload.nim || !payload.nama_mhs) {
      return res.status(400).json({ message: "nim dan nama_mhs wajib diisi." });
    }

    const exist = await Mahasiswa.findOne({ where: { nim: payload.nim } });
    if (exist)
      return res
        .status(400)
        .json({ message: "Mahasiswa dengan NIM tersebut sudah ada." });

    // gabung payload + foto
    const mahasiswa = await Mahasiswa.create({ ...payload, foto });

    // buat user otomatis -> password default = nim (hash)
    const hashedPassword = await bcrypt.hash(mahasiswa.nim, 10);
    const userExist = await User.findOne({ where: { nim: mahasiswa.nim } });
    if (!userExist) {
      await User.create({
        nim: mahasiswa.nim,
        password: hashedPassword,
        role: "mahasiswa",
      });
    }

    res
      .status(201)
      .json({ message: "Mahasiswa & akun berhasil dibuat.", mahasiswa });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ✅ Update mahasiswa
export const updateMahasiswa = async (req, res) => {
  try {
    const data = await Mahasiswa.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: "Mahasiswa not found" });

    // ambil body dulu
    let updates = req.body;

    // Jika ada foto baru
    if (req.file) {
      const newFoto = `/uploads/${req.file.filename}`;
      const oldFoto = data.foto;

      updates.foto = newFoto;

      // hapus foto lama kalo ada
      if (oldFoto) {
        const filePath = path.join("public", oldFoto.replace("/uploads/", ""));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } else {
      // ❗ Kalau gak upload foto, jangan ubah field foto
      updates.foto = data.foto;
    }

    // update data
    await data.update(updates);

    // ambil ulang biar fresh
    const updatedMahasiswa = await Mahasiswa.findByPk(req.params.id);

    res.json(updatedMahasiswa);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};




// ✅ Delete mahasiswa
export const deleteMahasiswa = async (req, res) => {
  try {
    const data = await Mahasiswa.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: "Mahasiswa not found" });
    await data.destroy();
    res.json({ message: "Mahasiswa deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
