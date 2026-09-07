import React from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { StudentAuthProvider, useStudentAuth } from './context/StudentAuthContext'
import StudentLayout from './layouts/StudentLayout'
import CollegeStudentLayout from './layouts/CollegeStudentLayout'
import GraduateLayout from './layouts/GraduateLayout'
import StudentProtectedRoute from './layouts/StudentProtectedRoute'
import MaintenanceGuard from './components/common/MaintenanceGuard'

// Public & Auth pages
import LandingPage from './pages/public/LandingPage'
import ExplorePage from './pages/public/ExplorePage'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'

// School student pages
import DashboardPage from './pages/dashboard/DashboardPage'
import CareersPage from './pages/careers/CareersPage'
import CareerClassPage from './pages/careers/CareerClassPage'
import CareerDetailPage from './pages/careers/CareerDetailPage'
import CollegesPage from './pages/colleges/CollegesPage'
import CoursesPage from './pages/courses/CoursesPage'
import CourseCategoryPage from './pages/courses/CourseCategoryPage'
import NotificationsPage from './pages/notifications/NotificationsPage'
import ProfilePage from './pages/profile/ProfilePage'
import ScholarshipsPage from './pages/scholarships/ScholarshipsPage'
import ClassLevelPage from './pages/careers/ClassLevelPage'
import ContentDetailPage from './pages/careers/ContentDetailPage'
import CourseDetailPage from './pages/courses/CourseDetailPage'
import BookmarksPage from './pages/bookmarks/BookmarksPage'
import CollegeCourseExplorer from './pages/colleges/CollegeCourseExplorer'
import TneaCutoffPage from './pages/colleges/TneaCutoffPage'
import CollegeDetailPage from './pages/colleges/CollegeDetailPage'
import CollegeCategoryPage from './pages/colleges/CollegeCategoryPage'
import ScholarshipDetailPage from './pages/scholarships/ScholarshipDetailPage'
import OnboardingPage from './pages/onboarding/OnboardingPage'
import CollegeOnboardingPage from './pages/onboarding/CollegeOnboardingPage'
import GraduateOnboardingPage from './pages/onboarding/GraduateOnboardingPage'
import RecommendationResultPage from './pages/onboarding/RecommendationResultPage'
import Class5CommunicationPage from './pages/careers/Class5CommunicationPage'
import Class5PassportPage from './pages/careers/Class5PassportPage'
import PatternMasterPage from './pages/careers/PatternMasterPage'
import DrawingChallengePage from './pages/careers/DrawingChallengePage'
import StoryBuilderPage from './pages/careers/StoryBuilderPage'
import MakeYourOwnSongPage from './pages/careers/MakeYourOwnSongPage'
import TreasureHuntPage from './pages/careers/TreasureHuntPage'

// College student pages
import CollegeDashboardPage from './pages/dashboard/CollegeDashboardPage'
import CollegeAdvisorDashboardPage from './pages/advisor/CollegeAdvisorDashboardPage'
import CollegeProfilePage from './pages/profile/CollegeProfilePage'
import StudyPlannerPage from './pages/academic/StudyPlannerPage'
import LearningRoadmapPage from './pages/academic/LearningRoadmapPage'
import PerformanceAnalyticsPage from './pages/academic/PerformanceAnalyticsPage'
import FocusLearningPage from './pages/academic/FocusLearningPage'
import CodingArenaPage from './pages/career/CodingArenaPage'
import ProfileAwareAskAIChatbotPage from './pages/advisor/ProfileAwareAskAIChatbotPage'
import SkillGapAnalysisPage from './pages/career/SkillGapAnalysisPage'
import CareerComparisonPage from './pages/career/CareerComparisonPage'
import ResumeBuilderPage from './pages/career/ResumeBuilderPage'
import InterviewPreparationPage from './pages/career/InterviewPreparationPage'
import NotesSummarizerPage from './pages/study-tools/NotesSummarizerPage'
import CollegeScholarshipsPage from './pages/scholarships/CollegeScholarshipsPage'
import PracticeQuestionsPage from './pages/study-tools/PracticeQuestionsPage'
import CollegePracticePage from './pages/study-tools/CollegePracticePage'
import PeerMentorshipPage from './pages/community/PeerMentorshipPage'
import DoubtResolutionPage from './pages/community/DoubtResolutionPage'

