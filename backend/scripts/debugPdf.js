const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');

async function debugPdf() {
    const filePath = 'backend/tnea_collegeandtheircourses.pdf';
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    const text = data.text;
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    // Create directory if not exists
    const outPath = 'pdf_debug.txt';
    fs.writeFileSync(outPath, lines.slice(0, 1000).join('\n'));
    console.log("Saved first 1000 lines to pdf_debug.txt");
}

debugPdf();
