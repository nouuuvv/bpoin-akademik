import MasterPoin from "../models/masterpoinModel.js";

// 🔹 CREATE
export const createMasterPoin = async (req, res) => {
  try {
    const { kode_keg, jenis_kegiatan, deskripsi, bobot_poin } = req.body;

    if (!kode_keg || !jenis_kegiatan || !deskripsi || !bobot_poin) {
      return res.status(400).json({ message: "Semua field wajib diisi." });
    }

    const existing = await MasterPoin.findOne({ where: { kode_keg } });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Kode kegiatan sudah digunakan." });
    }

    const newData = await MasterPoin.create({
      kode_keg,
      jenis_kegiatan,
      deskripsi,
      bobot_poin,
    });

    res.status(201).json({
      message: "Data master poin berhasil ditambahkan.",
      data: newData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 READ (All)
export const getAllMasterPoin = async (req, res) => {
  try {
    const data = await MasterPoin.findAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 READ (By ID)
export const getMasterPoinById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await MasterPoin.findByPk(id);
    if (!data)
      return res.status(404).json({ message: "Data tidak ditemukan." });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 UPDATE
export const updateMasterPoin = async (req, res) => {
  try {
    const { id } = req.params;
    const { kode_keg, jenis_kegiatan, deskripsi, bobot_poin } = req.body;

    const data = await MasterPoin.findByPk(id);
    if (!data)
      return res.status(404).json({ message: "Data tidak ditemukan." });

    await data.update({ kode_keg, jenis_kegiatan, deskripsi, bobot_poin });
    res.json({ message: "Data berhasil diperbarui.", data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 DELETE
export const deleteMasterPoin = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await MasterPoin.findByPk(id);
    if (!data)
      return res.status(404).json({ message: "Data tidak ditemukan." });

    await data.destroy();
    res.json({ message: "Data berhasil dihapus." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
