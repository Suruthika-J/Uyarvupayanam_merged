/**
 * CompanySpecificQuestionGenerator.js
 * LLM Question Generator for Company-Specific Practice Questions
 *
 * Rules:
 * - Always labels questions with `isAiGenerated: true` and `label: "🤖 AI-GENERATED PRACTICE"`
 * - NEVER presents generated questions as previous-year / reported questions
 * - Uses company research evidence & student profile context
 */

const axios = require("axios");

class CompanySpecificQuestionGenerator {
  /**
   * Generates AI practice questions tailored to company interview patterns & student profile
   */
  static async generateQuestions({
    companyName,
    role = "Software Engineer",
    hiringType = "Full-Time",
    difficulty = "Medium",
    category = "Technical",
    questionCount = 5,
    research = null,
    studentProfile = null
  }) {
    const numQ = Math.min(Math.max(parseInt(questionCount, 10) || 5, 1), 15);
    const cleanCompany = companyName || "Target Company";
    const cleanRole = role || "Software Engineer";
    const cleanDiff = difficulty || "Medium";
    const cleanCat = category || "Technical";

    // Extract student profile context
    const studentDomain = studentProfile?.recommendedDomain || studentProfile?.targetCareer || "Software Development";
    const studentSkills = Array.isArray(studentProfile?.skills) ? studentProfile.skills.join(", ") : "JavaScript, Java, SQL, React";
    const studentProjects = Array.isArray(studentProfile?.projects)
      ? studentProfile.projects.map(p => typeof p === "string" ? p : p.title || p.name).filter(Boolean)
      : ["Smart Study Planner", "Campus Placement Portal"];

    // Try Groq LLM Generation
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey) {
      try {
        const questions = await this._callGroqLlm({
          apiKey,
          companyName: cleanCompany,
          role: cleanRole,
          hiringType,
          difficulty: cleanDiff,
          category: cleanCat,
          questionCount: numQ,
          research,
          studentDomain,
          studentSkills,
          studentProjects
        });

        if (Array.isArray(questions) && questions.length > 0) {
          return questions.map((q, idx) => ({
            id: `ai-gen-${Date.now()}-${idx}`,
            question: q.question || q.questionText,
            options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ["Option A", "Option B", "Option C", "Option D"],
            correctAnswerIndex: typeof q.correctAnswerIndex === "number" ? q.correctAnswerIndex : 0,
            explanation: q.explanation || "Review the core concepts tested by this company.",
            category: q.category || cleanCat,
            patternTested: q.patternTested || `${cleanCat} Pattern`,
            difficulty: cleanDiff,
            isAiGenerated: true,
            label: "🤖 AI-GENERATED PRACTICE",
            patternSource: `Based on reported ${cleanCat} interview patterns for ${cleanCompany} ${cleanRole} hiring.`
          }));
        }
      } catch (err) {
        console.warn("[CompanySpecificQuestionGenerator] LLM call failed, falling back to curated generator:", err.message);
      }
    }

