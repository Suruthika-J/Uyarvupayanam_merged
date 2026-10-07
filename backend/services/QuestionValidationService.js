function normalizeText(text) {
    if (!text) return "";
    return text.toLowerCase().trim().replace(/\s+/g, " ");
}

function resolveSubjectId(input) {
    if (!input) return "dbms";
    const str = input.toLowerCase().trim();
    if (str === "sql" || (str.includes("sql") && !str.includes("dbms"))) return "sql";
    if (str.includes("dbms") || str.includes("database")) return "dbms";
    if (str.includes("dsa") || str.includes("data structure") || str.includes("algorithm")) return "dsa";
    if (str.includes("java") && !str.includes("javascript")) return "java";
    if (str.includes("python")) return "python";
    if (str.includes("c++") || str.includes("cpp")) return "cpp";
    if (str.includes("oops") || str.includes("object oriented") || str.includes("object-oriented")) return "oops";
    if (str.includes("os") || str.includes("operating system")) return "os";
    if (str.includes("cn") || str.includes("network") || str.includes("networking")) return "cn";
    return str.replace(/[^a-z0-9]/g, "_");
}

class QuestionValidationService {
    static normalizeText(text) {
        return normalizeText(text);
    }

    static resolveSubjectId(input) {
        return resolveSubjectId(input);
    }

    /**
     * Validate a single generated question object
     */
    static validateQuestion(q, requestedSubjectInput, requestedDifficulty) {
        if (!q || typeof q !== "object") {
            return { valid: false, reason: "Question is not an object" };
        }

        // 1. Check questionText
        if (!q.questionText || typeof q.questionText !== "string" || q.questionText.trim().length < 10) {
            return { valid: false, reason: "Missing or invalid questionText" };
        }

        // 2. Check options array
        if (!Array.isArray(q.options) || q.options.length !== 4) {
            return { valid: false, reason: "Must have exactly 4 options" };
        }

        const optionIds = [];
        const optionTextsSet = new Set();

        for (let i = 0; i < q.options.length; i++) {
            const opt = q.options[i];
            let id = opt.id;
            let text = opt.text;

            if (typeof opt === "string") {
                id = String.fromCharCode(65 + i);
                text = opt;
            }

            if (!id || !["A", "B", "C", "D"].includes(id)) {
                return { valid: false, reason: `Invalid option ID at index ${i}` };
            }

            if (!text || typeof text !== "string" || text.trim().length === 0) {
                return { valid: false, reason: `Empty option text for option ${id}` };
            }

            const normOptText = normalizeText(text);
            if (optionTextsSet.has(normOptText)) {
                return { valid: false, reason: `Duplicate option text found: "${text}"` };
            }
            optionTextsSet.add(normOptText);
            optionIds.push(id);
        }

        if (JSON.stringify(optionIds.sort()) !== JSON.stringify(["A", "B", "C", "D"])) {
            return { valid: false, reason: "Option IDs must be A, B, C, D" };
        }

        // 3. Check correctOption
        const correctOpt = q.correctOption ? String(q.correctOption).trim().toUpperCase() : null;
        if (!correctOpt || !["A", "B", "C", "D"].includes(correctOpt)) {
            return { valid: false, reason: `Invalid correctOption: ${q.correctOption}` };
        }

        // 4. Check explanation
        if (!q.explanation || typeof q.explanation !== "string" || q.explanation.trim().length < 5) {
            return { valid: false, reason: "Missing or invalid explanation" };
        }

        // 5. Check difficulty match if provided
        if (requestedDifficulty && q.difficulty) {
            if (q.difficulty.toUpperCase() !== requestedDifficulty.toUpperCase()) {
                return { valid: false, reason: `Difficulty mismatch: expected ${requestedDifficulty}, got ${q.difficulty}` };
            }
        }

        return { valid: true, sanitized: {
            questionText: q.questionText.trim(),
            options: q.options.map((opt, idx) => ({
                id: typeof opt === "object" && opt.id ? opt.id : String.fromCharCode(65 + idx),
                text: (typeof opt === "object" && opt.text ? opt.text : opt).trim()
            })),
            correctOption: correctOpt,
            explanation: q.explanation.trim(),
            subject: q.subject || requestedSubjectInput,
            topic: q.topic || "General Domain Concepts",
            difficulty: (requestedDifficulty || q.difficulty || "EASY").toUpperCase()
        }};
    }

    /**
     * Check if normalized text is unique against existing text set
     */
    static isUnique(questionText, existingTextsSet) {
        const norm = normalizeText(questionText);
        return !existingTextsSet.has(norm);
    }
}

module.exports = QuestionValidationService;
