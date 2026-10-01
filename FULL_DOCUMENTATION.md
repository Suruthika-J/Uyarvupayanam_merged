# Uyarvu Payanam - Complete Project Documentation

## 1. PROJECT OVERVIEW
"Uyarvu Payanam" (Tamil: Journey of Excellence) is a full-stack AI-powered education guidance
platform for students in Tamil Nadu, India. It covers 3 life stages:

  - Class 5 Students      : Gamified subject learning (Maths, Science, Social, English, Tamil)
  - Class 8/10/12 Students: Career discovery via AHP+Fuzzy Logic, college/cutoff guidance
  - College Students      : AI advisor, skill gap, resume builder, interview prep, mentorship
  - Graduates             : Career readiness, placement, upskilling, competitive exam prep

## 2. TECH STACK

BACKEND (Node.js + Express)
  - Express ^5.2.1        : REST API server
  - MongoDB + Mongoose    : Database (105 collections)
  - Socket.io ^4.8.3      : Real-time notifications
  - jsonwebtoken          : JWT auth
  - bcryptjs              : Password hashing
  - nodemailer            : OTP email + password reset
  - multer                : File uploads
  - pdf-parse, pdfjs-dist : PDF text extraction
  - xlsx                  : Excel parsing
  - cheerio               : HTML scraping
  - puppeteer             : Browser automation
  - csv-parser, csvtojson : CSV import
  - jspdf                 : PDF generation
  - web-push              : Push notifications

FRONTEND (React + Vite)
  - React ^19.2.0         : UI framework
  - Vite ^5.4.0           : Build tool
  - React Router DOM ^7   : Client-side routing
  - Framer Motion ^12     : Animations
  - Recharts ^3.8.1       : Charts/data visualization
  - Socket.io Client      : Real-time updates
  - Axios                 : HTTP requests
  - react-icons           : Icon library
  - jspdf + autotable     : PDF resume export
  - canvas-confetti       : Gamification celebrations
  - xlsx                  : Excel export

