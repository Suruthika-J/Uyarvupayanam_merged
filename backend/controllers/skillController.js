const Skill = require("../models/Skill");
const OnboardingResponse = require("../models/OnboardingResponse");

exports.getAllSkills = async (req, res) => {
    try {
        const skills = await Skill.find();
        res.json({ success: true, data: skills });
    } catch (error) {
        res.status(500).json({ success: false, message: "Fetch failed" });
    }
};

exports.getRecommendedSkills = async (req, res) => {
    try {
        const { userId } = req.params;
        const onboarding = await OnboardingResponse.findOne({ userId }).sort({ createdAt: -1 });

        if (!onboarding) {
            return res.status(404).json({ success: false, message: "Onboarding result not found" });
        }

        const { strengths, weaknesses, classLevel } = onboarding;

        // Fetch skills that match user's strengths
        const recommendedSkills = await Skill.find({
            category: { $in: strengths },
            classLevel: { $in: [classLevel, "All"] }
        });

        // Fetch skills that match user's weaknesses (areas to improve)
        const improvementSkills = await Skill.find({
            category: { $in: weaknesses },
            classLevel: { $in: [classLevel, "All"] }
        });

        res.json({
            success: true,
            data: {
                recommendedSkills,
                improvementSkills
            }
        });
    } catch (error) {
        console.error("Fetch recommended skills error:", error);
        res.status(500).json({ success: false, message: "Fetch failed" });
    }
};
