const User = require("../models/User");
const OnboardingQuestion = require("../models/OnboardingQuestion");
const OnboardingResponse = require("../models/OnboardingResponse");
const Recommendation = require("../models/Recommendation");
const ClassContent = require("../models/ClassContent");
const Exam = require("../models/Exam");
const Scholarship = require("../models/Scholarship");
const CareerPath = require("../models/CareerPath");

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

// POST /api/onboarding/submit
exports.submitOnboarding = async (req, res) => {
    try {
        const { 
            userId, grade, answers, 
            marksPercentage, board, interests, preferredStream, 
            stream, preferredCourseCategory, careerInterest, entranceExamPlan,
            goalAfter10th, goalAfter12th 
        } = req.body;

        const processedAnswers = [];
        let correctAnswersCount = 0;
        const skillScores = {}; // { skillTag: { correct: 0, total: 0 } }

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
            if (!skillScores[question.skillTag]) {
                skillScores[question.skillTag] = { correct: 0, total: 0 };
            }
            skillScores[question.skillTag].total += 1;
            if (isCorrect) {
                skillScores[question.skillTag].correct += 1;
            }
        }

        const totalQuestions = answers.length || (grade.includes("12") ? 25 : 20);
        const scorePercentage = Math.round((correctAnswersCount / totalQuestions) * 100);

        // Performance Level
        let performanceLevel = "";
        if (scorePercentage >= 90) performanceLevel = "Excellent";
        else if (scorePercentage >= 75) performanceLevel = "Very Good";
        else if (scorePercentage >= 60) performanceLevel = "Good, needs improvement";
        else if (scorePercentage >= 40) performanceLevel = "Needs focused practice";
        else performanceLevel = "Needs strong guidance and foundation support";

        // Skill-wise Breakdown
        const skillWiseScore = [];
        const strongSkills = [];
        const averageSkills = [];
        const weakSkills = [];

        for (const skillTag in skillScores) {
            const data = skillScores[skillTag];
            const percentage = Math.round((data.correct / data.total) * 100);
            let status = "";

            if (percentage >= 80) {
                status = "Strong Skill";
                strongSkills.push(skillTag);
            } else if (percentage >= 60) {
                status = "Average Skill";
                averageSkills.push(skillTag);
            } else {
                status = "Improvement Needed";
                weakSkills.push(skillTag);
            }

            skillWiseScore.push({
                skillTag,
                score: data.correct,
                total: data.total,
                percentage,
                status
            });
        }

        // ══════════════════════════════════════════════════════════════════════
        // RECOMMENDATION LOGIC
        // ══════════════════════════════════════════════════════════════════════
        const recommendedSkills = [];
        const suggestedActivities = [];
        const recommendedStreams = [];
        const recommendedCourses = [];
        const recommendedCareerPaths = [];
        const recommendedColleges = [];
        const recommendedExams = [];
        let recommendedCutoffDetails = "";
        let learningGuidelines = `You are doing well, but you can improve in some areas. `;
        let improvementMessage = "";

        // Skill-based logic (Generalized for all tags)
        if (weakSkills.some(s => s.includes("Math"))) {
            recommendedSkills.push("Quantitative Aptitude", "Algebra Basics");
            suggestedActivities.push("Practice math problems daily.", "Take aptitude mock tests.");
        }
        if (weakSkills.some(s => s.includes("English") || s.includes("Communication"))) {
            recommendedSkills.push("Business Communication", "Spoken English");
            suggestedActivities.push("Read one article daily.", "Practice mirror speaking.");
        }
        if (weakSkills.some(s => s.includes("Logical") || s.includes("Reasoning"))) {
            recommendedSkills.push("Analytical Reasoning", "Data Interpretation");
            suggestedActivities.push("Solve logical puzzles weekly.", "Analyze charts and graphs.");
        }
        if (weakSkills.some(s => s.includes("Digital") || s.includes("Employability"))) {
            recommendedSkills.push("Digital Literacy", "MS Office Basics");
            suggestedActivities.push("Learn Google Workspace tools.", "Practice email writing.");
        }

        // ══════════════════════════════════════════════════════════════════════
        // CLASS 12 SPECIFIC LOGIC
        // ══════════════════════════════════════════════════════════════════════
        if (grade.includes("12")) {
            // Stream-based
            if (stream === "Science Maths") {
                recommendedCourses.push("B.E/B.Tech", "B.Sc Computer Science", "Architecture");
                recommendedExams.push("TNEA", "JEE Mains", "NATA");
                recommendedCutoffDetails = "Aim for a cutoff above 185 for top TNEA colleges.";
            } else if (stream === "Science Biology") {
                recommendedCourses.push("MBBS/BDS", "B.Pharm", "B.Sc Agriculture");
                recommendedExams.push("NEET", "TNAU");
            } else if (stream === "Commerce") {
                recommendedCourses.push("B.Com", "BBA", "CA/CMA Foundation");
                recommendedExams.push("CUET");
            } else if (stream === "Arts / Humanities") {
                recommendedCourses.push("BA English/History", "Journalism", "Law");
                recommendedExams.push("CLAT", "CUET");
            }

            // Interest-based
            if (careerInterest?.includes("Software") || careerInterest?.includes("Computer")) {
                recommendedSkills.push("Coding (Python/C++)", "Web Development");
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

        if (weakSkills.length > 0) {
            learningGuidelines += `Focus on ${weakSkills.join(", ")} by spending extra 60 minutes daily on these areas.`;
        } else {
            learningGuidelines = "Excellent work! You have strong foundations. Focus on competitive exam strategies now.";
        }

        // ══════════════════════════════════════════════════════════════════════
        // FETCH MATCHING CONTENT
        // ══════════════════════════════════════════════════════════════════════
        const cleanGrade = grade.replace("Class ", "").replace(/\D/g, "");
        
        const [skillsContent, examsContent, scholarshipsContent, careersContent, habitsContent, funContent] = await Promise.all([
            ClassContent.find({ targetClass: cleanGrade, status: "published", sectionType: "Skills" }).limit(4),
            Exam.find({ targetClass: { $in: [cleanGrade, "All"] } }).limit(3),
            Scholarship.find({ targetClass: { $in: [cleanGrade, "All"] } }).limit(3),
            CareerPath.find({ level: { $in: [`${cleanGrade}th`, `Class ${cleanGrade}`] } }).limit(3),
            ClassContent.find({ targetClass: cleanGrade, status: "published", sectionType: "Habits" }).limit(2),
            ClassContent.find({ targetClass: cleanGrade, status: "published", sectionType: "Fun" }).limit(2)
        ]);

        if (cleanGrade === "10") {
            recommendedExams.push("NTSE", "Diploma Entrance");
        } else if (cleanGrade === "12" && recommendedExams.length === 0) {
            recommendedExams.push("CUET", "TANCET (Later)");
        }

        // Save Response
        const response = new OnboardingResponse({
            userId, grade, answers: processedAnswers, totalQuestions,
            correctAnswers: correctAnswersCount, wrongAnswers: totalQuestions - correctAnswersCount,
            scorePercentage, performanceLevel, skillWiseScore,
            strongSkills, averageSkills, weakSkills
        });
        await response.save();

        // Save Recommendation
        const recommendation = new Recommendation({
            userId, grade, scorePercentage, performanceLevel,
            marksPercentage, board, stream, interests, preferredStream, 
            preferredCourseCategory, careerInterest, entranceExamPlan,
            goalAfter10th, goalAfter12th,
            strongSkills, averageSkills, weakSkills,
            recommendedSkills, recommendedStreams, recommendedCourses, 
            recommendedExams, 
            recommendedScholarships: scholarshipsContent.map(s => s.scholarshipName || s.title),
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

        await User.findByIdAndUpdate(userId, { onboardingCompleted: true, recommendationGenerated: true });

        res.json({ success: true, result: recommendation, response });
    } catch (error) {
        console.error("Onboarding submit error:", error);
        res.status(500).json({ success: false, message: "Submission failed" });
    }
};

// GET /api/recommendations/user/:userId
exports.getRecommendations = async (req, res) => {
    try {
        const { userId } = req.params;
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
        const { userId } = req.params;
        
        // Reset user onboarding status
        await User.findByIdAndUpdate(userId, { 
            onboardingCompleted: false, 
            recommendationGenerated: false 
        });

        // Optionally delete previous data to keep it clean
        await OnboardingResponse.deleteMany({ userId });
        await Recommendation.deleteMany({ userId });

        res.json({ success: true, message: "Assessment reset successfully. You can now retake the onboarding." });
    } catch (error) {
        console.error("Retake assessment error:", error);
        res.status(500).json({ success: false, message: "Failed to reset assessment" });
    }
};