## 3. ARCHITECTURE

  backend/
    server.js           - Entry point, routes, Socket.io, auto-seeders
    config/db.js        - MongoDB connection
    models/  (105)      - Mongoose schemas
    routes/  (45)       - Express route files
    controllers/ (49)   - Request handlers
    services/ (19)      - AI engines (AHP, LDNBS, gap detection)
    utils/ (17)         - Helpers (importers, AHP calc, OTP)
    seeders/            - DB content seeders
    middleware/         - JWT auth middleware
    uploads/            - Uploaded files

  frontend/src/
    App.jsx             - Root router: /admin/* vs all else
    admin/              - Admin panel (38 pages)
      context/          - AdminAuthContext, NotificationContext
      pages/            - All admin UI pages
    student/
      StudentRoutes.jsx - All student URL routing
      layouts/          - StudentLayout, CollegeStudentLayout
      context/          - StudentAuthContext
      pages/            - All student pages (21 folders)
      components/       - Reusable components (12 folders)
      student.css       - Global student styles (27KB)

## 4. USER ROLES & AUTH SYSTEM

ROLES (stored in User model):
  role=admin   + userType=N/A              => Admin panel user
  role=student + userType=school_student   => Class 5/8/10/12 student
  role=student + userType=college_student  => Undergraduate student
  role=student + userType=graduate         => Post-grad / job seeker

AUTH FLOW:
  1. POST /api/auth/register
     - Creates User in MongoDB
     - Hashes password with bcryptjs
     - Sends 6-digit OTP via nodemailer
  2. POST /api/auth/verify-otp
     - Validates OTP from OtpCode model
     - Marks user as verified
  3. POST /api/auth/login
     - Checks email + password (bcrypt compare)
     - Returns JWT token -> stored in localStorage
     - Frontend reads userType to redirect to correct dashboard
  4. POST /api/auth/forgot-password
     - Creates PasswordResetToken, emails reset link
  5. POST /api/auth/reset-password/:token
     - Validates token, updates password hash

JWT MIDDLEWARE:
  - All protected routes check: Authorization: Bearer <token>
  - Attaches req.user to every protected request

FRONTEND AUTH CONTEXTS:
  - AdminAuthContext (admin/context/AuthContext.jsx)
    : Admin login state, guards /admin/* routes
  - StudentAuthContext (student/context/StudentAuthContext.jsx)
    : Student login state + userType + profile data
## 5. Backend API Routes

The backend exposes 45 route groups mounted in server.js. Below are key route domains:

### 5.1 Authentication & Profiles
*   /api/auth (authRoutes.js): Login, register, OTP verification, password reset.
*   /api/student-profile (studentProfileRoutes.js): Manage school student profiles.
*   /api/graduate-profile (graduateProfileRoutes.js): Manage graduate profiles.
*   /api/college-student-profile (collegeStudentProfileRoutes.js): Manage college student profiles.

### 5.2 Educational Data (Colleges, Courses, Scholarships)
*   /api/colleges (collegeRoutes.js): College directory, search, filtering.
*   /api/courses (courseRoutes.js): Course directory and details.
*   /api/scholarships (scholarshipRoutes.js): Scholarship listings and eligibility.
*   /api/import (importRoutes.js): Bulk data import for colleges (Medical, Arts, Diploma, etc.).

### 5.3 Class 5 Subject Modules
*   /api/class5/maths (mathsRoutes.js): Math quizzes, games, progress.
*   /api/class5/science (scienceRoutes.js): Science concepts, interactives.
*   /api/class5/social (socialRoutes.js): Social science topics.
*   /api/class5/english (englishRoutes.js): English vocabulary and grammar.
*   /api/class5/tamil (tamilRoutes.js): Tamil language exercises.

### 5.4 Career & Assessment
*   /api/ahp (ahpRoutes.js): Analytic Hierarchy Process based career recommendations.
*   /api/ldnbs (ldnbsRoutes.js): Learning Diagnosis & Next Best Skill assessments.
*   /api/careers (careerRoutes.js): Career paths, roles, and trends.

### 5.5 Gamification & Community
*   /api/gamification (gamificationRoutes.js): Points, badges, leaderboards.
*   /api/forums (forumRoutes.js): Community discussions and Q&A.
*   /api/chat (chatRoutes.js): Direct messaging.

## 6. Database Models (105 total)

The MongoDB schema comprises 105 Mongoose models. Key domains include:

### 6.1 Users & Auth
*   User.js: Core user account (email, password hash, role).
*   StudentProfile.js, GraduateProfile.js, CollegeStudentProfile.js: Role-specific extended profiles.
*   Admin.js: Admin credentials and permissions.

### 6.2 Educational Entities
*   College.js: Name, location, type (Arts, Medical, etc.), ranking, facilities.
*   Course.js: Syllabus, duration, eligibility.
*   Scholarship.js: Eligibility criteria, deadlines, amounts.

### 6.3 Assessments & Algorithms
*   AhpFuzzyQuestion.js: Questions for career assessment.
*   AhpResponse.js: Student responses and weights.
*   LdnbsRecord.js: Diagnosis records for skill tracking.

### 6.4 Gamification
*   Badge.js: Earnable badges.
*   UserProgress.js: XP and level tracking.
*   LeaderboardEntry.js: Points ranking.

## 7. Backend Services (19 total)

Backend services abstract business logic from controllers:
*   hpCalculator.js: Computes pairwise comparison matrices and eigenvectors for career ranking.
*   hpFuzzyEngine.js: Applies fuzzy logic to AHP results for handling uncertainty.
*   ldnbsOrchestrator.js: Manages the flow of the Learning Diagnosis system.
*   emailService.js: Wraps Nodemailer for OTPs and notifications.
*   
otificationService.js: In-app and Socket.io real-time notifications.
*   importService.js: Parses and ingests CSV/Excel data for colleges.

## 8. Backend Utilities (17 total)

*   generateToken.js: JWT creation.
*   passwordUtils.js: bcrypt hashing.
*   logger.js: Winston-based logging.
*   
esponseHandler.js: Standardized API JSON responses.

## 9. Frontend Application

The frontend is a React application split primarily into Admin and Student domains (App.jsx).

### 9.1 Student Portal (/src/student/pages/)
Organized into 21 functional folders:
*   **auth/**: LoginPage.jsx, RegisterPage.jsx - User authentication flow.
*   **dashboard/**: DashboardPage.jsx - Central hub for student overview and metrics.
*   **onboarding/**: WelcomePage.jsx, ProfileSetup.jsx - Initial setup after registration.
*   **careers/** (15 files): Explore career paths, trends, and specific role deep-dives (e.g., CareerComparisonPage.jsx).
*   **courses/** (9 files): Browse and filter academic courses.
*   **colleges/** (8 files): College directory, detailed views, and campus tours.
*   **scholarships/** (4 files): Search and apply for financial aid.
*   **class5/** (10 files): Gamified learning for 5th graders (e.g., Maths, Science quizzes).
*   **academic/** (8 files): StudyPlannerPage.jsx, PerformanceAnalyticsPage.jsx - Tools for academic success.
*   **career/** (5 files): ResumeBuilderPage.jsx, InterviewPreparationPage.jsx - College-level career prep.
*   **study-tools/**: NotesSummarizerPage.jsx - Utilities for efficient studying.
*   **community/**: Forums and peer-to-peer discussion boards.
*   **graduate/** (12 files): Job search, alumni networking, and advanced career tools.

## 10. Admin Panel (/src/admin/pages/admin/)

The Admin dashboard comprises 38 pages, allowing full management of the platform:
*   UsersPage.jsx: Manage user accounts, roles, and bans.
*   CollegesManager.jsx / CoursesManager.jsx: CRUD operations for educational data.
*   DataImport.jsx: Interface for triggering bulk data seeders/importers.
*   AnalyticsDashboard.jsx: Platform-wide usage statistics.

## 11. Real-Time System (Socket.io)

Socket.io handles live updates, configured in server.js and frontend contexts:
*   **Rooms**: 
    *   dmins: For admin-only alerts.
    *   students: Global broadcast room for all students.
    *   user_<id>: Private room for user-specific notifications.
*   **Events**: 
otification, message, system_alert.


## 5. Backend API Routes
The backend mounts 45 distinct route groups in server.js. Key routes include:

### Auth & Users
- /api/auth: Login, registration, role management (uthRoutes.js)
- /api/users: User profile management (userRoutes.js)
- /api/student-profile: School student profile (studentProfileRoutes.js)
- /api/college-student: College student profile (collegeStudentProfileRoutes.js)
- /api/graduate-profile: Graduate profile (graduateProfileRoutes.js)

### Discovery & Learning (School)
- /api/discovery: Class 5 discovery modules (class5DiscoveryRoutes.js)
- /api/discovery/maths, /api/discovery/science, etc.: Subject-specific modules
- /api/ldnbs: Learning Diagnosis & Next Best Skill (ldnbsRoutes.js)
- /api/gamification: Leaderboards, badges, points (gamificationRoutes.js)
- /api/milestones: Student milestone tracking (milestoneRoutes.js)

### College & Career
- /api/colleges: College directory and details (collegeRoutes.js)
- /api/courses: Course directory and details (courseRoutes.js)
- /api/careers: Career paths and details (careerRoutes.js)
- /api/scholarships: Scholarship listings (scholarshipRoutes.js)
- /api/ahp: AHP algorithm for recommendations (hpRoutes.js)
- /api/college-predictor: Predicts college admissions (collegePredictorRoutes.js)
- /api/career-advisor: AI/algorithm career advisor (careerAdvisorRoutes.js)
- /api/college-advisor: College advisory tools (collegeAdvisorRoutes.js)
- /api/study-planner: Study planning tools (studyPlannerRoutes.js)
- /api/resume-builder: Resume creation tools (
esumeRoutes.js)
- /api/interview-prep: Interview preparation tools (interviewRoutes.js)
- /api/job-board: Job listings for graduates (jobRoutes.js)

### Support & Community
- /api/mentorship: Mentorship connections (mentorshipRoutes.js)
- /api/community: Forums and discussions (communityRoutes.js)
- /api/support: Helpdesk and support tickets (supportRoutes.js)
- /api/bookmarks: User saved items (ookmarkRoutes.js)
- /api/notifications: System notifications (
otificationRoutes.js)

### Admin
- /api/admin: Admin analytics, user management, system config (dminRoutes.js)
- /api/admin/content: CMS for updating platform content (contentRoutes.js)
- /api/admin/reports: System reporting (
eportRoutes.js)

*(Note: 45 total route files mapped to specific domains for modularity)*

## 6. Database Models (105 Total)
The MongoDB database uses Mongoose with 105 distinct models. Here are the core models grouped by domain:

### Users & Profiles
- User.js: Base user model (email, password, role)
- StudentProfile.js: Extends User for school students (grade, school, interests)
- CollegeStudentProfile.js: Extends User for college students (college, major, year)
- GraduateProfile.js: Extends User for graduates (degree, job status, skills)
- AdminProfile.js: Extends User for administrators

### Academic & Assessment
- Assessment.js: Quizzes and tests
- AssessmentResult.js: Scores and analytics for a user's test
- Milestone.js: Academic and career milestones
- UserProgress.js: General progress tracking across modules
- AhpFuzzyQuestion.js: Questions for the AHP/Fuzzy logic assessment
- LearningStyle.js: User's detected learning style

### Gamification
- Badge.js: Available badges
- UserBadge.js: Badges earned by users
- Leaderboard.js: Rankings based on points
- PointsTransaction.js: Audit log of points earned/spent

### Content (Colleges, Courses, Careers)
- College.js: College details (name, location, affiliation, fees)
- Course.js: Course details (duration, syllabus, eligibility)
- Career.js: Career paths, salary expectations, required skills
- Scholarship.js: Scholarship criteria and deadlines
- EntranceExam.js: Details of competitive exams (JEE, NEET, etc.)
- Job.js: Job postings for graduates

### Community & Interactions
- Post.js, Comment.js: Forum content
- MentorshipRequest.js: Connections between students and mentors
- Notification.js: System and user-to-user notifications
- Bookmark.js: Saved colleges, courses, or careers
- SupportTicket.js: User queries to admin

### Specific Subject Models (Class 5 Discovery)
- MathsConcept.js, ScienceConcept.js, HistoryConcept.js: Subject-specific curriculum nodes
- SubjectActivity.js: Interactive activities for specific subjects

## 7. Backend Services (19 Total)
The application encapsulates core business logic in services:

- hpCalculator.js (21KB): Implements the Analytic Hierarchy Process algorithm step-by-step for calculating preference weights for careers based on student input.
- hpFuzzyEngine.js (10KB): Applies Fuzzy Logic rules to handle uncertain or vague preferences during AHP calculation.
- ldnbsOrchestrator.js: Manages the Learning Diagnosis & Next Best Skill system, directing students to optimal next concepts.
- collegePredictorService.js: Algorithm to match a student's profile (marks, interests, category) with historical college cutoffs.
- careerMatchingService.js: Matches user profiles (skills, interests, psychometric data) with the career database.
- 
ecommendationEngine.js: General recommendation logic for courses and scholarships.
- gamificationService.js: Handles logic for awarding points, calculating levels, and issuing badges based on events.
- 
otificationService.js: Dispatches in-app, email, or socket-based notifications.
- emailService.js: Wrapper for sending emails (e.g., OTP, resets, updates).
- exportService.js: Generates PDF/CSV reports for admins and users (e.g., resumes).
- nalyticsService.js: Aggregates data for admin dashboards (user growth, popular courses).
- seedingService.js: Automates database population on startup.

## 8. Backend Utilities (17 Total)
Helper functions to keep code DRY:

- catchAsync.js: Wrapper for async controllers to handle errors.
- ppError.js: Custom error class for standardized error responses.
- piFeatures.js: Class for adding filtering, sorting, pagination, and field limiting to Mongoose queries.
- logger.js: Centralized logging utility (e.g., Winston).
- ileUpload.js: Multer configuration for handling profile pictures and document uploads.
- alidation.js: Common validation schemas and regex (e.g., Joi/Yup schemas).
- dateUtils.js: Helper functions for date manipulation and formatting.
- 	okenUtils.js: JWT generation and verification functions.
- passwordUtils.js: Bcrypt hashing and comparison.
- socketHelper.js: Utility for managing socket rooms and targeted broadcasting.

## 9. Frontend Pages & Modules
The React frontend (Vite) is highly modularized into feature domains for different users.

### Public & Auth (/frontend/src/student/pages/auth/)
- LoginPage.jsx: Multi-role login (Student, College, Graduate, Admin).
- RegisterPage.jsx: Multi-step registration for different profiles.
- ForgotPasswordPage.jsx, ResetPasswordPage.jsx: Password recovery flow.
- OTPVerificationPage.jsx: Email/Phone verification.

### Onboarding (/frontend/src/student/pages/onboarding/)
- StudentOnboarding.jsx: Gathers initial data (interests, goals) for school students.
- CollegeOnboarding.jsx: Gathers data for college students.
- GraduateOnboarding.jsx: Gathers data for graduates (skills, job status).

### Dashboard (/frontend/src/student/pages/dashboard/)
- DashboardPage.jsx: Main landing page for school students (widgets, stats).
- CollegeStudentDashboard.jsx: Main landing page for college students.
- GraduateDashboard.jsx: Main landing page for graduates.

### Class 5 Discovery (/frontend/src/student/pages/class5/)
- SubjectSelectionPage.jsx: Choose Maths, Science, Social, etc.
- MathsDiscoveryPage.jsx, ScienceDiscoveryPage.jsx: Interactive, gamified subject learning.
- QuizPage.jsx: End-of-module assessment.
- ResultPage.jsx: Quiz results and feedback.

### Careers & Colleges (/frontend/src/student/pages/careers/ & colleges/)
- CareerExplorerPage.jsx: Browse career paths.
- CareerDetailsPage.jsx: Deep dive into specific career (salary, skills).
- CollegeDirectoryPage.jsx: Filter and search colleges.
- CollegeDetailsPage.jsx: College info (courses, fees, infrastructure).
- CollegePredictorPage.jsx: Enter marks to see chances of admission.

### Courses & Scholarships (/frontend/src/student/pages/courses/ & scholarships/)
- CourseExplorerPage.jsx: Browse available courses.
- CourseDetailsPage.jsx: Syllabus and eligibility for a course.
- ScholarshipFinderPage.jsx: Search for financial aid.
- ScholarshipDetailsPage.jsx: Scholarship criteria and application link.

### Academic & Study Tools (/frontend/src/student/pages/academic/ & study-tools/)
- StudyPlannerPage.jsx: Calendar and timetable generator for exams.
- PerformanceAnalyticsPage.jsx: Charts showing student progress.
- NotesSummarizerPage.jsx: AI tool to summarize text/notes.
- PracticeQuestionsPage.jsx: Generate practice quizzes based on subject.

### Career Preparation (/frontend/src/student/pages/career/)
- ResumeBuilderPage.jsx: Step-by-step resume generation tool.
- InterviewPreparationPage.jsx: Mock questions and tips.
- SkillAssessmentPage.jsx: Tests to validate skills.

### Graduate Tools (/frontend/src/student/pages/graduate/)
- JobBoardPage.jsx: Search and apply for jobs.
- NetworkingPage.jsx: Connect with alumni and peers.
- UpskillingCoursesPage.jsx: Recommended courses for graduates.

### Community & Support (/frontend/src/student/pages/community/)
- ForumsPage.jsx: Discussion boards.
- MentorshipPage.jsx: Find and connect with mentors.
- SupportTicketPage.jsx: Raise issues to admin.

## 10. Admin Panel (/frontend/src/admin/pages/admin/)
The admin section contains 38 distinct pages for full system management.
- **Users**: UsersPage.jsx, StudentProfilesPage.jsx, CollegeProfilesPage.jsx
- **Content**: ManageCollegesPage.jsx, ManageCoursesPage.jsx, ManageCareersPage.jsx
- **Gamification**: ManageBadgesPage.jsx, LeaderboardAdminPage.jsx
- **Analytics**: SystemAnalyticsPage.jsx, UserReportsPage.jsx
- **Support**: SupportTicketsAdminPage.jsx
- **Settings**: SystemConfigPage.jsx

## 11. Real-time Infrastructure (Socket.io)
Socket.io is integrated into server.js and managed via utilities.
- **Rooms**:
  - dmins: Broadcasts system alerts to all online admins.
  - students: Broadcasts general announcements.
  - user_<userId>: Private room for 1-on-1 notifications (e.g., mentorship request approved).
- **Events**: 
otification, message, points_awarded, lert.

## 12. Core Algorithms

### Analytic Hierarchy Process (AHP) & Fuzzy Logic
Located in hpCalculator.js and hpFuzzyEngine.js.
1. **Input**: Student answers questions comparing preferences (e.g., " Salary vs Work-Life Balance\).
2. **Fuzzification**: Converts qualitative text answers into fuzzy numbers (Triangular Fuzzy Numbers).
3. **Pairwise Comparison Matrix**: Builds a matrix of these preferences.
4. **Eigenvector Calculation**: Calculates the relative weight/importance of each criteria.
5. **Consistency Check (CR)**: Ensures the student's logic is consistent (CR < 0.1).
6. **Career Ranking**: Multiplies weights against career attributes to output top matches.

### Learning Diagnosis & Next Best Skill (LDNBS)
Located in ldnbsOrchestrator.js.
- **Diagnosis**: Analyzes quiz scores to identify weak concepts (e.g., \Fractions\ in Maths).
- **Next Best Skill**: Graph-based algorithm finds the prerequisite skill the student must master before retrying the current concept.

## 13. Data Import & Seeding Pipeline
On server startup (server.js), auto-seeders run to ensure the DB has base data:
- **Idempotent Seeding**: Checks if data exists before inserting.
- **9 Core Areas Seeded**: Users, Colleges, Courses, Careers, Badges, Questions, Scholarships, Entrance Exams.
- **Auto-Importers**: Specific scripts for importing diverse college categories (Diploma, Arts & Science, Medical, Siddha, Ayurveda) from CSV/JSON into MongoDB.

## 14. Frontend Route Map Summary
The routing logic is defined in App.jsx, StudentRoutes.jsx, and Admin routes.

- / -> Landing Page
- /login, /register -> Authentication
- /onboarding -> Role-based setup
- /student/* -> School Student Portal
  - /student/dashboard
  - /student/discovery/* (Class 5 modules)
  - /student/careers, /student/colleges
- /college/* -> College Student Portal
  - /college/dashboard
  - /college/internships
  - /college/upskilling
- /graduate/* -> Graduate Portal
  - /graduate/dashboard
  - /graduate/jobs
- /admin/* -> Administrator Portal (38 sub-routes)

---
*Documentation Generated based on deep-dive analysis of the Uyarvu-Payanam Monorepo.*
