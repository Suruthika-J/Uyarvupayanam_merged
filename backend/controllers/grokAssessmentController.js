const axios = require("axios");

const GROK_API_KEY = process.env.GROK_API_KEY || "xai-JPHZZdSGepdkppoqz9vWnMBzmKwKdenngyfYaO08Wf3Mp0W0ddsapnTkQWD2hhdyTc28IrxnEMkUpbO0";

// Fallback question generator in case of network timeouts or API key rate limits
const generateFallbackQuestions = (degree, domain) => {
  const degName = degree || "Computer Science";
  const domName = domain || "Software Engineering";
  return [
    {
      id: "q1",
      question: `In ${degName} (${domName}), which fundamental data structure operates on a First-In, First-Out (FIFO) basis?`,
      options: ["Stack", "Queue", "Binary Tree", "Graph"],
      correctIndex: 1,
      topic: "Core Fundamentals",
      explanation: "A Queue works on the FIFO (First-In, First-Out) principle, whereas a Stack works on LIFO."
    },
    {
      id: "q2",
      question: `Which algorithmic complexity represents constant time execution in ${domName}?`,
      options: ["O(1)", "O(n)", "O(n²)", "O(log n)"],
      correctIndex: 0,
      topic: "Algorithm Analysis",
      explanation: "O(1) signifies constant time complexity regardless of input size."
    },
    {
      id: "q3",
      question: `What primary principle ensures data encapsulation and protection in modern ${degName} design?`,
      options: ["Inheritance", "Polymorphism", "Encapsulation / Private Scope", "Abstraction"],
      correctIndex: 2,
      topic: "Software Design Principles",
      explanation: "Encapsulation hides internal object state and restricts direct access to safe interface methods."
    },
    {
      id: "q4",
      question: `In practical ${domName} workflows, which tool is universally used for distributed version control?`,
      options: ["Docker", "Git", "Kubernetes", "Jenkins"],
      correctIndex: 1,
      topic: "Developer Tools",
      explanation: "Git is the standard distributed version control system used worldwide."
    },
    {
      id: "q5",
      question: `When optimizing performance for ${domName} applications, what is the primary benefit of caching?`,
      options: ["Reduces memory usage", "Eliminates database queries for frequent data", "Secures user passwords", "Compiles code faster"],
      correctIndex: 1,
      topic: "System Performance",
      explanation: "Caching stores frequently accessed data in fast memory to eliminate repetitive database calls."
    }
  ];
};

exports.generateGrokQuestions = async (req, res) => {
  try {
    const { degreeProgramme, domain, userType } = req.body;
    const degree = degreeProgramme || "Engineering / Technology";
    const dom = domain || "Computer Science";

    const prompt = `You are an expert academic assessment generator for college students and graduates.
Generate exactly 5 randomized Easy to Medium multiple-choice diagnostic onboarding questions for a student studying:
Degree: "${degree}"
Domain / Branch: "${dom}"

Return ONLY a valid JSON array of objects with no markdown formatting or extra commentary.
Each object MUST have:
- "id": string (e.g. "g1", "g2", etc.)
- "question": string (clear, relevant question for ${degree} - ${dom})
- "options": array of 4 distinct string choices
- "correctIndex": integer (0 to 3)
- "topic": string (sub-topic or concept area)
- "explanation": string (brief 1-sentence explanation of why the correct answer is right)
`;

    try {
      const grokResponse = await axios.post(
        "https://api.x.ai/v1/chat/completions",
        {
          model: "grok-2-latest",
          messages: [
            {
              role: "system",
              content: "You are a specialized academic question generator. Respond strictly in raw valid JSON arrays."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GROK_API_KEY}`
          },
          timeout: 10000
        }
      );

      const rawText = grokResponse.data?.choices?.[0]?.message?.content || "";
      const cleanedJson = rawText.replace(/```json/gi, "").replace(/```/gi, "").trim();
      const questions = JSON.parse(cleanedJson);

      if (Array.isArray(questions) && questions.length > 0) {
        return res.json({
          success: true,
          source: "xAI Grok API",
          degreeProgramme: degree,
          domain: dom,
          questions
        });
      }
    } catch (apiErr) {
      console.warn("xAI Grok API call failed or timed out, serving fallback questions:", apiErr.message);
    }

    // Serving robust dynamic fallback questions if Grok API call is delayed or unfulfilled
    const fallbacks = generateFallbackQuestions(degree, dom);
    return res.json({
      success: true,
      source: "Academic Advisor Intelligence Engine (Fallback)",
      degreeProgramme: degree,
      domain: dom,
      questions: fallbacks
    });
  } catch (error) {
    console.error("Grok questions generation error:", error);
    res.status(500).json({ success: false, message: "Failed to generate assessment questions" });
  }
};
