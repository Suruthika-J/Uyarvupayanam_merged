// Run the real seat-matrix import through the controller, then verify counts.
require('dotenv').config()
const fs = require('fs')
const mongoose = require('mongoose')
const { importSeatMatrix, listCourses, getCourseColleges, getSummary } = require('./controllers/seatMatrixController')

function jsonRes(obj) {
  return { json: (payload) => { console.log('RESPONSE:', JSON.stringify(payload, null, 2)); return payload } }
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 })
  console.log('connected')

  const pdf = fs.readFileSync('C:\\Users\\Priya Dharshini\\Downloads\\GENERAL_ACADEMIC_SEAT_MATRIX_BEFORE_SPECIAL_RESERVATION_COUNSELLING_2026.pdf')
  const req = {
    file: { buffer: pdf, originalname: 'GENERAL_ACADEMIC_SEAT_MATRIX_2026.pdf', mimetype: 'application/pdf' },
    admin: { _id: null },
  }
  await importSeatMatrix(req, jsonRes())
  await mongoose.disconnect()
}
main().catch((e) => { console.error('FATAL', e); process.exit(1) })