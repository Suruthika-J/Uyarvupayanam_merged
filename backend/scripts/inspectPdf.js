const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = 'c:/Users/Priya Dharshini/OneDrive/Desktop/Uyarvu%20Payanam/Uyarvu-Payanam/backend/tnea_collegeandtheircourses.pdf';

async function inspectPdf() {
  try {
    const dataBuffer = fs.readFileSync(decodeURIComponent(pdfPath));
    const data = await pdf(dataBuffer); 
    console.log('--- PDF INFO ---');
    console.log('Pages:', data.numpages);
    console.log('--- PDF TEXT START ---');
    console.log(data.text.substring(0, 10000));
    console.log('--- PDF TEXT END ---');
  } catch (error) {
    console.error('Error reading PDF:', error);
    if (error.stack) console.error(error.stack);
  }
}

inspectPdf();
