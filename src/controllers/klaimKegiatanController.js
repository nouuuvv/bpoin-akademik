import KlaimKegiatan from "../models/klaimKegiatanModel.js";
import Mahasiswa from "../models/mahasiswaModel.js";
import MasterPoin from "../models/masterPoinModel.js";

// ✅ CREATE (otomatis ambil poin dari MasterPoin)
export const createKlaim = async (req, res) => {
  try {
    const {
      nim,
      nama_mhs,
      periode_pengajuan,
      tanggal_pengajuan,
      kode_kegiatan,
      rincian_acara,
      tingkat,
      tempat,
      tanggal_pelaksanaan,
      mentor,
      narasumber,
      bukti_kegiatan,
    } = req.body;

    if (
      !nim ||
      !nama_mhs ||
      !periode_pengajuan ||
      !tanggal_pengajuan ||
      !kode_kegiatan ||
      !rincian_acara ||
      !tingkat ||
      !tempat ||
      !tanggal_pelaksanaan ||
      !bukti_kegiatan
    ) {
      return res.status(400).json({ message: "Semua field wajib diisi." });
    }

    // 🔍 cari bobot poin dari master
    const master = await MasterPoin.findOne({
      where: { kode_keg: kode_kegiatan },
    });
    if (!master)
      return res
        .status(400)
        .json({ message: "Kode kegiatan tidak ditemukan di Master Poin." });

    // 🔍 validasi mahasiswa
    const mahasiswa = await Mahasiswa.findOne({ where: { nim } });
    if (!mahasiswa)
      return res
        .status(400)
        .json({ message: "Mahasiswa dengan NIM tersebut tidak ditemukan." });

    // 🚀 create klaim baru
    const data = await KlaimKegiatan.create({
      nim,
      nama_mhs,
      periode_pengajuan,
      tanggal_pengajuan,
      kode_kegiatan,
      rincian_acara,
      tingkat,
      tempat,
      tanggal_pelaksanaan,
      mentor,
      narasumber,
      bukti_kegiatan,
      poin: master.bobot_poin,
      status: "Diajukan", // default
    });

    res.status(201).json({
      message: "✅ Klaim kegiatan berhasil ditambahkan.",
      data,
    });
  } catch (err) {
    console.error("❌ ERROR createKlaim:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ READ ALL (include Mahasiswa & MasterPoin)
export const getAllKlaim = async (req, res) => {
  try {
    let whereCondition = {};

    // kalau mahasiswa, cuma lihat klaim miliknya
    if (req.user.role === "mahasiswa") {
      whereCondition.nim = req.user.nim;
    }

    const data = await KlaimKegiatan.findAll({
      where: whereCondition,
      include: [
        { model: Mahasiswa, attributes: ["nim", "nama_mhs", "angkatan"] },
        {
          model: MasterPoin,
          attributes: ["kode_keg", "jenis_kegiatan", "bobot_poin"],
        },
      ],
      order: [["no", "DESC"]],
    });

    res.json({
      message: "Data klaim kegiatan berhasil diambil.",
      total: data.length,
      data,
    });
  } catch (err) {
    console.error("❌ ERROR getAllKlaim:", err);
    res.status(500).json({ message: err.message });
  }
};


// ✅ READ BY ID
export const getKlaimById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await KlaimKegiatan.findByPk(id, {
      include: [Mahasiswa, MasterPoin],
    });

    if (!data)
      return res.status(404).json({ message: "Data tidak ditemukan." });

    // mahasiswa tidak boleh lihat klaim orang lain
    if (req.user.role === "mahasiswa" && data.nim !== req.user.nim) {
      return res.status(403).json({ message: "Akses klaim ditolak." });
    }

    res.json({ message: "Data klaim ditemukan.", data });
  } catch (err) {
    console.error("❌ ERROR getKlaimById:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ UPDATE (untuk mahasiswa edit klaim mereka)
export const updateKlaim = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const klaim = await KlaimKegiatan.findByPk(id);
    if (!klaim)
      return res.status(404).json({ message: "Data tidak ditemukan." });

    // ❌ larang ubah status langsung (kecuali admin)
    if ("status" in updates) delete updates.status;

    await klaim.update(updates);
    res.json({ message: "✅ Data klaim berhasil diperbarui.", klaim });
  } catch (err) {
    console.error("❌ ERROR updateKlaim:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ APPROVAL KHUSUS ADMIN
export const approveKlaim = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, catatan_revisi } = req.body;

    // validasi status
    const allowedStatus = ["Disetujui", "Ditolak", "Revisi"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Status tidak valid." });
    }

    // ambil data klaim
    const klaim = await KlaimKegiatan.findByPk(id);
    if (!klaim) {
      return res.status(404).json({ message: "Klaim tidak ditemukan." });
    }

    // kalau status = Revisi, boleh isi catatan (optional)
    klaim.status = status;
    klaim.catatan_revisi = status === "Revisi" ? catatan_revisi || null : null;

    await klaim.save();

    res.json({
      message:
        status === "Revisi"
          ? "Klaim dikembalikan untuk revisi."
          : `Klaim berhasil diupdate menjadi ${status}.`,
      klaim,
    });
  } catch (err) {
    console.error("❌ ERROR approveKlaim:", err);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

// ✅ DELETE
export const deleteKlaim = async (req, res) => {
  try {
    const { id } = req.params;
    const klaim = await KlaimKegiatan.findByPk(id);
    if (!klaim)
      return res.status(404).json({ message: "Data tidak ditemukan." });

    await klaim.destroy();
    res.json({ message: "🗑️ Klaim kegiatan berhasil dihapus." });
  } catch (err) {
    console.error("❌ ERROR deleteKlaim:", err);
    res.status(500).json({ message: err.message });
  }
};
