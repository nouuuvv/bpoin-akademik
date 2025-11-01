// src/models/associations.js
import Mahasiswa from "./mahasiswaModel.js";
import User from "./userModel.js";

// Relasi antara Mahasiswa dan User
Mahasiswa.hasOne(User, {
  foreignKey: "nim",
  sourceKey: "nim",
  onDelete: "CASCADE",
});

User.belongsTo(Mahasiswa, {
  foreignKey: "nim",
  targetKey: "nim",
});

export { Mahasiswa, User };
