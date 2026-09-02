const axios = require("axios");
const CollegeStudentProfile = require("../models/CollegeStudentProfile");
const CollegeCareerCatalog = require("../models/CollegeCareerCatalog");

const GROK_API_KEY = process.env.GROK_API_KEY || "xai-JPHZZdSGepdkppoqz9vWnMBzmKwKdenngyfYaO08Wf3Mp0W0ddsapnTkQWD2hhdyTc28IrxnEMkUpbO0";

// Helper function to query xAI Grok API with graceful JSON parsing
async function queryGrokJson(prompt, systemMsg, fallbackData) {
  try {
    const response = await axios.post(
      "https://api.x.ai/v1/chat/completions",
      {
        model: "grok-2-latest",
        messages: [
          { role: "system", content: systemMsg || "Respond strictly in valid JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1200
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROK_API_KEY}`
        },
        timeout: 10000
      }
    );
    const raw = response.data?.choices?.[0]?.message?.content || "";
    const clean = raw.replace(/```json/gi, "").replace(/```/gi, "").trim();
    return JSON.parse(clean);
  } catch (err) {
    console.warn("Grok API query fallback triggered:", err.message);
    return fallbackData;
  }
}

// 1. AI Study Planner Generator
exports.generateStudyPlan = async (req, res) => {
  try {
    const studentId = req.student?.id || req.student?._id;
    const { timePerDay, targetGoal, focusAreas, planType } = req.body;

    const profile = await CollegeStudentProfile.findOne({ student: studentId });
    const degree = profile?.degreeProgramme || "Computer Science / Technology";
    const domain = profile?.domain || "Software Engineering";
    const skills = profile?.skills?.join(", ") || "Programming, Problem Solving";

    const prompt = `Create a structured ${planType || "Weekly"} Study Plan for a college student:
Degree: "${degree}"
Domain: "${domain}"
Acquired Skills: "${skills}"
Daily Study Time Available: "${timePerDay || "2 Hours"}"
Goal: "${targetGoal || "Exam Prep & Skill Building"}"
Focus Areas: "${focusAreas || "Core domain subjects, Data Structures, Industry Projects"}"

Return JSON object with keys:
- "title": string
- "overview": string
- "schedule": array of objects with:
  - "day": string (e.g. "Day 1", "Day 2" or subject name)
  - "topic": string
  - "duration": string
  - "tasks": array of strings (actionable study steps)
  - "learningGoal": string
- "milestones": array of strings
`;

    const fallback = {
      title: `${planType || "Weekly"} AI-Customized Study Plan`,
      overview: `Tailored study plan for ${degree} (${domain}) focusing on core competencies and exam preparation.`,
      schedule: [
        {
          day: "Monday / Session 1",
          topic: "Core Domain Theory & Principles",
          duration: timePerDay || "2 Hours",
          tasks: ["Review fundamental lecture notes", "Solve 5 domain concept problems", "Summarize key definitions"],
          learningGoal: "Master foundational concepts"
        },
        {
          day: "Tuesday / Session 2",
          topic: "Applied Problem Solving & Algorithms",
          duration: timePerDay || "2 Hours",
          tasks: ["Practice coding/logic problems", "Analyze time and space complexity", "Implement sample solution"],
          learningGoal: "Enhance analytical problem-solving"
        },
        {
          day: "Wednesday / Session 3",
          topic: "Hands-on Practical & Tool Mastering",
          duration: timePerDay || "2 Hours",
          tasks: ["Build mini project component", "Debug existing implementation", "Push code to version control"],
          learningGoal: "Gain practical software/domain experience"
        },
        {
          day: "Thursday / Session 4",
          topic: "Weak Spot Diagnostics & Revision",
          duration: timePerDay || "2 Hours",
          tasks: ["Review incorrect quiz questions", "Re-read difficult topic chapters", "Complete practice assessment"],
          learningGoal: "Strengthen weak subject areas"
        },
        {
          day: "Friday / Session 5",
          topic: "Career Prep & Industry Skill Building",
          duration: timePerDay || "2 Hours",
          tasks: ["Read industry article / paper", "Update project documentation", "Practice 3 technical interview questions"],
          learningGoal: "Prepare for internships & placements"
        }
      ],
      milestones: ["Complete 5 core modules", "Build 1 practical portfolio project", "Pass mock assessment with >= 80%"]
    };

    const plan = await queryGrokJson(prompt, "Generate a clean structured JSON study plan.", fallback);
    return res.json({ success: true, plan });
  } catch (err) {
    console.error("Generate Study Plan Error:", err);
    res.status(500).json({ success: false, message: "Failed to generate study plan" });
  }
};

// 2. AI Notes Summarizer
exports.summarizeNotes = async (req, res) => {
  try {
    const { notesText, subject, summaryLength } = req.body;
    if (!notesText || notesText.length < 20) {
      return res.status(400).json({ success: false, message: "Please provide sufficient notes text to summarize." });
    }

    const prompt = `Summarize the following academic lecture/study notes for subject "${subject || "General Academic"}":
---
${notesText.slice(0, 3000)}
---

Return JSON object with keys:
- "title": string
- "executiveSummary": string
- "keyConcepts": array of objects with keys "concept" and "definition"
- "examImportantPoints": array of strings
- "quickRevisionBulletPoints": array of strings
`;

    const fallback = {
      title: `Summary of ${subject || "Study Notes"}`,
      executiveSummary: "These notes outline essential domain concepts, fundamental rules, and practical applications.",
      keyConcepts: [
        { concept: "Core Principle", definition: "The foundational rule governing state transformation and logic execution." },
        { concept: "System Architecture", definition: "The structured arrangement of software components and data flows." }
      ],
      examImportantPoints: [
        "Must remember key definitions and mathematical formulations.",
        "Expect application-based questions on optimization.",
        "Be prepared to compare alternative approaches."
      ],
      quickRevisionBulletPoints: [
        "Review primary equations and definitions.",
        "Focus on high-yield exam topics.",
        "Practice drawing architectural diagrams."
      ]
    };

    const summary = await queryGrokJson(prompt, "Summarize notes in structured JSON.", fallback);
    return res.json({ success: true, summary });
  } catch (err) {
    console.error("Summarize Notes Error:", err);
    res.status(500).json({ success: false, message: "Failed to summarize notes" });
  }
};

// 3. Smart Practice Questions Generator
exports.generatePracticeQuestions = async (req, res) => {
  try {
    const studentId = req.student?.id || req.student?._id;
    const { subject, difficulty, count } = req.body;

    const profile = await CollegeStudentProfile.findOne({ student: studentId });
    const domain = profile?.domain || "Computer Science & Engineering";

    const prompt = `Generate ${count || 5} multiple-choice academic practice questions for a college student in Domain: "${domain}", Subject: "${subject || "Domain Core"}", Difficulty: "${difficulty || "Medium"}".

Return JSON array of objects with keys:
- "id": string
- "question": string
- "options": array of 4 strings
- "correctIndex": integer (0 to 3)
- "topic": string
- "explanation": string
`;

    const fallback = [
      {
        id: "p1",
        question: `In ${domain}, what is the primary benefit of modular software/system design?`,
        options: ["Increased coupling", "High maintainability and reusability", "Slower execution speed", "Eliminates documentation"],
        correctIndex: 1,
        topic: "System Design",
        explanation: "Modular design decouples components, making code easier to test, maintain, and reuse."
      },
      {
        id: "p2",
        question: `Which data structure provides average O(1) key-based lookups?`,
        options: ["Array", "Linked List", "Hash Table / Dictionary", "Binary Search Tree"],
        correctIndex: 2,
        topic: "Data Structures",
        explanation: "Hash Tables utilize hash functions to map keys directly to buckets for O(1) average lookup."
      }
    ];

    const questions = await queryGrokJson(prompt, "Respond strictly in raw JSON array.", fallback);
    return res.json({ success: true, questions });
  } catch (err) {
    console.error("Practice Questions Error:", err);
    res.status(500).json({ success: false, message: "Failed to generate practice questions" });
  }
};

// 4. Profile-Aware Ask AI Chatbot
exports.askAdvisorChat = async (req, res) => {
  try {
    const studentId = req.student?.id || req.student?._id;
    const { message, chatHistory } = req.body;

    const profile = await CollegeStudentProfile.findOne({ student: studentId });
    const studentName = req.student?.name || "Student";
    const degree = profile?.degreeProgramme || "College Student";
    const domain = profile?.domain || "General Branch";
    const skills = profile?.skills?.join(", ") || "General Skills";
    const careerGoals = profile?.careerInterests?.join(", ") || "Software Engineering";

    const systemPrompt = `You are "Uyarvu AI Academic Advisor", an empathetic, highly knowledgeable college academic advisor.
Student Name: "${studentName}"
Degree: "${degree}"
Domain: "${domain}"
Skills: "${skills}"
Target Careers: "${careerGoals}"

Answer the student's question directly with actionable academic, skill, and career advice. Use student profile telemetry to make answers tailored to their exact background. Keep response under 300 words. Format with clean bullet points where appropriate.`;

    let reply = `Hello ${studentName}! Based on your background in ${degree} (${domain}), I recommend focusing on building practical portfolio projects in ${skills} to strengthen your preparation for ${careerGoals}. What specific subject or career query can I clarify for you today?`;

    try {
      const response = await axios.post(
        "https://api.x.ai/v1/chat/completions",
        {
          model: "grok-2-latest",
          messages: [
            { role: "system", content: systemPrompt },
            ...(chatHistory || []).map(c => ({ role: c.sender === "user" ? "user" : "assistant", content: c.text })),
            { role: "user", content: message }
          ],
          temperature: 0.7,
          max_tokens: 600
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GROK_API_KEY}`
          },
          timeout: 10000
        }
      );
      reply = response.data?.choices?.[0]?.message?.content || reply;
    } catch (apiErr) {
      console.warn("Ask AI Chat fallback response used:", apiErr.message);
    }

    return res.json({ success: true, reply });
  } catch (err) {
    console.error("Ask AI Chat Error:", err);
    res.status(500).json({ success: false, message: "Chat response error" });
  }
};

// 5. Intelligent Resume Builder Assistance
exports.generateResumeSuggestions = async (req, res) => {
  try {
    const studentId = req.student?.id || req.student?._id;
    const profile = await CollegeStudentProfile.findOne({ student: studentId });

    const degree = profile?.degreeProgramme || "B.E. Computer Science";
    const domain = profile?.domain || "Computer Science";
    const skills = profile?.skills || ["Python", "Data Structures", "SQL"];
    const interests = profile?.careerInterests || ["Software Engineering"];
    const certs = profile?.certifications || [];

    const prompt = `Based on college student profile:
Degree: "${degree}"
Domain: "${domain}"
Skills: ${JSON.stringify(skills)}
Certifications: ${JSON.stringify(certs)}
Target Career: ${JSON.stringify(interests)}

Generate a structured Resume Content Outline in JSON with keys:
- "professionalSummary": string
- "suggestedProjects": array of objects with "title", "description", "techStack"
- "highlightSkills": array of strings
- "recommendedCertificationsToComplete": array of strings
- "missingSectionsToImprove": array of strings
`;

    const fallback = {
      professionalSummary: `Motivated ${degree} student specializing in ${domain} with strong fundamentals in ${skills.slice(0, 3).join(", ")}. Eager to leverage technical competencies for target roles in ${interests[0] || "Software Development"}.`,
      suggestedProjects: [
        {
          title: "Domain Intelligence & Analytics Dashboard",
          description: "Built a web-based analytics dashboard implementing CRUD operations, REST APIs, and interactive visualization.",
          techStack: "Python / JavaScript / SQL"
        },
        {
          title: "Automated Workflow Optimization Engine",
          description: "Designed a lightweight algorithmic engine to process domain data tasks efficiently.",
          techStack: "Data Structures & Algorithms / Git"
        }
      ],
      highlightSkills: skills,
      recommendedCertificationsToComplete: ["AWS Certified Cloud Practitioner", "Meta Full Stack Professional", "Google Data Analytics"],
      missingSectionsToImprove: ["Include GitHub/Portfolio links", "Quantify project results with metrics (% speedup, lines handled)", "Add competitive coding profile"]
    };

    const resumeData = await queryGrokJson(prompt, "Respond strictly in valid JSON.", fallback);
    return res.json({ success: true, resumeData, profile });
  } catch (err) {
    console.error("Resume Builder Error:", err);
    res.status(500).json({ success: false, message: "Failed to generate resume suggestions" });
  }
};

// 6. AI Interview Preparation Simulator
exports.generateInterviewQuestions = async (req, res) => {
  try {
    const { interviewType, targetRole } = req.body;
    const role = targetRole || "Software Developer";
    const type = interviewType || "Technical";

    const prompt = `Generate 5 realistic ${type} interview questions for candidate applying for "${role}".
Return JSON array of objects with keys:
- "id": string
- "question": string
- "category": string (e.g. "Technical Logic", "System Architecture", "Behavioral")
- "idealAnswerKeyPoints": array of strings
- "sampleGoodAnswer": string
`;

    const fallback = [
      {
        id: "i1",
        question: `How do you approach debugging a memory leak or unexpected performance degradation in a ${role} application?`,
        category: "Technical Problem Solving",
        idealAnswerKeyPoints: ["Profiling tools usage", "Analyzing memory allocation graphs", "Isolating component states"],
        sampleGoodAnswer: "I begin by utilizing profiling tools to monitor heap memory allocation over time, pinpoint un-garbage-collected references, and systematically isolate components."
      },
      {
        id: "i2",
        question: `Describe a scenario where you faced a tough technical disagreement with a team member. How did you resolve it?`,
        category: "Behavioral & Leadership",
        idealAnswerKeyPoints: ["Data-driven decision making", "Active listening", "Focusing on project goals"],
        sampleGoodAnswer: "I presented empirical benchmark results comparing both approaches, listened to my peer's architectural concerns, and reached a consensus that satisfied both performance and code readability."
      }
    ];

    const questions = await queryGrokJson(prompt, "Respond strictly in JSON array.", fallback);
    return res.json({ success: true, questions });
  } catch (err) {
    console.error("Interview Questions Error:", err);
    res.status(500).json({ success: false, message: "Failed to generate interview questions" });
  }
};

// 7. Peer Mentors & Doubts Management
exports.getPeerMentors = async (req, res) => {
  try {
    const mentors = [
      {
        id: "m1",
        name: "Arun Kumar",
        degree: "B.E. Computer Science (4th Year)",
        college: "PSG Tech, Coimbatore",
        expertise: ["Data Structures", "System Design", "Placement Prep"],
        rating: 4.9,
        available: true,
        avatar: "👨‍💻"
      },
      {
        id: "m2",
        name: "Priya Sundaram",
        degree: "M.Tech Data Science",
        college: "Anna University, Chennai",
        expertise: ["Machine Learning", "Python Analytics", "Research Papers"],
        rating: 4.8,
        available: true,
        avatar: "👩‍🔬"
      },
      {
        id: "m3",
        name: "Karthik Raja",
        degree: "B.Tech IT (Final Year)",
        college: "CIT, Coimbatore",
        expertise: ["Full Stack React/Node", "Cloud DevOps", "Hackathons"],
        rating: 4.95,
        available: true,
        avatar: "🚀"
      }
    ];
    return res.json({ success: true, mentors });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load mentors" });
  }
};
