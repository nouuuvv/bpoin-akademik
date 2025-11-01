import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import sequelize from "./config/db.js";
import bcrypt from "bcryptjs";
import User from "./models/userModel.js";
import "./models/associations.js"; 
import cookieParser from "cookie-parser";

// Import routes
import mahasiswaRoutes from "./routes/mahasiswaRoutes.js";
import masterPoinRoutes from "./routes/masterPoinRoutes.js";
import klaimKegiatanRoutes from "./routes/klaimKegiatanRoutes.js";
import authRoutes from "./routes/authRoutes.js";


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/mahasiswa", mahasiswaRoutes);
app.use("/api/masterpoin", masterPoinRoutes);
app.use("/api/klaim", klaimKegiatanRoutes);
app.use("/uploads", express.static("uploads"));

// 🔸 Auto sync + seed admin
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");
    const isProduction = process.env.NODE_ENV === "production";

    // Gunakan `alter` hanya kalau di dev lokal
    await sequelize.sync({
      alter: !isProduction,
      force: false,
    });
    console.log(
      `✅ Database synced (${isProduction ? "production" : "development"} mode)`
    );


    const adminExist = await User.findOne({ where: { role: "admin" } });
    if (!adminExist) {
      const adminPass = process.env.ADMIN_PASSWORD || "admin123";
      const hashed = await bcrypt.hash(adminPass, 10);

      await User.create({
        nip: "1234567890",
        nama: "Admin Kemahasiswaan",
        email: "kemahasiswaan@kampus.ac.id",
        password: hashed,
        role: "admin",
      });

      console.log("✅ Admin default dibuat (nip: 1234567890 / pass: admin123)");
    } else {
      console.log("ℹ️ Admin sudah ada, skip seed.");
    }

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error("❌ Gagal konek ke database:", err);
    process.exit(1);
  }
})();

