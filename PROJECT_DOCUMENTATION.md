# 🎓 Uyarvu-Payanam (உயர்வு பயணம்): Comprehensive Project Documentation & Architecture Blueprint

> **Vision:** "Ascending Journey" — A data-driven, interactive, and personalized career guidance and academic milestone ecosystem for students in Tamil Nadu (Class 5 to 12).

---

## 💡 Executive Summary & Key Insights

**Uyarvu-Payanam** bridges the critical information gap faced by students and parents during major academic transition points (Post-5th, Post-8th, Post-10th, and Post-12th). Unlike traditional static information portals, Uyarvu-Payanam functions as a full-stack, data-driven career intelligence engine powered by automated document ingestion, real-time WebSocket notifications, personalized interest-matching assessments, and interactive gamification.

### 🌟 Key Insights & Standout Features

1. **Hyper-Localized Educational Focus (Tamil Nadu)**
   - Tailored specifically to Tamil Nadu’s education ecosystem (TNEA counseling cutoffs, polytechnic admissions, Arts & Science, Medical/Siddha/Ayurveda, Law, Agriculture, and District-wise college categorization).

2. **Milestone-Based Career Progression (Class 5 to 12)**
   - **Class 5**: Curiosity building, foundational career awareness, voice-based communication passports, and skill micro-games (Pattern Master, Story Builder, Treasure Hunt, Song Maker).
   - **Class 8**: Stream pre-selection, Olympiad preparedness, subject-to-profession mapping.
   - **Class 10**: Stream choice guidance (Math/Biology vs. Commerce vs. Vocational/Diploma/ITI).
   - **Class 12**: Degree discovery, entrance exam alerts, branch cutoff prediction, and scholarship search.

3. **Data Engineering & Automated Ingestion Pipelines**
   - Custom utility importers (`diplomaImporter`, `artsScienceImporter`, `medicalImporter`, `siddhaImporter`, `ayurvedaImporter`, `pdfParser`) process complex PDF matrices, Excel files, and CSV datasets on backend startup to automatically seed database records.

4. **Multi-Tenant Architecture (Student Portal + Unified Admin Hub)**
   - Separate state and route isolation for students and administrators.
   - Socket.io integration with room-based pub-sub architecture (`admins` room for admin sync, `students` / `user_<id>` for broadcast & targeted push alerts).

5. **Gamified & Interactive Student Engagement**
   - Student daily missions, habits tracking, badge achievements, voice recording submissions, and interactive assessments.

---

## 🏗️ System Architecture & Technology Stack

```
                                    ┌───────────────────────────────────┐
                                    │      React 19 + Vite Frontend     │
                                    │ (Vanilla CSS, Framer Motion,      │
                                    │  Recharts, Lucide, React Router) │
                                    └─────────────────┬─────────────────┘
                                                      │ HTTP / WebSocket
                                                      ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│                                Node.js + Express 5 Backend                                    │
│                                                                                               │
│ ┌──────────────────────┐   ┌──────────────────────┐   ┌─────────────────────────────────────┐ │
│ │ Auth & Security      │   │ Real-Time (Socket.io)│   │ Data Ingestion Pipelines            │ │
│ │ (JWT, Bcrypt, CORS)  │   │ Admin / Student Rooms│   │ (PDF Parse, XLSX, CSV-Parser)       │ │
│ └──────────────────────┘   └──────────────────────┘   └─────────────────────────────────────┘ │
└──────────────────────────────────────────────┬────────────────────────────────────────────────┘
                                               │ Mongoose ODM
                                               ▼
                                 ┌───────────────────────────┐
                                 │   MongoDB Atlas Database  │
                                 │   (34 Specialized Models) │
                                 └───────────────────────────┘
```

### Stack Components
- **Frontend**: React 19, React Router 7, Vite 5, Tailwind CSS 4 & Vanilla CSS, Framer Motion, Recharts, jsPDF + jsPDF-AutoTable, Canvas-Confetti, Socket.io-client.
- **Backend**: Node.js, Express 5, Mongoose 9, Socket.io 4, JWT, BcryptJS, Multer (file uploads), Nodemailer, Web-Push, Cheerio, Axios.
- **Database**: MongoDB Atlas (`uyarvuPayanam` database).

---

## 🧩 Core Functional Modules

### 1. Student Guidance & Milestone Hub
- **Milestone Navigation**: Dedicated routes for `/class5`, `/class8`, `/class10`, `/class12`.
- **Content Detail Pages**: Structured learning cards, video links, career scopes, and requirements.
- **Class 5 Gamification Suite**:
  - `Communication Skills Passport`: Audio recording exercise storing student voice recordings.
  - `Pattern Master`: Pattern recognition logic game.
  - `Drawing Challenge`: Interactive canvas-based creativity tool.
  - `Story Builder`: Narrative construction exercise.
  - `Make Your Own Song`: Audio element creation game.
  - `Treasure Hunt`: Gamified quiz quest.

### 2. Institution & Course Discovery Engine
- **College Directory**: Search, filter by district, management type (Government, Aided, Self-Financing), and NAAC accreditation.
- **College-Course Mapper**: Maps specific degree programs (e.g., B.E. Computer Science, B.Tech AI&DS, B.Sc Agri) directly to verified offering institutions.
- **TNEA Cutoff Analysis**: Historical and current year TNEA Engineering cutoffs categorized by community quotas (OC, BC, BCM, MBC, SC, SCA, ST).

