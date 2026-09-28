const User = require("../models/User");
const OnboardingQuestion = require("../models/OnboardingQuestion");
const OnboardingResponse = require("../models/OnboardingResponse");
const Recommendation = require("../models/Recommendation");
const ClassContent = require("../models/ClassContent");
const AssessmentResult = require("../models/AssessmentResult");
const GeneratedAssessment = require("../models/GeneratedAssessment");
const AssessmentSummary = require("../models/AssessmentSummary");
const Exam = require("../models/Exam");
const Scholarship = require("../models/Scholarship");
const CareerPath = require("../models/CareerPath");
const { getRecommendations } = require("../utils/recommendationEngine");
const { upsertStudentProfile } = require("../utils/studentProfileSync");

// GET /api/onboarding/questions/:grade
exports.getQuestions = async (req, res) => {
    try {
        const { grade } = req.params;
        // Normalize grade string (e.g., "Class 5", "Class 8", "Class 10")
        const normalizedGrade = grade.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase());
        
        const questions = await OnboardingQuestion.find({ grade: normalizedGrade });
        res.json({ success: true, questions });
    } catch (error) {
        console.error("Get questions error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch questions" });
    }
};

function addUnique(list, values) {
    for (const v of values) {
        if (v && !list.includes(v)) list.push(v);
    }
    return list;
}

