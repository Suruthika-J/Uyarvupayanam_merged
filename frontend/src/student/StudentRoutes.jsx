import React from 'react'
import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { StudentAuthProvider, useStudentAuth } from './context/StudentAuthContext'
import StudentLayout from './layouts/StudentLayout'
import CollegeStudentLayout from './layouts/CollegeStudentLayout'
import StudentProtectedRoute from './layouts/StudentProtectedRoute'
import MaintenanceGuard from './components/common/MaintenanceGuard'

// Public & Auth pages
import LandingPage from './pages/public/LandingPage'
import ExplorePage from './pages/public/ExplorePage'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import VerifyOtpPage from './pages/auth/VerifyOtpPage'
import SignupOtpPage from './pages/auth/SignupOtpPage'

// School student pages
import DashboardPage from './pages/dashboard/DashboardPage'
import CareersPage from './pages/careers/CareersPage'
import CareerClassPage from './pages/careers/CareerClassPage'
import CareerDetailPage from './pages/careers/CareerDetailPage'
import CollegesPage from './pages/colleges/CollegesPage'
import CoursesPage from './pages/courses/CoursesPage'
import CourseCategoryPage from './pages/courses/CourseCategoryPage'
import After10thCourses from './pages/courses/After10thCourses'
import After12thCourses from './pages/courses/After12thCourses'
import DiplomaCourses from './pages/courses/DiplomaCourses'
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
import CollegesCategoryPage from './pages/colleges/CollegesCategoryPage'
import CourseCollegesPage from './pages/colleges/CourseCollegesPage'
import CollegeCoursesPage from './pages/colleges/CollegeCoursesPage'
import ScholarshipDetailPage from './pages/scholarships/ScholarshipDetailPage'
import OnboardingPage from './pages/onboarding/OnboardingPage'
import CollegeOnboardingPage from './pages/onboarding/CollegeOnboardingPage'
import GraduateOnboardingPage from './pages/onboarding/GraduateOnboardingPage'
import RecommendationResultPage from './pages/onboarding/RecommendationResultPage'
import Class5CommunicationPage from './pages/careers/Class5CommunicationPage'
import Class5PassportPage from './pages/careers/Class5PassportPage'
import PatternMasterPage from './pages/careers/PatternMasterPage'

// Class 5 career-discovery redesign (Uyarvu Payanam)
import Class5Dashboard from './pages/class5/Class5Dashboard'
import ScholarshipsSection from './pages/class5/ScholarshipsSection'
import SortingQuizPage from './pages/class5/SortingQuizPage'
import GameDetailPage from './pages/class5/GameDetailPage'
import AdhikaramPickerPage from './pages/class5/AdhikaramPickerPage'
import AdhikaramPage from './components/adhikaram/AdhikaramPage'
import MathWorldMap from './components/maths/MathWorldMap'
import TopicWorld from './components/maths/TopicWorld'
import DailyChallenge from './components/maths/DailyChallenge'
import RequireMathsLogin from './components/maths/RequireMathsLogin'
import WorldExplorer from './components/social/WorldExplorer'
import SocialWorld from './components/social/SocialWorld'
import SocialDaily from './components/social/SocialDaily'
import RequireSocialLogin from './components/social/RequireSocialLogin'
import ScienceAdventureWorld from './components/science/ScienceAdventureWorld'
import ScienceWorld from './components/science/ScienceWorld'
import ScienceDaily from './components/science/ScienceDaily'
import RequireScienceLogin from './components/science/RequireScienceLogin'

// English Adventure (Class 5)
import EnglishAdventure from './components/english/EnglishAdventure'
import StoryWriter from './components/english/StoryWriter'
import SpeakAndTell from './components/english/SpeakAndTell'
import EnglishBasics from './components/english/EnglishBasics'
import GrammarTopicWorld from './components/english/GrammarTopicWorld'
import WordExplorer from './components/english/WordExplorer'
import SentenceBuilder from './components/english/SentenceBuilder'
import ListenSpeak from './components/english/ListenSpeak'
import DailyEnglishChallenge from './components/english/DailyEnglishChallenge'
import MyEnglishProgress from './components/english/MyEnglishProgress'
import RequireEnglishLogin from './components/english/RequireEnglishLogin'