    // Fallback: Rule-Based Curated AI Question Generator
    return this._generateCuratedAiQuestions({
      companyName: cleanCompany,
      role: cleanRole,
      difficulty: cleanDiff,
      category: cleanCat,
      questionCount: numQ,
      studentProjects
    });
  }

  static async _callGroqLlm({
    apiKey,
    companyName,
    role,
    hiringType,
    difficulty,
    category,
    questionCount,
    research,
    studentDomain,
    studentSkills,
    studentProjects
  }) {
    const prompt = `
You are an expert technical interviewer creating company-tailored practice questions.
Company: ${companyName}
Target Role: ${role}
Hiring Type: ${hiringType}
Target Difficulty: ${difficulty}
Category Focus: ${category}
Student Recommended Domain: ${studentDomain}
Student Skills: ${studentSkills}
Student Projects: ${studentProjects.join(", ")}

Generate ${questionCount} multiple-choice practice questions.
Each question MUST test a technical concept or behavioral pattern commonly reported in ${companyName}'s ${role} interview process.

Respond ONLY with a valid JSON array of objects. No markdown backticks, no markdown text.
JSON Structure per object:
{
  "question": "Clear question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswerIndex": 0,
  "explanation": "Detailed step-by-step explanation of why Option A is correct",
  "category": "${category}",
  "patternTested": "Specific concept or pattern tested"
}
`;

    const res = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "openai/gpt-oss-120b",
        messages: [
          {
            role: "system",
            content: "You are a specialized AI interviewer. Output strictly valid JSON arrays."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 2500
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        timeout: 15000
      }
    );

    const text = res.data?.choices?.[0]?.message?.content || "";
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanText);
  }

  static _generateCuratedAiQuestions({ companyName, role, difficulty, category, questionCount, studentProjects }) {
    const sampleProject = studentProjects[0] || "Final Year Capstone Project";

    const questionBank = {
      Technical: [
        {
          question: `In a high-throughput microservices environment at ${companyName}, how does an API Gateway handle rate limiting and load balancing?`,
          options: [
            "By using Token Bucket / Leaky Bucket algorithms and distributing requests across instances",
            "By converting all HTTP requests into synchronous database calls",
            "By compressing all incoming JSON payloads into ZIP archives",
            "By forcing clients to wait in a single static queue until server CPU drops below 10%"
          ],
          correctAnswerIndex: 0,
          explanation: "API Gateways use algorithms like Token Bucket or Sliding Window Log to enforce rate limits while routing requests via Round Robin or Least Connections.",
          patternTested: "Microservices Architecture & Rate Limiting"
        },
        {
          question: `When executing complex multi-table SQL queries in ${companyName}'s database system, why is EXPLAIN ANALYZE used?`,
          options: [
            "To inspect the execution plan, index usage, and actual execution time per node",
            "To automatically grant admin privileges to the executing user",
            "To convert SQL queries into Python functions",
            "To backup table schemas before executing DELETE queries"
          ],
          correctAnswerIndex: 0,
          explanation: "EXPLAIN ANALYZE executes the query and provides execution metrics including index scans vs sequential scans and time spent in each node.",
          patternTested: "SQL Query Optimization & Database Indexing"
        },
        {
          question: `During the technical review of your project "${sampleProject}", how would you justify choosing REST over GraphQL for a mobile-first application?`,
          options: [
            "REST simplifies browser caching via standard HTTP headers (ETag, Cache-Control) and has lower client footprint",
            "REST prevents all network security attacks automatically",
            "GraphQL only works with SQL databases while REST works with file systems",
            "REST eliminates the need for backend servers"
          ],
          correctAnswerIndex: 0,
          explanation: "REST leverages native HTTP caching mechanisms and straightforward URL routing, making it highly reliable for mobile environments with stable resource schemas.",
          patternTested: "API Design & Architecture Trade-offs"
        }
      ],
      DSA: [
        {
          question: `For a problem frequently asked in ${companyName} coding rounds: Given an array of integers, how do you find the contiguous subarray with the maximum sum in O(N) time?`,
          options: [
            "Using Kadane's Algorithm by tracking max_ending_here and max_so_far",
            "By sorting the array and picking the top 2 elements",
            "By computing all N^2 subsegments and finding their sums",
            "Using Binary Search on the unsorted array"
          ],
          correctAnswerIndex: 0,
          explanation: "Kadane's Algorithm maintains a running sum, resetting to the current element if the running sum drops below zero, achieving O(N) time and O(1) space.",
          patternTested: "Dynamic Programming / Kadane's Algorithm"
        },
        {
          question: `How do you find the lowest common ancestor (LCA) of two nodes in a Binary Search Tree (BST)?`,
          options: [
            "Traverse from root; if both nodes are smaller move left, if both are larger move right, otherwise current node is LCA",
            "Perform a Post-Order traversal and return the leaf node",
            "Convert the BST into a Linked List and sort it",
            "Calculate the height of all nodes using Breadth-First Search"
          ],
          correctAnswerIndex: 0,
          explanation: "In a BST, the split point where one node lies to the left and the other lies to the right (or matches the current node) is the LCA.",
          patternTested: "BST Property & Tree Traversal"
        }
      ],
      Coding: [
        {
          question: `You are given a string containing brackets '()[]{}'. How would you verify if the string has valid balanced brackets?`,
          options: [
            "Use a Stack data structure to push opening brackets and pop/match corresponding closing brackets",
            "Count total opening and closing brackets using two integer counters",
            "Sort the string alphabetically and check string length",
            "Use a Queue to push and pop from opposite ends"
          ],
          correctAnswerIndex: 0,
          explanation: "A Stack guarantees Last-In-First-Out (LIFO) matching, ensuring nested brackets like '([{}])' are closed in the correct reverse order.",
          patternTested: "Stack Data Structure & String Parsing"
        }
      ],
      Projects: [
        {
          question: `In your project "${sampleProject}", how did you handle state management or asynchronous data fetching when network connectivity dropped?`,
          options: [
            "Implemented offline storage (IndexedDB/AsyncStorage) with exponential backoff retry logic",
            "Terminated the application immediately to prevent memory leaks",
            "Stored all user state in browser cookie strings",
            "Reloaded the entire web application every 5 seconds continuously"
          ],
          correctAnswerIndex: 0,
          explanation: "Robust applications use local persistence and resilient retry mechanisms (exponential backoff) to handle intermittent network failures.",
          patternTested: "Project Defense & Resilience Architecture"
        }
      ],
      Behavioral: [
        {
          question: `How would you handle a situation at ${companyName} where a critical bug is discovered 1 hour before a major release deadline?`,
          options: [
            "Assess severity/impact with the team, notify stakeholders transparently, apply a hotfix or roll back feature flag",
            "Ignore the bug and deploy to production hoping users don't notice",
            "Blame the junior developer publicly in the team Slack channel",
            "Cancel the entire product launch indefinitely without communicating"
          ],
          correctAnswerIndex: 0,
          explanation: "Professional engineering response prioritizes risk assessment, transparent stakeholder communication, and systematic triage.",
          patternTested: "Ownership & Incident Management"
        }
      ]
    };

    const selectedCategoryPool = questionBank[category] || questionBank.Technical;
    const result = [];

    for (let i = 0; i < questionCount; i++) {
      const q = selectedCategoryPool[i % selectedCategoryPool.length];
      result.push({
        id: `ai-gen-${Date.now()}-${i}`,
        question: q.question,
        options: q.options,
        correctAnswerIndex: q.correctAnswerIndex,
        explanation: q.explanation,
        category: category,
        patternTested: q.patternTested,
        difficulty: difficulty,
        isAiGenerated: true,
        label: "🤖 AI-GENERATED PRACTICE",
        patternSource: `Based on reported ${category} interview patterns for ${companyName} ${role}.`
      });
    }

    return result;
  }
}

module.exports = CompanySpecificQuestionGenerator;
