const axios = require("axios");
const PracticeQuestion = require("../models/PracticeQuestion");
const QuestionValidationService = require("./QuestionValidationService");

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROK_API_KEY = process.env.GROK_API_KEY || "";
const AI_MODEL = process.env.AI_QUESTIONS_MODEL || "openai/gpt-oss-120b";

class QuestionGenerationService {
    /**
     * Query LLM provider with clean JSON parsing
     */
    static async queryLLM(prompt, systemMsg) {
        const apiKey = GROQ_API_KEY || GROK_API_KEY;
        if (!apiKey) {
            console.warn("[QuestionGenerationService] No API key configured. Returning null to trigger fallback DB bank.");
            return null;
        }

        const endpoint = GROQ_API_KEY
            ? "https://api.groq.com/openai/v1/chat/completions"
            : "https://api.x.ai/v1/chat/completions";

        const modelName = GROQ_API_KEY ? AI_MODEL : "grok-2-latest";

        try {
            const response = await axios.post(
                endpoint,
                {
                    model: modelName,
                    messages: [
                        { role: "system", content: systemMsg || "Respond strictly in valid JSON object matching the requested schema." },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 3000
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${apiKey}`
                    },
                    timeout: 22000
                }
            );

            const raw = response.data?.choices?.[0]?.message?.content || "";
            let clean = raw.replace(/```json/gi, "").replace(/```/gi, "").trim();

            if (!clean.endsWith("}") && !clean.endsWith("]")) {
                const lastObjEnd = clean.lastIndexOf("}");
                if (lastObjEnd !== -1) {
                    clean = clean.substring(0, lastObjEnd + 1);
                }
            }

            return JSON.parse(clean);
        } catch (err) {
            console.warn("[QuestionGenerationService] LLM API call error:", err.response?.data || err.message);
            return null;
        }
    }

    /**
     * Generate practice questions for a session
     */
    static async generateSessionQuestions({ subjectInput, topic = null, difficultyInput = "MEDIUM", count = 5 }) {
        const subjectId = QuestionValidationService.resolveSubjectId(subjectInput);
        const subjectName = this.resolveSubjectName(subjectId, subjectInput);
        const diffUpper = (difficultyInput || "MEDIUM").toUpperCase();
        const difficulty = ["EASY", "MEDIUM", "HARD", "ADVANCED"].includes(diffUpper) ? diffUpper : "MEDIUM";
        const targetCount = Math.max(1, parseInt(count) || 5);

        // Fetch all existing normalized questions for this subject in MongoDB to avoid duplicates
        const existingDocs = await PracticeQuestion.find({ subjectId }).select("normalizedQuestion questionText").lean();
        const existingTextsSet = new Set(existingDocs.map(d => d.normalizedQuestion));

        const validQuestions = [];
        const currentSessionNormSet = new Set();

        // Build LLM Prompt
        const prompt = `You are a distinguished university computer science professor setting official practice exam questions for college students in India.

SUBJECT: "${subjectName}" (ID: ${subjectId})
${topic ? `SPECIFIC TOPIC FOCUS: "${topic}"` : `TOPIC DISTRIBUTION: Distribute questions across core subtopics of ${subjectName}.`}
TARGET DIFFICULTY: ${difficulty}

DIFFICULTY LEVEL COGNITIVE SPECIFICATIONS:
- EASY: Core definitions, basic syntax, direct terminology recall, straightforward examples.
- MEDIUM: Scenario application, 1-2 step reasoning, code/query interpretation, conceptual trade-offs, moderate debugging.
- HARD: Multi-step reasoning, complex edge cases, system optimization, low-level mechanics, performance trade-offs.
- ADVANCED: Expert system architecture, complex concurrency control, micro-optimizations, real-world high-concurrency production scenarios.

Generate ${targetCount} completely FRESH, UNSEEN multiple-choice questions.

Respond strictly in valid JSON format:
{
  "questions": [
    {
      "questionText": "Clear, precise ${difficulty} level question text for ${subjectName}",
      "options": [
        { "id": "A", "text": "Option A text" },
        { "id": "B", "text": "Option B text" },
        { "id": "C", "text": "Option C text" },
        { "id": "D", "text": "Option D text" }
      ],
      "correctOption": "B",
      "explanation": "Detailed step-by-step conceptual explanation",
      "subject": "${subjectName}",
      "topic": "${topic || 'General Domain Concepts'}",
      "difficulty": "${difficulty}"
    }
  ]
}`;

        const llmResult = await this.queryLLM(prompt, "Respond strictly in valid JSON object matching the requested schema.");

        if (llmResult && Array.isArray(llmResult.questions)) {
            for (const q of llmResult.questions) {
                const valResult = QuestionValidationService.validateQuestion(q, subjectName, difficulty);
                if (!valResult.valid) {
                    console.warn(`[QuestionGenerationService] Question validation failed: ${valResult.reason}`);
                    continue;
                }

                const sanitized = valResult.sanitized;
                const norm = QuestionValidationService.normalizeText(sanitized.questionText);

                if (existingTextsSet.has(norm) || currentSessionNormSet.has(norm)) {
                    console.warn(`[QuestionGenerationService] Duplicate question rejected: "${sanitized.questionText}"`);
                    continue;
                }

                const questionId = `${subjectId.toUpperCase()}_${difficulty.charAt(0)}_${Date.now()}_${validQuestions.length + 1}`;
                sanitized.questionId = questionId;

                validQuestions.push(sanitized);
                currentSessionNormSet.add(norm);
                existingTextsSet.add(norm);

                if (validQuestions.length >= targetCount) break;
            }
        }

        // If LLM returned fewer questions than needed, fallback to MongoDB 720-question bank (Section 25)
        if (validQuestions.length < targetCount) {
            const needed = targetCount - validQuestions.length;
            console.log(`[QuestionGenerationService] LLM generated ${validQuestions.length}/${targetCount} questions. Fetching ${needed} fallback questions from MongoDB bank...`);

            let query = { subjectId, difficulty, active: true };
            if (topic) {
                query.$or = [{ topicId: topic.toLowerCase() }, { topicName: new RegExp(topic, "i") }];
            }

            let fallbackDocs = await PracticeQuestion.find(query).lean();

            // If topic-specific fallback count is insufficient, fall back to whole subject at target difficulty
            if (fallbackDocs.length < needed) {
                fallbackDocs = await PracticeQuestion.find({ subjectId, difficulty, active: true }).lean();
            }

            // Shuffle fallback pool
            fallbackDocs = fallbackDocs.sort(() => Math.random() - 0.5);

            for (const fb of fallbackDocs) {
                const norm = QuestionValidationService.normalizeText(fb.questionText);
                if (currentSessionNormSet.has(norm)) continue;

                validQuestions.push({
                    questionId: fb.questionId,
                    questionText: fb.questionText,
                    options: fb.options,
                    correctOption: fb.correctOption,
                    explanation: fb.explanation,
                    subject: fb.subjectName || subjectName,
                    topic: fb.topicName || "Core Discipline Concepts",
                    difficulty: fb.difficulty || difficulty
                });

                currentSessionNormSet.add(norm);
                if (validQuestions.length >= targetCount) break;
            }
        }

        return {
            subjectId,
            subjectName,
            difficulty,
            topic: topic || null,
            questions: validQuestions
        };
    }

    static resolveSubjectName(subjectId, inputFallback) {
        const map = {
            dbms: "Database Management Systems",
            sql: "SQL & Database Queries",
            java: "Java Programming",
            python: "Python Programming",
            cpp: "C++ Programming",
            oops: "Object-Oriented Programming (OOPS)",
            os: "Operating Systems",
            cn: "Computer Networks & Security",
            dsa: "Data Structures & Algorithms"
        };
        return map[subjectId] || inputFallback || subjectId.toUpperCase();
    }
}

module.exports = QuestionGenerationService;
