import fs from 'fs'
const { parseSeatMatrixPdf } = await import('./utils/seatMatrixParser.js')
const PDF_PATH = 'C:\\Users\\Priya Dharshini\\Downloads\\GENERAL_ACADEMIC_SEAT_MATRIX_BEFORE_SPECIAL_RESERVATION_COUNSELLING_2026.pdf'
const { rows } = await parseSeatMatrixPdf(fs.readFileSync(PDF_PATH))
const names = [...new Set(rows.map((r) => r.branchName))].sort()
console.log(names.join('\n'))
console.log('TOTAL:', names.length)