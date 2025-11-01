import { DataTypes } from "sequelize";
import db from "../config/db.js";
import Mahasiswa from "./mahasiswaModel.js";
import MasterPoin from "./masterPoinModel.js";

const KlaimKegiatan = db.define(
  "KlaimKegiatan",
  {
    no: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nim: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nama_mhs: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    periode_pengajuan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tanggal_pengajuan: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    kode_kegiatan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rincian_acara: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tingkat: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tempat: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tanggal_pelaksanaan: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    mentor: {
      type: DataTypes.STRING,
    },
    narasumber: {
      type: DataTypes.STRING,
    },
    bukti_kegiatan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    poin: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Diajukan", "Revisi", "Disetujui", "Ditolak"),
      defaultValue: "Diajukan",
    },
    catatan_revisi: {
      type: DataTypes.TEXT,
      allowNull: true, // opsional
    },
  },
  {
    tableName: "klaim_kegiatan",
    timestamps: false,
  }
);

// relasi opsional
KlaimKegiatan.belongsTo(Mahasiswa, { foreignKey: "nim", targetKey: "nim" });
KlaimKegiatan.belongsTo(MasterPoin, {
  foreignKey: "kode_kegiatan",
  targetKey: "kode_keg",
});

export default KlaimKegiatan;