// College student pages
import CollegeAdvisorDashboardPage from './pages/advisor/CollegeAdvisorDashboardPage'
import CollegeProfilePage from './pages/profile/CollegeProfilePage'
import StudyPlannerPage from './pages/academic/StudyPlannerPage'
import LearningRoadmapPage from './pages/academic/LearningRoadmapPage'
import PerformanceAnalyticsPage from './pages/academic/PerformanceAnalyticsPage'
import ProfileAwareAskAIChatbotPage from './pages/advisor/ProfileAwareAskAIChatbotPage'
import SkillGapAnalysisPage from './pages/career/SkillGapAnalysisPage'
import CareerComparisonPage from './pages/career/CareerComparisonPage'
import ResumeBuilderPage from './pages/career/ResumeBuilderPage'
import InterviewPreparationPage from './pages/career/InterviewPreparationPage'
import NotesSummarizerPage from './pages/study-tools/NotesSummarizerPage'
import CollegeScholarshipsPage from './pages/scholarships/CollegeScholarshipsPage'
import PracticeQuestionsPage from './pages/study-tools/PracticeQuestionsPage'
import PeerMentorshipPage from './pages/community/PeerMentorshipPage'
import DoubtResolutionPage from './pages/community/DoubtResolutionPage'

import './student.css'

// A smart dashboard redirector that decides which layout to send the college student to
function CollegeDashboardRedirector() {
  const { student } = useStudentAuth()
  if (student?.userType === 'college_student') {
    return <Navigate to="/college/dashboard" replace />
  }
  // Fallback: render the school dashboard
  return <DashboardPage />
}

// Aliased routes redirect (<Navigate replace>) to a canonical /student/* URL,
// preserving any :param segments (e.g. reset-password/:token) along the way.
function PreserveParamRedirect({ to }) {
  const params = useParams()
  const rendered = to.replace(/:[A-Za-z_][A-Za-z0-9_]*/g, (m) => params[m.slice(1)] ?? m)
  return <Navigate to={rendered} replace />
}