// Graduate student pages
import GraduateDashboardPage from './pages/graduate/GraduateDashboardPage'
import GraduateProfilePage from './pages/graduate/GraduateProfilePage'
import GraduateCareersPage from './pages/graduate/GraduateCareersPage'
import GraduateSkillGapPage from './pages/graduate/GraduateSkillGapPage'
import GraduateRoadmapPage from './pages/graduate/GraduateRoadmapPage'
import GraduateExamsPage from './pages/graduate/GraduateExamsPage'
import GraduateHigherStudiesPage from './pages/graduate/GraduateHigherStudiesPage'
import GraduateUpskillingPage from './pages/graduate/GraduateUpskillingPage'
import GraduatePlacementPage from './pages/graduate/GraduatePlacementPage'
import GraduateResumePage from './pages/graduate/GraduateResumePage'
import GraduateInterviewPage from './pages/graduate/GraduateInterviewPage'
import GraduateAIAdvisorPage from './pages/graduate/GraduateAIAdvisorPage'

import './student.css'

// A smart dashboard redirector that decides which layout to send students to
function CollegeDashboardRedirector() {
  const { student } = useStudentAuth()
  if (student?.userType === 'college_student') {
    return <Navigate to="/college/dashboard" replace />
  }
  if (student?.userType === 'graduate') {
    return <Navigate to="/graduate/dashboard" replace />
  }
  // Fallback: render the school dashboard
  return <DashboardPage />
}

