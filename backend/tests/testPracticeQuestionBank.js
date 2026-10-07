const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const PracticeQuestion = require('../models/PracticeQuestion');

function normalizeText(text) {
    if (!text) return '';
    return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

async function runValidation() {
    console.log('Connecting to MongoDB for Practice Question Validation...');
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/uyarvu-payanam';
    await mongoose.connect(mongoUri);

    const questions = await PracticeQuestion.find({});
    console.log(`\nTotal questions retrieved from DB: ${questions.length}\n`);

    let errors = [];
    const subjects = ['dbms', 'sql', 'java', 'python', 'cpp', 'oops', 'os', 'cn', 'dsa'];
    const difficulties = ['EASY', 'MEDIUM', 'HARD', 'ADVANCED'];

    const questionIds = new Set();
    const globalNormalizedTexts = new Map(); // normalizedText -> { questionId, subjectId, difficulty }
    const subjectDifficultyMatrix = {};

    subjects.forEach(s => {
        subjectDifficultyMatrix[s] = { EASY: 0, MEDIUM: 0, HARD: 0, ADVANCED: 0 };
    });

    questions.forEach((q, idx) => {
        // Check required fields
        if (!q.questionId) errors.push(`[Index ${idx}] Missing questionId`);
        if (!q.subjectId) errors.push(`[ID ${q.questionId}] Missing subjectId`);
        if (!q.topicId) errors.push(`[ID ${q.questionId}] Missing topicId`);
        if (!q.difficulty) errors.push(`[ID ${q.questionId}] Missing difficulty`);
        if (!['EASY', 'MEDIUM', 'HARD', 'ADVANCED'].includes(q.difficulty)) {
            errors.push(`[ID ${q.questionId}] Invalid difficulty value: ${q.difficulty}`);
        }

        // Check options
        if (!Array.isArray(q.options) || q.options.length !== 4) {
            errors.push(`[ID ${q.questionId}] Does not have exactly 4 options`);
        } else {
            const optionIds = q.options.map(o => o.id);
            if (JSON.stringify(optionIds) !== JSON.stringify(['A', 'B', 'C', 'D'])) {
                errors.push(`[ID ${q.questionId}] Option IDs are not ['A', 'B', 'C', 'D']`);
            }
            q.options.forEach(o => {
                if (!o.text || o.text.trim() === '') {
                    errors.push(`[ID ${q.questionId}] Empty option text for option ${o.id}`);
                }
            });
        }

        // Check correctOption
        if (!['A', 'B', 'C', 'D'].includes(q.correctOption)) {
            errors.push(`[ID ${q.questionId}] Invalid correctOption: ${q.correctOption}`);
        }

        // Check duplicate questionId
        if (questionIds.has(q.questionId)) {
            errors.push(`[ID ${q.questionId}] Duplicate questionId detected`);
        } else {
            questionIds.add(q.questionId);
        }

        // Check normalized text duplicate across difficulties and within subject
        const norm = normalizeText(q.questionText);
        if (globalNormalizedTexts.has(norm)) {
            const prev = globalNormalizedTexts.get(norm);
            errors.push(`[ID ${q.questionId} - ${q.subjectId} ${q.difficulty}] DUPLICATE QUESTION TEXT with [ID ${prev.questionId} - ${prev.subjectId} ${prev.difficulty}]: "${q.questionText}"`);
        } else {
            globalNormalizedTexts.set(norm, { questionId: q.questionId, subjectId: q.subjectId, difficulty: q.difficulty });
        }

        // Track count
        if (subjectDifficultyMatrix[q.subjectId] && subjectDifficultyMatrix[q.subjectId][q.difficulty] !== undefined) {
            subjectDifficultyMatrix[q.subjectId][q.difficulty]++;
        }
    });

    console.log('============================================================');
    console.log('PRACTICE QUESTION BANK DIAGNOSTIC MATRIX');
    console.log('============================================================');

    let allMatrixPassed = true;
    subjects.forEach(sub => {
        console.log(`\n${sub.toUpperCase()}`);
        difficulties.forEach(diff => {
            const count = subjectDifficultyMatrix[sub] ? subjectDifficultyMatrix[sub][diff] : 0;
            const passed = count >= 5;
            if (!passed) allMatrixPassed = false;
            console.log(`  ${diff.padEnd(8)}: ${count} ${passed ? '✓' : '❌ (Needs at least 5)'}`);
        });
    });

    console.log('\n============================================================');
    console.log('VALIDATION SUMMARY');
    console.log('============================================================');
    if (errors.length === 0 && allMatrixPassed) {
        console.log('SUCCESS: All 11 Validation Checks PASSED 100% cleanly!');
        console.log(`- Unique Question Count: ${questions.length}`);
        console.log(`- Zero Overlapping Question Texts Across Difficulties`);
        console.log(`- All Option Formats and Correct Option IDs Validated`);
    } else {
        console.error(`FAILED: Found ${errors.length} validation errors:`);
        errors.forEach(err => console.error(` - ${err}`));
        process.exitCode = 1;
    }

    await mongoose.disconnect();
}

runValidation().catch(err => {
    console.error('Validation Script Error:', err);
    process.exit(1);
});
