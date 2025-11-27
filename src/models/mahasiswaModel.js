import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Mahasiswa = sequelize.define("Mahasiswa", {
  id_mhs: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nim: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  nama_mhs: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  prodi: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  angkatan: {
    type: DataTypes.STRING,
  },
  target_poin: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
  },
  total_poin: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  tgl_lahir: {
    type: DataTypes.DATEONLY,
  },
  pekerjaan: {
    type: DataTypes.STRING,
  },
  alamat: {
    type: DataTypes.STRING,
  },
  asal_sekolah: {
    type: DataTypes.STRING,
  },
  thn_lulus: {
    type: DataTypes.STRING,
  },
  tlp_saya: {
    type: DataTypes.STRING,
  },
  tlp_rumah: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.STRING,
  },
  foto: {
    type: DataTypes.STRING,
  },
});

export default Mahasiswa;