// POST /api/onboarding/submit
// Accepts either:
//   - { userId, grade, answers, ... }            → legacy static-bank scoring
//   - { studentId, sessionId, answers, ... }     → session scoring against
//                                                 generated_assessments (AI set)
// Answers are matched against the server's stored correctAnswer only — the
// client is never trusted, and the LLM is never re-queried to grade anything.
// Scoring feeds the standalone recommendation engine; the legacy Recommendation
// / OnboardingResponse documents keep their shape so the existing result
// screen keeps working; per-skill rows are persisted to assessment_results and
// a full engine snapshot to assessment_summaries.
exports.submitOnboarding = async (req, res) => {
    try {
        const { 
            userId, studentId, grade, answers, sessionId,
            marksPercentage, board, interests, preferredStream, 
            stream, preferredCourseCategory, careerInterest, entranceExamPlan,
            goalAfter10th, goalAfter12th 
        } = req.body;

        const resolvedUserId = userId || studentId;
        if (!resolvedUserId) {
            return res.status(400).json({ success: false, message: "userId or studentId is required" });
        }
        if (!Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ success: false, message: "answers are required" });
        }

        const processedAnswers = [];
        let correctAnswersCount = 0;
        const skillScores = {}; // { skillTag: { correct: 0, total: 0 } }

        if (sessionId) {
            // ── Session-based evaluation: source of truth is generated_assessments ──
            const sessionRows = await GeneratedAssessment.find({ sessionId, studentId: resolvedUserId }).lean();
            if (!sessionRows.length) {
                return res.status(400).json({
                    success: false,
                    message: "Assessment session not found. Please restart the assessment.",
                });
            }
            const answerMap = new Map();
            for (const row of sessionRows) {
                answerMap.set(String(row._id), { skill: row.skill, correctAnswer: row.correctAnswer });
            }

            for (const ans of answers) {
                const meta = answerMap.get(String(ans.questionId));
                if (!meta) continue; // ids outside this session are ignored

                const isCorrect = meta.correctAnswer === ans.selectedAnswer;
                if (isCorrect) correctAnswersCount++;

                processedAnswers.push({
                    questionId: ans.questionId,
                    selectedAnswer: ans.selectedAnswer,
                    isCorrect
                });

                const tag = meta.skill || "General";
                if (!skillScores[tag]) skillScores[tag] = { correct: 0, total: 0 };
                skillScores[tag].total += 1;
                if (isCorrect) skillScores[tag].correct += 1;
            }
        } else {
            // ── Legacy static-bank evaluation ──
            for (const ans of answers) {
                const question = await OnboardingQuestion.findById(ans.questionId);
                if (!question) continue;

                const isCorrect = question.correctAnswer === ans.selectedAnswer;
                if (isCorrect) correctAnswersCount++;

                processedAnswers.push({
                    questionId: question._id,
                    selectedAnswer: ans.selectedAnswer,
                    isCorrect
                });

                // Skill Tag Tracking
                const tag = question.skillTag || "General";
                if (!skillScores[tag]) skillScores[tag] = { correct: 0, total: 0 };
                skillScores[tag].total += 1;
                if (isCorrect) skillScores[tag].correct += 1;
            }
        }

        const totalQuestions = processedAnswers.length || answers.length || (grade.includes("12") ? 25 : 20);
        const scorePercentage = Math.round((correctAnswersCount / totalQuestions) * 100);

        // ── Recommendation engine (identical for both scoring paths) ──
        const skillResults = Object.entries(skillScores).map(([skill, v]) => ({ skill, correct: v.correct, total: v.total }));
        const engine = await getRecommendations({ studentGrade: grade, skillResults });

        // Legacy performanceLevel mapping from the engine's overall level
        let performanceLevel = "Needs focused practice";
        if (engine.overallLevel === "Strong") performanceLevel = "Excellent";
        else if (engine.overallLevel === "Average") performanceLevel = "Good, needs improvement";

        // Skill-wise Breakdown (legacy shape, engine data)
        const skillWiseScore = engine.skillBreakdown.map((b) => ({
            skillTag: b.skill,
            score: b.correct,
            total: b.total,
            percentage: b.percentage,
            status: b.level === "Strong" ? "Strong Skill" : b.level === "Average" ? "Average Skill" : "Improvement Needed"
        }));

        const strongSkills = engine.strongSkills;
        const averageSkills = engine.skillBreakdown.filter((b) => b.level === "Average").map((b) => b.skill);
        const weakSkills = engine.needsImprovement;

        // ══════════════════════════════════════════════════════════════════════
        // RECOMMENDATION LOGIC
        // ══════════════════════════════════════════════════════════════════════
        const recommendedSkills = [...engine.recommendedSkillsToFocus];
        const suggestedActivities = [...engine.suggestedActivities];
        const recommendedStreams = [];
        const recommendedCourses = [];
        const recommendedCareerPaths = [];
        const recommendedColleges = [];
        const recommendedExams = [...engine.recommendedExams];
        const recommendedScholarships = [];
        let recommendedCutoffDetails = "";
        const learningGuidelines = engine.quickGuideline;
        let improvementMessage = "";

        // Skill-based logic (Generalized for all tags)
        if (weakSkills.some(s => s.includes("Math"))) {
            addUnique(recommendedSkills, ["Quantitative Aptitude", "Algebra Basics"]);
            addUnique(suggestedActivities, ["Practice math problems daily.", "Take aptitude mock tests."]);
        }
        if (weakSkills.some(s => s.includes("English") || s.includes("Communication"))) {
            addUnique(recommendedSkills, ["Business Communication", "Spoken English"]);
            addUnique(suggestedActivities, ["Read one article daily.", "Practice mirror speaking."]);
        }
        if (weakSkills.some(s => s.includes("Logical") || s.includes("Reasoning"))) {
            addUnique(recommendedSkills, ["Analytical Reasoning", "Data Interpretation"]);
            addUnique(suggestedActivities, ["Solve logical puzzles weekly.", "Analyze charts and graphs."]);
        }
        if (weakSkills.some(s => s.includes("Digital") || s.includes("Employability"))) {
            addUnique(recommendedSkills, ["Digital Literacy", "MS Office Basics"]);
            addUnique(suggestedActivities, ["Learn Google Workspace tools.", "Practice email writing."]);
        }

        // ══════════════════════════════════════════════════════════════════════
        // CLASS 12 SPECIFIC LOGIC
        // ══════════════════════════════════════════════════════════════════════
        if (grade.includes("12")) {
            // Stream-based
            if (stream === "Science Maths") {
                recommendedCourses.push("B.E/B.Tech", "B.Sc Computer Science", "Architecture");
                addUnique(recommendedExams, ["TNEA", "JEE Mains", "NATA"]);
                recommendedCutoffDetails = "Aim for a cutoff above 185 for top TNEA colleges.";
            } else if (stream === "Science Biology") {
                recommendedCourses.push("MBBS/BDS", "B.Pharm", "B.Sc Agriculture");
                addUnique(recommendedExams, ["NEET", "TNAU"]);
            } else if (stream === "Commerce") {
                recommendedCourses.push("B.Com", "BBA", "CA/CMA Foundation");
                addUnique(recommendedExams, ["CUET"]);
            } else if (stream === "Arts / Humanities") {
                recommendedCourses.push("BA English/History", "Journalism", "Law");
                addUnique(recommendedExams, ["CLAT", "CUET"]);
            }

            // Interest-based
            if (careerInterest?.includes("Software") || careerInterest?.includes("Computer")) {
                addUnique(recommendedSkills, ["Coding (Python/C++)", "Web Development"]);
                recommendedCourses.push("Full Stack Development", "Data Science Cert");
            } else if (careerInterest?.includes("Doctor")) {
                recommendedCareerPaths.push("Specialist Doctor", "Surgeon", "Medical Researcher");
            }

            // Entrance Exam-based
            if (entranceExamPlan === "TNEA") {
                recommendedColleges.push("Anna University (CEG/MIT)", "PSG Tech", "SSN College");
            } else if (entranceExamPlan === "NEET") {
                recommendedColleges.push("MMC Chennai", "Stanley Medical College", "Madurai Medical College");
            }

            // Marks-based
            if (marksPercentage >= 85) {
                improvementMessage = "With your excellent marks, aim for top-tier institutions and national level scholarships.";
                recommendedScholarships.push("Vidyasaarathi", "HDFC Badhte Kadam");
            } else if (marksPercentage < 60) {
                improvementMessage = "Consider practical job-ready skill courses and diploma lateral entry options in Polytechnic colleges.";
                recommendedCourses.push("Diploma (Lateral Entry)");
                recommendedColleges.push("Government Polytechnic Colleges", "A M K Technological Polytechnic");
            }
        }

        // ══════════════════════════════════════════════════════════════════════
        // CLASS 10 SPECIFIC LOGIC (Refined)
        // ══════════════════════════════════════════════════════════════════════
        if (grade.includes("10")) {
            if (goalAfter10th === "Continue 11th and 12th") {
                // Interest & Marks Based Stream Selection
                const isScienceInterest = ["Maths Biology (PCMB)", "Maths Computer Science (PCM-CS)", "Biology (PCB)"].includes(preferredStream) || 
                                          careerInterest?.includes("Engineer") || careerInterest?.includes("Software");
                
                const isCommerceInterest = ["Commerce with Accountancy", "Commerce with Business Maths", "Commerce with Computer Science"].includes(preferredStream) || 
                                           careerInterest?.includes("Business") || careerInterest?.includes("Finance");
                
                const isArtsInterest = preferredStream === "Arts with Humanities subjects" || 
                                       careerInterest?.includes("Lawyer") || careerInterest?.includes("Society") || careerInterest?.includes("Government");

                if (isScienceInterest) {
                    if (preferredStream === "Biology (PCB)") {
                        recommendedStreams.push("Science: Biology (PCB)");
                        recommendedCourses.push("MBBS", "BDS", "B.Pharm", "Nursing", "Para-medical");
                        improvementMessage = "Biology focus (PCB) is ideal for your interest in the medical and healthcare field.";
                    } else if (preferredStream === "Maths Biology (PCMB)") {
                        recommendedStreams.push("Science: Maths + Biology (PCMB)");
                        recommendedCourses.push("B.Tech / B.E", "MBBS", "Agriculture", "Bio-Tech");
                        improvementMessage = "PCMB is the most flexible stream, keeping both Engineering and Medical options open.";
                    } else {
                        recommendedStreams.push("Science: Maths + Computer Science (PCM-CS)");
                        recommendedCourses.push("B.Tech / B.E", "BCA", "Data Science / AI", "Coding Careers");
                        improvementMessage = "PCM with Computer Science is the best foundation for Engineering and IT careers.";
                    }
                } 
                
                if (isCommerceInterest) {
                    recommendedStreams.push(preferredStream || "Commerce");
                    recommendedCourses.push("B.Com", "BBA", "CA / CMA / CS", "Banking & Finance");
                    
                    if (preferredStream === "Commerce with Business Maths") {
                        recommendedCourses.push("Actuarial Science", "Data Analytics");
                        improvementMessage = "Commerce with Business Maths is excellent for Finance, Analytics, and Banking exams.";
                    } else if (preferredStream === "Commerce with Computer Science") {
                        recommendedCourses.push("FinTech", "B.Com CA");
                        improvementMessage = "Commerce with CS is great for the growing FinTech and Business IT sectors.";
                    } else {
                        improvementMessage = "Commerce with Accountancy is the core foundation for CA, Business, and Finance.";
                    }
                } 

                if (isArtsInterest) {
                    recommendedStreams.push("Arts with Humanities (History, Pol Science, Geography)");
                    recommendedCourses.push("Law (BA LLB)", "Journalism", "UPSC / Civil Services", "Psychology");
                    improvementMessage = "Arts offers great scope in Law, Journalism, Psychology and Public Services.";
                }

                // Fallback / General Recommendation based on marks
                if (recommendedStreams.length === 0) {
                    if (marksPercentage >= 85) {
                        recommendedStreams.push("Science (PCM / PCB)");
                    } else if (marksPercentage >= 60) {
                        recommendedStreams.push("Commerce", "Arts");
                    } else {
                        recommendedStreams.push("Arts", "Vocational");
                    }
                }
            } else if (goalAfter10th?.includes("Diploma") || goalAfter10th?.includes("ITI")) {
                recommendedStreams.push("Diploma / Polytechnic", "ITI Trades");
                recommendedCourses.push("Diploma in Mechanical/Civil/CSE", "Electrician / Fitter Trades");
                recommendedColleges.push("Central Polytechnic College", "Government Polytechnic Colleges");
                improvementMessage = "Since you want to join early career paths, Diploma/ITI offers direct job opportunities.";
            } else {
                // General or Not Sure
                recommendedStreams.push("Science", "Commerce", "Arts");
                improvementMessage = "Explore your interests in the next 2 years. Science is flexible, Commerce is for business.";
            }
        }

        // ══════════════════════════════════════════════════════════════════════
        // FETCH MATCHING CONTENT
        // ══════════════════════════════════════════════════════════════════════
        const cleanGrade = grade.replace("Class ", "").replace(/\D/g, "");
        
        const [skillsContent, examsContent, scholarshipsContent, careersContent, habitsContent, funContent] = await Promise.all([
            ClassContent.find({ targetClass: cleanGrade, status: "published", sectionType: "Skills" }).limit(4),
            Exam.find({ applicableClass: { $in: [cleanGrade, "All"] } }).limit(3),
            Scholarship.find({ targetClass: { $in: [cleanGrade, "All"] } }).limit(3),
            CareerPath.find({ level: { $in: [`${cleanGrade}th`, `Class ${cleanGrade}`] } }).limit(3),
            ClassContent.find({ targetClass: cleanGrade, status: "published", sectionType: "Habits" }).limit(2),
            ClassContent.find({ targetClass: cleanGrade, status: "published", sectionType: "Fun" }).limit(2)
        ]);

        if (cleanGrade === "10") {
            addUnique(recommendedExams, ["NTSE", "Diploma Entrance"]);
        } else if (cleanGrade === "12" && recommendedExams.length === 0) {
            addUnique(recommendedExams, ["CUET", "TANCET (Later)"]);
        }

        // Save Response
        const response = new OnboardingResponse({
            userId: resolvedUserId, grade, answers: processedAnswers, totalQuestions,
            correctAnswers: correctAnswersCount, wrongAnswers: totalQuestions - correctAnswersCount,
            scorePercentage, performanceLevel, skillWiseScore,
            strongSkills, averageSkills, weakSkills
        });
        await response.save();

        // Save Recommendation (legacy shape — engine-powered skill data)
        const recommendation = new Recommendation({
            userId: resolvedUserId, grade, scorePercentage, performanceLevel,
            marksPercentage, board, stream, interests, preferredStream, 
            preferredCourseCategory, careerInterest, entranceExamPlan,
            goalAfter10th, goalAfter12th,
            strongSkills, averageSkills, weakSkills,
            recommendedSkills, recommendedStreams, recommendedCourses, 
            recommendedExams, 
            recommendedScholarships: [...new Set([...scholarshipsContent.map(s => s.scholarshipName || s.title), ...recommendedScholarships])],
            recommendedColleges, recommendedCutoffDetails, recommendedCareerPaths,
            suggestedActivities, learningGuidelines, improvementMessage,
            fetchedClass5Content: {
                skills: skillsContent.map(s => s._id),
                exams: examsContent.map(e => e._id),
                scholarships: scholarshipsContent.map(s => s._id),
                careers: careersContent.map(c => c._id),
                habits: habitsContent.map(h => h._id),
                fun: funContent.map(f => f._id)
            }
        });
        await recommendation.save();

        // Phase 3 — durable StudentProfile home for the onboarding fields this
        // legacy payload carries (its `interests[]` list stays Recommendation-
        // only; it is not a StudentProfile field). Best-effort only: a sync
        // failure must not change the (already succeeding) submission behavior.
        try {
            await upsertStudentProfile({
                userId: resolvedUserId,
                classLevel: grade,
                fields: { marksPercentage, board, stream, preferredStream, preferredCourseCategory, careerInterest, entranceExamPlan, goalAfter10th, goalAfter12th },
            });
        } catch (syncErr) {
            console.error("StudentProfile sync (legacy submit) failed:", syncErr.message);
        }

        await User.findByIdAndUpdate(resolvedUserId, { onboardingCompleted: true, recommendationGenerated: true });

        // Persist one assessment_results row per skill so admins can review the
        // student's results (student_id, skill, score, total_questions, submitted_at).
        const resultUser = await User.findById(resolvedUserId).select("name email").lean();
        const submittedAt = new Date(); // one timestamp per attempt so admin rows group into a single attempt
        await AssessmentResult.deleteMany({ studentId: resolvedUserId });
        if (skillWiseScore.length) {
            await AssessmentResult.insertMany(
                skillWiseScore.map((s) => ({
                    studentId: resolvedUserId,
                    studentName: resultUser?.name || "",
                    studentEmail: resultUser?.email || "",
                    grade,
                    skill: s.skillTag,
                    score: s.score,
                    totalQuestions: s.total,
                    percentage: s.percentage,
                    submittedAt,
                }))
            );
        }

        // Persist the full engine snapshot (per spec: save the result against the student)
        await AssessmentSummary.create({
            studentId: resolvedUserId,
            sessionId: sessionId || "",
            grade,
            overallScore: engine.overallScore,
            overallLevel: engine.overallLevel,
            skillBreakdown: engine.skillBreakdown,
            strongSkills: engine.strongSkills,
            needsImprovement: engine.needsImprovement,
            recommendedSkillsToFocus: engine.recommendedSkillsToFocus,
            suggestedActivities: engine.suggestedActivities,
            recommendedExams: engine.recommendedExams,
            quickGuideline: engine.quickGuideline,
            submittedAt,
        });

        res.json({ success: true, result: recommendation, response });
    } catch (error) {
        console.error("Onboarding submit error:", error);
        res.status(500).json({ success: false, message: "Submission failed" });
    }
};

