import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Mahasiswa from "./mahasiswaModel.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nim: {
      type: DataTypes.STRING,
      allowNull: true, // bisa null untuk admin
      unique: true,
      references: {
        model: Mahasiswa,
        key: "nim",
      },
      index: true,
    },
    nip: {
      type: DataTypes.STRING,
      allowNull: true, // hanya untuk admin
      unique: true,
      index: true,
    },
    nama: {
      type: DataTypes.STRING,
      allowNull: true, // mahasiswa bisa ambil dari relasi
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true, // mahasiswa ambil dari tabel mahasiswa
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("admin", "mahasiswa"),
      defaultValue: "mahasiswa",
    },
  },
  {
    tableName: "users",
  }
);


export default User;