export default function StudentRoutes() {
  return (
    <StudentAuthProvider>
      <MaintenanceGuard>
        <Routes>

          {/* ════════════════════════════════════════════════════════
              SCHOOL / PUBLIC ROUTES  (StudentLayout — top navbar)
              Canonical form: /student/* for authenticated student pages.
              / and /explore stay plain as public marketing entry points.
              Plain aliases redirect (<Navigate replace>) to canonical.
              ════════════════════════════════════════════════════════ */}
          <Route element={<StudentLayout />}>
            <Route index element={<LandingPage />} />

            {/* Landing — canonical / ; /home & /student/home are aliases */}
            <Route path="home" element={<Navigate to="/" replace />} />
            <Route path="student/home" element={<Navigate to="/" replace />} />

            {/* Explore — public marketing entry, canonical plain /explore */}
            <Route path="explore" element={<ExplorePage />} />
            <Route path="student/explore" element={<Navigate to="/explore" replace />} />

            {/* Auth — canonical /student/signin ... */}
            <Route path="student/signin" element={<LoginPage />} />
            <Route path="signin" element={<Navigate to="/student/signin" replace />} />
            <Route path="login" element={<Navigate to="/student/signin" replace />} />
            <Route path="student/login" element={<Navigate to="/student/signin" replace />} />
            <Route path="student/signup" element={<SignupPage />} />
            <Route path="signup" element={<Navigate to="/student/signup" replace />} />
            <Route path="student/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="forgot-password" element={<Navigate to="/student/forgot-password" replace />} />
            <Route path="student/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="reset-password/:token" element={<PreserveParamRedirect to="/student/reset-password/:token" />} />
            <Route path="student/verify-otp" element={<VerifyOtpPage />} />
            <Route path="verify-otp" element={<Navigate to="/student/verify-otp" replace />} />
            <Route path="student/signup/verify" element={<SignupOtpPage />} />
            <Route path="signup/verify" element={<Navigate to="/student/signup/verify" replace />} />

            {/* Onboarding — open, canonical /student/onboarding ... */}
            <Route path="student/onboarding" element={<StudentProtectedRoute><OnboardingPage /></StudentProtectedRoute>} />
            <Route path="onboarding" element={<Navigate to="/student/onboarding" replace />} />
            <Route path="student/onboarding/college" element={<StudentProtectedRoute><CollegeOnboardingPage /></StudentProtectedRoute>} />
            <Route path="onboarding/college" element={<Navigate to="/student/onboarding/college" replace />} />
            <Route path="student/onboarding/graduate" element={<StudentProtectedRoute><GraduateOnboardingPage /></StudentProtectedRoute>} />
            <Route path="onboarding/graduate" element={<Navigate to="/student/onboarding/graduate" replace />} />
            <Route path="student/onboarding/result" element={<StudentProtectedRoute><RecommendationResultPage /></StudentProtectedRoute>} />
            <Route path="onboarding/result" element={<Navigate to="/student/onboarding/result" replace />} />

            {/* School class routes — canonical /student/classX */}
            <Route path="student/class5" element={<Class5Dashboard />}>
              <Route index element={<Navigate to="adhikaram" replace />} />
              <Route path="scholarships" element={<ScholarshipsSection />} />
              <Route path="adhikaram" element={<AdhikaramPickerPage />} />
              <Route path="adhikaram/:id" element={<AdhikaramPage />} />
              <Route path="maths" element={<MathWorldMap />} />
              <Route path="maths/daily" element={<RequireMathsLogin><DailyChallenge /></RequireMathsLogin>} />
              <Route path="maths/:topic" element={<RequireMathsLogin><TopicWorld /></RequireMathsLogin>} />
              <Route path="social" element={<WorldExplorer />} />
              <Route path="social/daily" element={<RequireSocialLogin><SocialDaily /></RequireSocialLogin>} />
              <Route path="social/:world" element={<RequireSocialLogin><SocialWorld /></RequireSocialLogin>} />
              <Route path="science" element={<ScienceAdventureWorld />} />
              <Route path="science/daily" element={<RequireScienceLogin><ScienceDaily /></RequireScienceLogin>} />
              <Route path="science/:world" element={<RequireScienceLogin><ScienceWorld /></RequireScienceLogin>} />
              <Route path="english" element={<EnglishAdventure />} />
              <Route path="english/writing" element={<RequireEnglishLogin><StoryWriter /></RequireEnglishLogin>} />
              <Route path="english/speaking" element={<RequireEnglishLogin><SpeakAndTell /></RequireEnglishLogin>} />
              <Route path="english/basics" element={<EnglishBasics />} />
              <Route path="english/basics/:topicId" element={<RequireEnglishLogin><GrammarTopicWorld /></RequireEnglishLogin>} />
              <Route path="english/vocabulary" element={<RequireEnglishLogin><WordExplorer /></RequireEnglishLogin>} />
              <Route path="english/sentence-builder" element={<RequireEnglishLogin><SentenceBuilder /></RequireEnglishLogin>} />
              <Route path="english/listen-speak" element={<RequireEnglishLogin><ListenSpeak /></RequireEnglishLogin>} />
              <Route path="english/daily-challenge" element={<RequireEnglishLogin><DailyEnglishChallenge /></RequireEnglishLogin>} />
              <Route path="english/progress" element={<RequireEnglishLogin><MyEnglishProgress /></RequireEnglishLogin>} />
              <Route path="quiz" element={<SortingQuizPage />} />
              <Route path="games/:key" element={<GameDetailPage />} />
            </Route>
            <Route path="class5" element={<Navigate to="/student/class5" replace />} />
            <Route path="student/class5/content/:slug" element={<ContentDetailPage />} />
            <Route path="class5/content/:slug" element={<PreserveParamRedirect to="/student/class5/content/:slug" />} />
            <Route path="student/class5/skills/communicationskills" element={<StudentProtectedRoute><Class5CommunicationPage /></StudentProtectedRoute>} />
            <Route path="class5/skills/communicationskills" element={<Navigate to="/student/class5/skills/communicationskills" replace />} />
            <Route path="student/class5/skills/communicationskills/passport/:studentId" element={<StudentProtectedRoute><Class5PassportPage /></StudentProtectedRoute>} />
            <Route path="class5/skills/communicationskills/passport/:studentId" element={<PreserveParamRedirect to="/student/class5/skills/communicationskills/passport/:studentId" />} />
            <Route path="student/class5/games/pattern-master" element={<StudentProtectedRoute><PatternMasterPage /></StudentProtectedRoute>} />
            <Route path="class5/games/pattern-master" element={<Navigate to="/student/class5/games/pattern-master" replace />} />
            <Route path="student/class8" element={<ClassLevelPage level="8" />} />
            <Route path="class8" element={<Navigate to="/student/class8" replace />} />
            <Route path="student/class8/content/:slug" element={<ContentDetailPage />} />
            <Route path="class8/content/:slug" element={<PreserveParamRedirect to="/student/class8/content/:slug" />} />
            <Route path="student/class10" element={<ClassLevelPage level="10" />} />
            <Route path="class10" element={<Navigate to="/student/class10" replace />} />
            <Route path="student/class10/content/:slug" element={<ContentDetailPage />} />
            <Route path="class10/content/:slug" element={<PreserveParamRedirect to="/student/class10/content/:slug" />} />
            <Route path="student/class12" element={<ClassLevelPage level="12" />} />
            <Route path="class12" element={<Navigate to="/student/class12" replace />} />
            <Route path="student/class12/colleges/:category" element={<CollegesCategoryPage />} />
            <Route path="class12/colleges/:category" element={<PreserveParamRedirect to="/student/class12/colleges/:category" />} />
            <Route path="student/class12/colleges/:category/course/:courseId" element={<CourseCollegesPage />} />
            <Route path="class12/colleges/:category/course/:courseId" element={<PreserveParamRedirect to="/student/class12/colleges/:category/course/:courseId" />} />
            <Route path="student/class12/colleges/:category/college/:collegeId" element={<CollegeCoursesPage />} />
            <Route path="class12/colleges/:category/college/:collegeId" element={<PreserveParamRedirect to="/student/class12/colleges/:category/college/:collegeId" />} />
            <Route path="student/class12/content/:slug" element={<ContentDetailPage />} />
            <Route path="class12/content/:slug" element={<PreserveParamRedirect to="/student/class12/content/:slug" />} />
            <Route path="student/career-path/class-5/:slug" element={<ContentDetailPage />} />
            <Route path="career-path/class-5/:slug" element={<PreserveParamRedirect to="/student/career-path/class-5/:slug" />} />
            <Route path="student/career-path/class-8/:slug" element={<ContentDetailPage />} />
            <Route path="career-path/class-8/:slug" element={<PreserveParamRedirect to="/student/career-path/class-8/:slug" />} />
            <Route path="student/career-path/class-10/:slug" element={<ContentDetailPage />} />
            <Route path="career-path/class-10/:slug" element={<PreserveParamRedirect to="/student/career-path/class-10/:slug" />} />
            <Route path="student/career-path/class-12/:slug" element={<ContentDetailPage />} />
            <Route path="career-path/class-12/:slug" element={<PreserveParamRedirect to="/student/career-path/class-12/:slug" />} />

            {/* Shared public exploration routes */}
            <Route path="student/careers" element={<CareersPage />} />
            <Route path="careers" element={<Navigate to="/student/careers" replace />} />
            <Route path="student/careers/class/:classKey" element={<CareerClassPage />} />
            <Route path="careers/class/:classKey" element={<PreserveParamRedirect to="/student/careers/class/:classKey" />} />
            <Route path="student/careers/path/:id" element={<CareerDetailPage />} />
            <Route path="careers/path/:id" element={<PreserveParamRedirect to="/student/careers/path/:id" />} />
            <Route path="student/colleges" element={<CollegesPage />} />
            <Route path="colleges" element={<Navigate to="/student/colleges" replace />} />
            <Route path="student/colleges/explorer" element={<CollegeCourseExplorer />} />
            <Route path="colleges/explorer" element={<Navigate to="/student/colleges/explorer" replace />} />
            <Route path="student/colleges/cutoff" element={<TneaCutoffPage />} />
            <Route path="colleges/cutoff" element={<Navigate to="/student/colleges/cutoff" replace />} />
            <Route path="student/colleges/category/:categoryName" element={<CollegeCategoryPage />} />
            <Route path="colleges/category/:categoryName" element={<PreserveParamRedirect to="/student/colleges/category/:categoryName" />} />
            <Route path="student/colleges/:id" element={<CollegeDetailPage />} />
            <Route path="colleges/:id" element={<PreserveParamRedirect to="/student/colleges/:id" />} />
            <Route path="student/scholarships" element={<ScholarshipsPage />} />
            <Route path="scholarships" element={<Navigate to="/student/scholarships" replace />} />
            <Route path="student/scholarships/:id" element={<ScholarshipDetailPage />} />
            <Route path="scholarships/:id" element={<PreserveParamRedirect to="/student/scholarships/:id" />} />
            <Route path="student/courses" element={<CoursesPage />} />
            <Route path="courses" element={<Navigate to="/student/courses" replace />} />
            <Route path="student/courses/:categoryKey" element={<CourseCategoryPage />} />
            <Route path="courses/:categoryKey" element={<PreserveParamRedirect to="/student/courses/:categoryKey" />} />
            <Route path="student/course/:slug" element={<CourseDetailPage />} />
            <Route path="course/:slug" element={<PreserveParamRedirect to="/student/course/:slug" />} />
            <Route path="student/courses/after-10th" element={<After10thCourses />} />
            <Route path="courses/after-10th" element={<Navigate to="/student/courses/after-10th" replace />} />
            <Route path="student/courses/after-12th" element={<After12thCourses />} />
            <Route path="courses/after-12th" element={<Navigate to="/student/courses/after-12th" replace />} />
            <Route path="student/courses/diploma" element={<DiplomaCourses />} />
            <Route path="courses/diploma" element={<Navigate to="/student/courses/diploma" replace />} />

            {/* School Dashboard — redirects college students to /college/dashboard */}
            <Route path="student/dashboard" element={<StudentProtectedRoute><CollegeDashboardRedirector /></StudentProtectedRoute>} />
            <Route path="dashboard" element={<Navigate to="/student/dashboard" replace />} />
            <Route path="student/bookmarks" element={<StudentProtectedRoute><BookmarksPage /></StudentProtectedRoute>} />
            <Route path="bookmarks" element={<Navigate to="/student/bookmarks" replace />} />
            <Route path="student/notifications" element={<StudentProtectedRoute><NotificationsPage /></StudentProtectedRoute>} />
            <Route path="notifications" element={<Navigate to="/student/notifications" replace />} />
            <Route path="student/profile" element={<StudentProtectedRoute><ProfilePage /></StudentProtectedRoute>} />
            <Route path="profile" element={<Navigate to="/student/profile" replace />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>

          {/* ════════════════════════════════════════════════════════
              COLLEGE STUDENT ROUTES  (CollegeStudentLayout — dark sidebar)
              All under /college/* prefix — sidebar stays constant
              ════════════════════════════════════════════════════════ */}
          <Route
            path="/college"
            element={<StudentProtectedRoute><CollegeStudentLayout /></StudentProtectedRoute>}
          >
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="profile" element={<CollegeProfilePage />} />
            <Route path="advisor" element={<CollegeAdvisorDashboardPage />} />
            <Route path="advisor/chat" element={<ProfileAwareAskAIChatbotPage />} />
            <Route path="academic/planner" element={<StudyPlannerPage />} />
            <Route path="academic/roadmap" element={<LearningRoadmapPage />} />
            <Route path="academic/performance" element={<PerformanceAnalyticsPage />} />
            <Route path="career/skill-gap" element={<SkillGapAnalysisPage />} />
            <Route path="career/compare" element={<CareerComparisonPage />} />
            <Route path="career/resume" element={<ResumeBuilderPage />} />
            <Route path="career/interview-prep" element={<InterviewPreparationPage />} />
            <Route path="study-tools/notes-summarizer" element={<NotesSummarizerPage />} />
            <Route path="study-tools/practice" element={<PracticeQuestionsPage />} />
            <Route path="community/mentors" element={<PeerMentorshipPage />} />
            <Route path="community/doubts" element={<DoubtResolutionPage />} />
            <Route path="scholarships" element={<CollegeScholarshipsPage />} />
            <Route path="bookmarks" element={<BookmarksPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
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