// GET /api/recommendations/user/:userId
exports.getRecommendations = async (req, res) => {
    try {
        // Owner is guaranteed by verifyStudent + verifyOwnership middleware.
        const userId = req.student._id;
        const recommendation = await Recommendation.findOne({ userId })
            .sort({ createdAt: -1 })
            .populate("fetchedClass5Content.skills")
            .populate("fetchedClass5Content.exams")
            .populate("fetchedClass5Content.scholarships")
            .populate("fetchedClass5Content.careers")
            .populate("fetchedClass5Content.habits")
            .populate("fetchedClass5Content.fun");

        if (!recommendation) {
            return res.status(404).json({ success: false, message: "No recommendations found" });
        }

        res.json({ success: true, result: recommendation });
    } catch (error) {
        console.error("Get recommendations error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch recommendations" });
    }
};

// POST /api/onboarding/retake/:userId
exports.retakeAssessment = async (req, res) => {
    try {
        // Owner is guaranteed by verifyStudent + verifyOwnership middleware.
        const userId = req.student._id;
        
        // Reset user onboarding status
        await User.findByIdAndUpdate(userId, { 
            onboardingCompleted: false, 
            recommendationGenerated: false 
        });

        // Optionally delete previous data to keep it clean
        await OnboardingResponse.deleteMany({ userId });
        await Recommendation.deleteMany({ userId });
        await AssessmentResult.deleteMany({ studentId: userId });
        await GeneratedAssessment.deleteMany({ studentId: userId });
        await AssessmentSummary.deleteMany({ studentId: userId });

        res.json({ success: true, message: "Assessment reset successfully. You can now retake the onboarding." });
    } catch (error) {
        console.error("Retake assessment error:", error);
        res.status(500).json({ success: false, message: "Failed to reset assessment" });
    }
};