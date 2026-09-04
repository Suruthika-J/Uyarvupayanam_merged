const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const path = require("path");

dotenv.config();
connectDB().then(() => {
  try {
    const { importDiplomaCSV } = require("./utils/diplomaImporter");
    importDiplomaCSV(false).catch(err => console.error("Error in auto diploma import:", err));
  } catch (err) {
    console.error("Failed to require/run diploma importer on startup:", err);
  }
  try {
    const { importArtsScienceExcel } = require("./utils/artsScienceImporter");
    importArtsScienceExcel(false).catch(err => console.error("Error in auto Arts & Science import:", err));
  } catch (err) {
    console.error("Failed to require/run Arts & Science importer on startup:", err);
  }
  try {
    const { importMedicalExcel } = require("./utils/medicalImporter");
    importMedicalExcel(false).catch(err => console.error("Error in auto Medical import:", err));
  } catch (err) {
    console.error("Failed to require/run Medical importer on startup:", err);
  }
  try {
    const { importSiddhaExcel } = require("./utils/siddhaImporter");
    importSiddhaExcel(false).catch(err => console.error("Error in auto Siddha import:", err));
  } catch (err) {
    console.error("Failed to require/run Siddha importer on startup:", err);
  }
  try {
    const { importAyurvedaExcel } = require("./utils/ayurvedaImporter");
    importAyurvedaExcel(false).catch(err => console.error("Error in auto Ayurveda import:", err));
  } catch (err) {
    console.error("Failed to require/run Ayurveda importer on startup:", err);
  }
});

const app = express();
const server = http.createServer(app);

// ─── CORS Origins ───────────────────────────────────────────────────
const devOrigins = ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"];
const productionOrigin = process.env.FRONTEND_URL || "";
const allowedOrigins = process.env.NODE_ENV === "production" && productionOrigin
  ? [productionOrigin]
  : devOrigins;

const corsOriginValidator = (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, true);
  } else {
    callback(new Error("CORS policy: Origin not allowed"));
  }
};

// ─── Socket.io setup ────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: corsOriginValidator,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Store io on the app object so controllers can access it via req.app.get("io")
app.set("io", io);

io.on("connection", (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // ── Admin connection ─────────────────────────────────────────────
  // Admin clients join the "admins" room for multi-tab state sync.
  // Admin does NOT join "students" or any "user_<id>" room.
  socket.on("join_admin", () => {
    socket.join("admins");
    console.log(`🔑 Admin socket ${socket.id} joined [admins] room`);
  });

  // ── Student connection ───────────────────────────────────────────
  // Students emit "join_student" with their userId.
  // They join TWO rooms:
  //   1. "students"       → shared room for broadcast notifications
  //   2. "user_<userId>"  → personal room for targeted notifications
  // Admin clients do NOT call this event, so admin is NEVER in these rooms
  // and will NEVER receive user notification socket events.
  socket.on("join_student", (userId) => {
    socket.join("students");           // shared broadcast room
    socket.join(`user_${userId}`);     // personal room
    console.log(`🎓 Student ${userId} joined rooms: students, user_${userId}`);
  });

  // Legacy support: if old client code calls join_user_room
  socket.on("join_user_room", (userId) => {
    socket.join("students");
    socket.join(`user_${userId}`);
    console.log(`📌 Socket ${socket.id} joined room: user_${userId}`);
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// ── Middleware ──────────────────────────────────────────────────────
app.use(cors({
  origin: corsOriginValidator,
  credentials: true,
}));{userId} joined rooms: students, user_${userId}`);
  });

  // Legacy support: if old client code calls join_user_room
  socket.on("join_user_room", (userId) => {
    socket.join("students");
    socket.join(`user_${userId}`);
    console.log(`ðŸ“Œ Socket ${socket.id} joined room: user_${userId}`);
  });

  socket.on("disconnect", () => {
    console.log(`ðŸ”Œ Socket disconnected: ${socket.id}`);
  });
});

// â”€â”€ Middleware â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
<<<<<<< HEAD
app.use(cors({
  origin: corsOriginValidator,
  credentials: true,
}));
=======
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy: Origin not allowed"));
      }
    },
    credentials: true,
  })
);
>>>>>>> origin/blackboxai/fix-cutoff-pagination
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// â”€â”€ Routes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/settings", require("./routes/settingsRoutes"));
app.use("/api/career-paths", require("./routes/careerPathRoutes"));
app.use("/api/cutoffs", require("./routes/cutoffRoutes"));
app.use("/api/cutoff", require("./routes/cutoffRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/exams", require("./routes/examRoutes"));
app.use("/api/colleges", require("./routes/collegeRoutes"));
app.use("/api/scholarships", require("./routes/scholarshipRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/admin/notifications", require("./routes/adminNotificationRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/class-content", require("./routes/classContentRoutes"));
app.use("/api/cutoffs", require("./routes/cutoffRoutes"));
app.use("/api/user-actions", require("./routes/userActionRoutes"));
app.use("/api/college-courses", require("./routes/collegeCourseRoutes"));
app.use("/api/mentor-requests", require("./routes/mentorRequestRoutes"));
app.use("/api/assessment", require("./routes/assessmentRoutes"));
app.use("/api/onboarding", require("./routes/onboardingRoutes"));
app.use("/api/admission-help", require("./routes/admissionHelpRoutes"));
app.use("/api/class5-communication", require("./routes/class5CommunicationRoutes"));
app.use("/api/communication-content", require("./routes/communicationContentRoutes"));

// â”€â”€ Start â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`ðŸš€ Server + Socket.io running on port ${PORT}`)
);
