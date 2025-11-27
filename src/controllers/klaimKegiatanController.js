// src/controllers/klaimKegiatanController.js
import KlaimKegiatan from "../models/klaimKegiatanModel.js";
import Mahasiswa from "../models/mahasiswaModel.js";
import MasterPoin from "../models/masterPoinModel.js";

// ===============================
// CREATE KLAIM (Mahasiswa)
// ===============================
export const createKlaim = async (req, res) => {
  try {
    console.log("===== DEBUG CREATE KLAIM =====");
    console.log("req.user =", req.user);
    console.log("body =", req.body);
    console.log("file =", req.file);
    const mahasiswa_id = req.user?.mahasiswa_id;

    if (!mahasiswa_id) {
      return res.status(401).json({
        message:
          "mahasiswa_id tidak ditemukan pada token. Silakan login ulang atau hubungi admin.",
      });
    }

    const {
      masterpoin_id,
      periode_pengajuan,
      tanggal_pengajuan,
      rincian_acara,
      tingkat,
      tempat,
      tanggal_pelaksanaan,
      mentor,
      narasumber,
    } = req.body;

    const bukti_kegiatan = req.file ? req.file.filename : null;

    if (
      !masterpoin_id ||
      !periode_pengajuan ||
      !tanggal_pengajuan ||
      !rincian_acara ||
      !tingkat ||
      !tempat ||
      !tanggal_pelaksanaan ||
      !bukti_kegiatan
    ) {
      return res.status(400).json({ message: "Semua field wajib diisi." });
    }

    const mahasiswa = await Mahasiswa.findByPk(mahasiswa_id);
    if (!mahasiswa) {
      return res.status(400).json({ message: "Mahasiswa tidak ditemukan." });
    }

    const master = await MasterPoin.findByPk(masterpoin_id);
    if (!master) {
      return res.status(400).json({ message: "Master poin tidak ditemukan." });
    }

    const klaim = await KlaimKegiatan.create({
      mahasiswa_id,
      masterpoin_id,
      periode_pengajuan,
      tanggal_pengajuan,
      rincian_acara,
      tingkat,
      tempat,
      tanggal_pelaksanaan,
      mentor,
      narasumber,
      bukti_kegiatan,
      poin: master.bobot_poin,
      status: "Diajukan",
    });
    
    res.status(201).json({
      message: "Klaim berhasil dibuat.",
      data: klaim,
    });
  } catch (err) {
    console.error("ERROR createKlaim:", err);
    res.status(500).json({ message: err.message });
  }
};