export default function StudentRoutes() {
  return (
    <StudentAuthProvider>
      <MaintenanceGuard>
        <Routes>

          {/* ════════════════════════════════════════════════════════
              SCHOOL / PUBLIC ROUTES  (StudentLayout — top navbar)
              ════════════════════════════════════════════════════════ */}
          <Route element={<StudentLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="home" element={<LandingPage />} />
            <Route path="student/home" element={<LandingPage />} />
            <Route path="explore" element={<ExplorePage />} />
            <Route path="student/explore" element={<ExplorePage />} />

            {/* Auth */}
            <Route path="signin" element={<LoginPage />} />
            <Route path="student/signin" element={<LoginPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="student/login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="student/signup" element={<SignupPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="student/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="student/reset-password/:token" element={<ResetPasswordPage />} />

            {/* Onboarding — open, no sidebar */}
            <Route path="onboarding" element={<StudentProtectedRoute><OnboardingPage /></StudentProtectedRoute>} />
            <Route path="student/onboarding" element={<StudentProtectedRoute><OnboardingPage /></StudentProtectedRoute>} />
            <Route path="onboarding/college" element={<StudentProtectedRoute><CollegeOnboardingPage /></StudentProtectedRoute>} />
            <Route path="student/onboarding/college" element={<StudentProtectedRoute><CollegeOnboardingPage /></StudentProtectedRoute>} />
            <Route path="onboarding/graduate" element={<StudentProtectedRoute><GraduateOnboardingPage /></StudentProtectedRoute>} />
            <Route path="student/onboarding/graduate" element={<StudentProtectedRoute><GraduateOnboardingPage /></StudentProtectedRoute>} />
            <Route path="onboarding/result" element={<StudentProtectedRoute><RecommendationResultPage /></StudentProtectedRoute>} />
            <Route path="student/onboarding/result" element={<StudentProtectedRoute><RecommendationResultPage /></StudentProtectedRoute>} />

            {/* School class routes */}
            <Route path="class5" element={<ClassLevelPage level="5" />} />
            <Route path="student/class5" element={<ClassLevelPage level="5" />} />
            <Route path="class5/content/:slug" element={<ContentDetailPage />} />
            <Route path="class5/skills/communicationskills" element={<StudentProtectedRoute><Class5CommunicationPage /></StudentProtectedRoute>} />
            <Route path="student/class5/skills/communicationskills" element={<StudentProtectedRoute><Class5CommunicationPage /></StudentProtectedRoute>} />
            <Route path="class5/skills/communicationskills/passport/:studentId" element={<Class5PassportPage />} />
            <Route path="student/class5/skills/communicationskills/passport/:studentId" element={<Class5PassportPage />} />
            <Route path="class5/games/pattern-master" element={<StudentProtectedRoute><PatternMasterPage /></StudentProtectedRoute>} />
            <Route path="class5/fun/drawing-challenge" element={<StudentProtectedRoute><DrawingChallengePage /></StudentProtectedRoute>} />
            <Route path="class5/fun/story-builder" element={<StudentProtectedRoute><StoryBuilderPage /></StudentProtectedRoute>} />
            <Route path="class5/fun/make-your-own-song" element={<StudentProtectedRoute><MakeYourOwnSongPage /></StudentProtectedRoute>} />
            <Route path="class5/fun/treasure-hunt" element={<StudentProtectedRoute><TreasureHuntPage /></StudentProtectedRoute>} />
            <Route path="class8" element={<ClassLevelPage level="8" />} />
            <Route path="student/class8" element={<ClassLevelPage level="8" />} />
            <Route path="class8/content/:slug" element={<ContentDetailPage />} />
            <Route path="class10" element={<ClassLevelPage level="10" />} />
            <Route path="student/class10" element={<ClassLevelPage level="10" />} />
            <Route path="class10/content/:slug" element={<ContentDetailPage />} />
            <Route path="class12" element={<ClassLevelPage level="12" />} />
            <Route path="student/class12" element={<ClassLevelPage level="12" />} />
            <Route path="class12/content/:slug" element={<ContentDetailPage />} />
            <Route path="career-path/class-5/:slug" element={<ContentDetailPage />} />
            <Route path="student/career-path/class-5/:slug" element={<ContentDetailPage />} />
            <Route path="career-path/class-8/:slug" element={<ContentDetailPage />} />
            <Route path="student/career-path/class-8/:slug" element={<ContentDetailPage />} />
            <Route path="career-path/class-10/:slug" element={<ContentDetailPage />} />
            <Route path="student/career-path/class-10/:slug" element={<ContentDetailPage />} />
            <Route path="career-path/class-12/:slug" element={<ContentDetailPage />} />
            <Route path="student/career-path/class-12/:slug" element={<ContentDetailPage />} />

            {/* Shared public exploration routes */}
            <Route path="careers" element={<CareersPage />} />
            <Route path="student/careers" element={<CareersPage />} />
            <Route path="careers/class/:classKey" element={<CareerClassPage />} />
            <Route path="student/careers/class/:classKey" element={<CareerClassPage />} />
            <Route path="careers/path/:id" element={<CareerDetailPage />} />
            <Route path="student/careers/path/:id" element={<CareerDetailPage />} />
            <Route path="colleges" element={<CollegesPage />} />
            <Route path="student/colleges" element={<CollegesPage />} />
            <Route path="colleges/:id" element={<CollegeDetailPage />} />
            <Route path="student/colleges/:id" element={<CollegeDetailPage />} />
            <Route path="colleges/category/:categoryName" element={<CollegeCategoryPage />} />
            <Route path="student/colleges/category/:categoryName" element={<CollegeCategoryPage />} />
            <Route path="colleges/explorer" element={<CollegeCourseExplorer />} />
            <Route path="student/colleges/explorer" element={<CollegeCourseExplorer />} />
            <Route path="colleges/cutoff" element={<TneaCutoffPage />} />
            <Route path="student/colleges/cutoff" element={<TneaCutoffPage />} />
            <Route path="scholarships" element={<ScholarshipsPage />} />
            <Route path="student/scholarships" element={<ScholarshipsPage />} />
            <Route path="scholarships/:id" element={<ScholarshipDetailPage />} />
            <Route path="student/scholarships/:id" element={<ScholarshipDetailPage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="student/courses" element={<CoursesPage />} />
            <Route path="courses/:categoryKey" element={<CourseCategoryPage />} />
            <Route path="student/courses/:categoryKey" element={<CourseCategoryPage />} />
            <Route path="course/:slug" element={<CourseDetailPage />} />
            <Route path="student/course/:slug" element={<CourseDetailPage />} />

            {/* School Dashboard — redirects college students to /college/dashboard */}
            <Route path="dashboard" element={<StudentProtectedRoute><CollegeDashboardRedirector /></StudentProtectedRoute>} />
            <Route path="student/dashboard" element={<StudentProtectedRoute><CollegeDashboardRedirector /></StudentProtectedRoute>} />
            <Route path="bookmarks" element={<StudentProtectedRoute><BookmarksPage /></StudentProtectedRoute>} />
            <Route path="student/bookmarks" element={<StudentProtectedRoute><BookmarksPage /></StudentProtectedRoute>} />
            <Route path="notifications" element={<StudentProtectedRoute><NotificationsPage /></StudentProtectedRoute>} />
            <Route path="student/notifications" element={<StudentProtectedRoute><NotificationsPage /></StudentProtectedRoute>} />
            <Route path="profile" element={<StudentProtectedRoute><ProfilePage /></StudentProtectedRoute>} />
            <Route path="student/profile" element={<StudentProtectedRoute><ProfilePage /></StudentProtectedRoute>} />

            {/* ─── CATCH-ALL  ────────────────────────────────────────────────
                FALLBACK REDIRECT: This only runs when NO other route matches.
                If a feature stops working and lands on /home here, it is almost
                always a MISSING ROUTE, not a bad redirect — a component navigated
                to a URL that was never registered in this file.

                KEEP EVERY STUDENT ROUTE THIS FILE'S CONTRACT:
                Every navigation going to /student/* (sidebar Links, navigate()
                calls) needs BOTH a "path" route AND a "student/path" alias,
                exactly like careers/colleges/scholarships/courses do below.
                Adding a page = add the route pair, otherwise that page's links
                silently bounce the user back to /home through this catch-all.
                ─────────────────────────────────────────────────────────────── */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Route>

          {/* ════════════════════════════════════════════════════════
              COLLEGE STUDENT ROUTES  (CollegeStudentLayout — dark sidebar)
              All under /college/* prefix — sidebar stays constant
              ════════════════════════════════════════════════════════ */}
          <Route
            path="/college"
            element={<StudentProtectedRoute><CollegeStudentLayout /></StudentProtectedRoute>}
          >
            <Route path="dashboard" element={<CollegeDashboardPage />} />
            <Route path="profile" element={<CollegeProfilePage />} />
            <Route path="advisor" element={<CollegeAdvisorDashboardPage />} />
            <Route path="advisor/chat" element={<ProfileAwareAskAIChatbotPage />} />
            <Route path="academic/focus" element={<FocusLearningPage />} />
            <Route path="academic/planner" element={<StudyPlannerPage />} />
            <Route path="academic/roadmap" element={<LearningRoadmapPage />} />
            <Route path="academic/performance" element={<PerformanceAnalyticsPage />} />
            <Route path="practice" element={<CollegePracticePage />} />
            <Route path="career/coding-arena" element={<CodingArenaPage />} />
            <Route path="career/skill-gap" element={<SkillGapAnalysisPage />} />
            <Route path="career/compare" element={<CareerComparisonPage />} />
            <Route path="career/resume" element={<ResumeBuilderPage />} />
            <Route path="career/interview-prep" element={<InterviewPreparationPage />} />
            <Route path="study-tools/notes-summarizer" element={<NotesSummarizerPage />} />
            <Route path="study-tools/practice" element={<CollegePracticePage />} />
            <Route path="community/mentors" element={<PeerMentorshipPage />} />
            <Route path="community/doubts" element={<DoubtResolutionPage />} />
            <Route path="scholarships" element={<CollegeScholarshipsPage />} />
            <Route path="bookmarks" element={<BookmarksPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* ════════════════════════════════════════════════════════
              GRADUATE ROUTES  (GraduateLayout — dark navy sidebar)
              All under /graduate/* prefix — sidebar stays constant
              ════════════════════════════════════════════════════════ */}
          <Route
            path="/graduate"
            element={<StudentProtectedRoute><GraduateLayout /></StudentProtectedRoute>}
          >
            <Route path="dashboard" element={<GraduateDashboardPage />} />
            <Route path="profile" element={<GraduateProfilePage />} />
            <Route path="careers" element={<GraduateCareersPage />} />
            <Route path="skill-gap" element={<GraduateSkillGapPage />} />
            <Route path="roadmap" element={<GraduateRoadmapPage />} />
            <Route path="exams" element={<GraduateExamsPage />} />
            <Route path="higher-studies" element={<GraduateHigherStudiesPage />} />
            <Route path="upskilling" element={<GraduateUpskillingPage />} />
            <Route path="placement" element={<GraduatePlacementPage />} />
            <Route path="resume" element={<GraduateResumePage />} />
            <Route path="interview" element={<GraduateInterviewPage />} />
            <Route path="ai-advisor" element={<GraduateAIAdvisorPage />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Legacy /student/* college routes → redirect to /college/* */}
          <Route path="student/college-profile" element={<Navigate to="/college/profile" replace />} />
          <Route path="student/advisor" element={<Navigate to="/college/advisor" replace />} />
          <Route path="student/advisor/chat" element={<Navigate to="/college/advisor/chat" replace />} />
          <Route path="student/academic/planner" element={<Navigate to="/college/academic/planner" replace />} />
          <Route path="student/academic/roadmap" element={<Navigate to="/college/academic/roadmap" replace />} />
          <Route path="student/academic/performance" element={<Navigate to="/college/academic/performance" replace />} />
          <Route path="student/career/skill-gap" element={<Navigate to="/college/career/skill-gap" replace />} />
          <Route path="student/career/compare" element={<Navigate to="/college/career/compare" replace />} />
          <Route path="student/career/resume" element={<Navigate to="/college/career/resume" replace />} />
          <Route path="student/career/interview-prep" element={<Navigate to="/college/career/interview-prep" replace />} />
          <Route path="student/study-tools/notes-summarizer" element={<Navigate to="/college/study-tools/notes-summarizer" replace />} />
          <Route path="student/study-tools/practice" element={<Navigate to="/college/study-tools/practice" replace />} />
          <Route path="student/community/mentors" element={<Navigate to="/college/community/mentors" replace />} />
          <Route path="student/community/doubts" element={<Navigate to="/college/community/doubts" replace />} />

        </Routes>
      </MaintenanceGuard>
    </StudentAuthProvider>
  )
}