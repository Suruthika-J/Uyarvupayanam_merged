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
  try {
    const { seedTaxonomyData } = require("./utils/taxonomySeeder");
    const { seedCollegeCareers } = require("./utils/collegeCareerSeeder");
    const { seedCollegeQuestions } = require("./seeders/seedCollegeQuestions");
    seedTaxonomyData().catch(err => console.error("Error in taxonomy seeding:", err));
    seedCollegeCareers().catch(err => console.error("Error in college careers seeding:", err));
    seedCollegeQuestions().catch(err => console.error("Error in college questions seeding:", err));
  } catch (err) {
    console.error("Failed to require/run seeders on startup:", err);
  }
});

const app = express();
const server = http.createServer(app);

// ─── CORS Origins ───────────────────────────────────────────────────
const devOrigins = ["http://localhost:5173", "http://localhost:5174"];
const productionOrigin = process.env.FRONTEND_URL || "";
const allowedOrigins = process.env.NODE_ENV === "production" && productionOrigin
  ? [productionOrigin]
  : devOrigins;

const corsOriginValidator = (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, true);
  } else {
    callback(new Error("Not allowed by CORS"));
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
  console.log(`ðŸ”Œ Socket connected: ${socket.id}`);

  // â”€â”€ Admin connection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Admin clients join the "admins" room for multi-tab state sync.
  // Admin does NOT join "students" or any "user_<id>" room.
  socket.on("join_admin", () => {
    socket.join("admins");
    console.log(`ðŸ” Admin socket ${socket.id} joined [admins] room`);
  });

  // â”€â”€ Student connection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Students emit "join_student" with their userId.
  // They join TWO rooms:
  //   1. "students"       â†’ shared room for broadcast notifications
  //   2. "user_<userId>"  â†’ personal room for targeted notifications
  // Admin clients do NOT call this event, so admin is NEVER in these rooms
  // and will NEVER receive user notification socket events.
  socket.on("join_student", (userId) => {
    socket.join("students");           // shared broadcast room
    socket.join(`user_${userId}`);     // personal room
    console.log(`ðŸŽ“ Student ${userId} joined rooms: students, user_${userId}`);
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
app.use(cors({
  origin: corsOriginValidator,
  credentials: true,
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// â”€â”€ Routes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/admin/college", require("./routes/collegeAdminRoutes"));
app.use("/api/settings", require("./routes/settingsRoutes"));
app.use("/api/career-paths", require("./routes/careerPathRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/exams", require("./routes/examRoutes"));
app.use("/api/colleges", require("./routes/collegeRoutes"));
app.use("/api/scholarships", require("./routes/scholarshipRoutes"));
app.use("/api/college-scholarships", require("./routes/collegeScholarshipRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/admin/notifications", require("./routes/adminNotificationRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/class-content", require("./routes/classContentRoutes"));
app.use("/api/cutoffs", require("./routes/cutoffRoutes"));
app.use("/api/user-actions", require("./routes/userActionRoutes"));
app.use("/api/assessment", require("./routes/grokAssessmentRoutes"));
app.use("/api/study-tools", require("./routes/collegeStudyToolsRoutes"));
app.use("/api/college-courses", require("./routes/collegeCourseRoutes"));
app.use("/api/mentor-requests", require("./routes/mentorRequestRoutes"));
app.use("/api/assessment", require("./routes/assessmentRoutes"));
app.use("/api/onboarding", require("./routes/onboardingRoutes"));
app.use("/api/college-onboarding", require("./routes/collegeOnboardingRoutes"));
app.use("/api/graduate", require("./routes/graduateRoutes"));
app.use("/api/college-profile", require("./routes/collegeProfileRoutes"));
app.use("/api/college-advisor", require("./routes/collegeAdvisorRoutes"));
app.use("/api/taxonomy", require("./routes/taxonomyRoutes"));
app.use("/api/admission-help", require("./routes/admissionHelpRoutes"));
app.use("/api/class5-communication", require("./routes/class5CommunicationRoutes"));
app.use("/api/communication-content", require("./routes/communicationContentRoutes"));

// â”€â”€ Start â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`ðŸš€ Server + Socket.io running on port ${PORT}`)
);
