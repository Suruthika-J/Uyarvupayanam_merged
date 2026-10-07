const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const PracticeQuestion = require('../models/PracticeQuestion');

async function testApiDirectly() {
    console.log('Connecting to MongoDB to verify API querying logic...');
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/uyarvu-payanam';
    await mongoose.connect(mongoUri);

    const subjects = ['dbms', 'sql', 'java', 'python', 'cpp', 'oops', 'os', 'cn', 'dsa'];
    const difficulties = ['EASY', 'MEDIUM', 'HARD', 'ADVANCED'];

    console.log('\n============================================================');
    console.log('API QUESTION ISOLATION & SEPARATION TEST');
    console.log('============================================================');

    let totalViolations = 0;

    for (const sub of subjects) {
        console.log(`\nTesting Subject: [${sub.toUpperCase()}]`);
        const pools = {};
        for (const diff of difficulties) {
            const qs = await PracticeQuestion.find({ subjectId: sub, difficulty: diff, active: true }).limit(5).lean();
            pools[diff] = qs;
            console.log(`  - ${diff.padEnd(8)}: fetched ${qs.length} questions. Sample ID: ${qs[0]?.questionId}`);
        }

        // Check intersections between difficulties
        for (let i = 0; i < difficulties.length; i++) {
            for (let j = i + 1; j < difficulties.length; j++) {
                const diff1 = difficulties[i];
                const diff2 = difficulties[j];

                const ids1 = new Set(pools[diff1].map(q => q.questionId));
                const ids2 = new Set(pools[diff2].map(q => q.questionId));
                const overlapIds = [...ids1].filter(id => ids2.has(id));

                const texts1 = new Set(pools[diff1].map(q => q.questionText.toLowerCase().trim()));
                const texts2 = new Set(pools[diff2].map(q => q.questionText.toLowerCase().trim()));
                const overlapTexts = [...texts1].filter(t => texts2.has(t));

                if (overlapIds.length > 0 || overlapTexts.length > 0) {
                    console.error(`  ❌ OVERLAP DETECTED between ${diff1} and ${diff2}! Overlapping IDs: ${overlapIds.length}, Overlapping Texts: ${overlapTexts.length}`);
                    totalViolations++;
                } else {
                    console.log(`  ✓ ${diff1} ∩ ${diff2} = EMPTY (0 overlapping question IDs or texts)`);
                }
            }
        }
    }

    console.log('\n============================================================');
    console.log('FINAL ISOLATION VERIFICATION SUMMARY');
    console.log('============================================================');
    if (totalViolations === 0) {
        console.log('SUCCESS: EASY ≠ MEDIUM ≠ HARD ≠ ADVANCED across ALL 9 subjects!');
        console.log('Zero question ID overlaps. Zero question text overlaps.');
    } else {
        console.error(`FAILED: Detected ${totalViolations} overlaps across difficulty pools.`);
        process.exitCode = 1;
    }

    await mongoose.disconnect();
}

testApiDirectly().catch(err => {
    console.error('API Test Error:', err);
    process.exit(1);
});