### 3. Financial Aid & Entrance Exam Portal
- **Scholarship Repository**: Deadlines, eligibility criteria (income, gender, community, academic score), application links, and status tracking.
- **Entrance Exams Tracker**: Exam dates, registration deadlines, syllabus overview, and preparation guides (JEE, NEET, TNEA, NATA, CLAT, ICAR, etc.).

### 4. Dynamic Assessment & Personalization Engine
- **Onboarding Quiz**: Interactive stream & career interest evaluation tool.
- **Recommendation Engine**: Custom algorithm matching student quiz answers to ideal academic streams and career directions.

### 5. Unified Administrative Management Hub
- **Overview Dashboard**: High-level telemetry, student sign-up metrics, top searched courses/colleges, pending mentor requests.
- **Course & College Management**: Complete CRUD interface with bulk Excel/CSV import capabilities (`BulkImportCoursesModal`, `SourceImportModal`).
- **Notification Center**: System-wide notifications broadcast via Socket.io and Web Push.
- **Mentor & Admission Help Desks**: Ticket management workflow for student advisory requests.

---

## 🗄️ Database Schema & Models Reference (34 Collections)

| Model Name | Primary Purpose | Key Fields |
| :--- | :--- | :--- |
| `User.js` / `Student.js` / `Admin.js` | User authentication & role management | `name`, `email`, `password`, `role`, `classLevel`, `targetDistrict` |
| `CareerPath.js` | Milestones & progression pathways | `title`, `level` (5th, 8th, 10th, 12th), `ageGroup`, `careerDirections`, `description` |
| `Course.js` | Master catalog of courses | `courseName`, `level`, `duration`, `eligibility`, `futureScope` |
| `College.js` | Educational institution directory | `collegeCode`, `name`, `district`, `type`, `accreditation`, `website` |
| `CollegeCourseMapping.js` | College-to-Course relationships | `collegeId`, `courseId`, `intake`, `accredited` |
| `Cutoff.js` | TNEA cutoff records | `collegeCode`, `branchCode`, `community`, `cutoffMarks`, `year` |
| `Scholarship.js` | Financial aid programs | `title`, `provider`, `amount`, `deadline`, `eligibilityCriteria`, `link` |
| `Exam.js` | Entrance & competitive exams | `name`, `level`, `category`, `examDate`, `registrationDeadline`, `syllabus` |
| `AssessmentQuestion.js` / `OnboardingQuestion.js` | Profiling questions | `questionText`, `options`, `targetLevel`, `category` |
| `Recommendation.js` | Personalization results | `studentId`, `suggestedStreams`, `suggestedCareers`, `confidenceScore` |
| `ClassContent.js` / `CommunicationContent.js` | Educational modules per class | `title`, `slug`, `level`, `category`, `contentBlocks`, `mediaUrl` |
| `StudentBadge.js` / `StudentDailyMission.js` / `Habit.js` | Gamification elements | `studentId`, `badgeType`, `missionName`, `streakCount`, `completed` |
| `MentorRequest.js` / `AdmissionHelpRequest.js` | Student inquiry tickets | `studentId`, `subject`, `message`, `status` (Pending/Resolved) |
| `Notification.js` / `AdminNotification.js` | Messaging alerts | `recipientId`, `title`, `message`, `isRead`, `type` |

---

## 🤖 Data Ingestion & Automated Script Suite

The `backend/utils` and `backend/scripts` folders host automated ingestion workers that process raw government data into normalized database models:

- **Importers (`backend/utils/`)**:
  - `diplomaImporter.js`: Auto-loads Polytechnic CSV records.
  - `artsScienceImporter.js`: Auto-parses Arts & Science Excel sheets.
  - `medicalImporter.js` / `siddhaImporter.js` / `ayurvedaImporter.js`: Ingests AYUSH & Medical college datasets.
  - `pdfParser.js`: Extracts tabular data from TNEA and college PDF handouts.

- **Seeder Scripts (`backend/scripts/`)**:
  - `seedAllExams.js`, `seedClass5Exams.js`, `seedExams12.js`: Populates nationwide & state-level entrance exam data.
  - `seedClass5Fun.js`, `seedClass5Games.js`, `seedClass5Skills.js`: Populates gamified activities for 5th-grade students.
  - `importTNEACutoffs.js`, `sync2024.js`: Syncs TNEA engineering rank & cutoff datasets.
  - `importAgricultureColleges.js`, `importLawColleges.js`, `insertMassiveManagementColleges.js`: Populates specialized professional college registries.

---

## 🛠️ How to Run & Develop

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account or local MongoDB instance

### 1. Backend Setup
```bash
cd backend
npm install
# Ensure .env is configured with MONGO_URI, JWT_SECRET, PORT=5000
npm run dev
```
*Backend will run at `http://localhost:5000` with WebSocket support enabled.*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend will run at `http://localhost:5173`.*

---

## 📌 Summary
**Uyarvu-Payanam** combines full-stack modern web technologies (React 19, Node Express, Socket.io, MongoDB) with dedicated Tamil Nadu educational datasets and age-tailored student experiences. It empowers students with data clarity while giving counselors and administrators control over real-time updates.