// ===============================
// GET ALL KLAIM
// ===============================
export const getAllKlaim = async (req, res) => {
  try {
    const whereCondition = {};

    // mahasiswa hanya boleh lihat klaim sendiri
    if (req.user.role === "mahasiswa") {
      whereCondition.mahasiswa_id = req.user.mahasiswa_id;
    }

    const data = await KlaimKegiatan.findAll({
      where: whereCondition,
      include: [
        {
          model: Mahasiswa,
          as: "mahasiswa",
          attributes: ["id_mhs", "nama_mhs", "angkatan", "foto", "total_poin"],
        },
        {
          model: MasterPoin,
          as: "masterPoin",
          attributes: ["id_poin", "kode_keg", "jenis_kegiatan", "bobot_poin"],
        },
      ],
      order: [["id", "DESC"]],
    });

    res.json({
      message: "Data klaim berhasil diambil.",
      total: data.length,
      data,
    });
  } catch (err) {
    console.error("ERROR getAllKlaim:", err);
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// GET KLAIM BY ID
// ===============================
export const getKlaimById = async (req, res) => {
  try {
    const { id } = req.params;

    const klaim = await KlaimKegiatan.findByPk(id, {
      include: [
        {
          model: Mahasiswa,
          as: "mahasiswa",
          attributes: ["id_mhs", "nim","nama_mhs"],
        },
        {
          model: MasterPoin,
          as: "masterPoin",
          attributes: ["id_poin", "kode_keg", "jenis_kegiatan", "bobot_poin"],
        },
      ],
    });

    if (!klaim) {
      return res.status(404).json({ message: "Klaim tidak ditemukan." });
    }

    // mahasiswa hanya boleh melihat klaim miliknya sendiri
    if (
      req.user.role === "mahasiswa" &&
      klaim.mahasiswa_id !== req.user.mahasiswa_id
    ) {
      return res.status(403).json({ message: "Akses klaim ditolak." });
    }

    res.json({ message: "Data klaim ditemukan.", data: klaim });
  } catch (err) {
    console.error("ERROR getKlaimById:", err);
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// UPDATE KLAIM (Mahasiswa revisi)
// ===============================
export const updateKlaim = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (req.file) updates.bukti_kegiatan = req.file.filename;

    const klaim = await KlaimKegiatan.findByPk(id);
    if (!klaim)
      return res.status(404).json({ message: "Klaim tidak ditemukan." });

    // mahasiswa only
    if (req.user.role === "mahasiswa") {
      if (klaim.mahasiswa_id !== req.user.mahasiswa_id)
        return res.status(403).json({ message: "Akses ditolak." });

      if (klaim.status !== "Revisi") {
        return res.status(400).json({
          message: "Hanya klaim berstatus Revisi yang boleh diperbarui.",
        });
      }

      const allowed = [
        "periode_pengajuan",
        "tanggal_pengajuan",
        "rincian_acara",
        "tingkat",
        "tempat",
        "tanggal_pelaksanaan",
        "mentor",
        "narasumber",
        "bukti_kegiatan",
      ];

      const sanitized = {};
      allowed.forEach((k) => {
        if (updates[k]) sanitized[k] = updates[k];
      });

      await klaim.update(sanitized);

      klaim.status = "Diajukan ulang";
      klaim.catatan_revisi = null;
      await klaim.save();

      return res.json({
        message: "Klaim berhasil diperbarui dan diajukan ulang.",
        data: klaim,
      });
    }

    return res
      .status(403)
      .json({ message: "Hanya mahasiswa yang boleh update klaim ini." });
  } catch (err) {
    console.error("ERROR updateKlaim:", err);
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// ADMIN APPROVAL
// ===============================
export const approveKlaim = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, catatan_revisi } = req.body;

    const allowedStatus = ["Disetujui", "Ditolak", "Revisi"];
    if (!allowedStatus.includes(status))
      return res.status(400).json({ message: "Status tidak valid." });

    const klaim = await KlaimKegiatan.findByPk(id);
    if (!klaim)
      return res.status(404).json({ message: "Klaim tidak ditemukan." });

    // Status = Disetujui => tambahkan poin
    if (status === "Disetujui" && klaim.status !== "Disetujui") {
      const mahasiswa = await Mahasiswa.findByPk(klaim.mahasiswa_id);

      mahasiswa.total_poin = (mahasiswa.total_poin || 0) + (klaim.poin || 0);

      await mahasiswa.save();
    }

    // Status Revisi => simpan catatan
    klaim.status = status;
    klaim.catatan_revisi = status === "Revisi" ? catatan_revisi : null;

    await klaim.save();

    res.json({
      message: `Klaim diupdate menjadi ${klaim.status}`,
      data: klaim,
    });
  } catch (err) {
    console.error("ERROR approveKlaim:", err);
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// DELETE KLAIM
// ===============================
export const deleteKlaim = async (req, res) => {
  try {
    const { id } = req.params;

    const klaim = await KlaimKegiatan.findByPk(id);
    if (!klaim)
      return res.status(404).json({ message: "Klaim tidak ditemukan." });

    await klaim.destroy();

    res.json({ message: "Klaim berhasil dihapus." });
  } catch (err) {
    console.error("ERROR deleteKlaim:", err);
    res.status(500).json({ message: err.message });
  }
};
