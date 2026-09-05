/**
 * seedColleges.js — Bulk insert Tamil Nadu colleges into MongoDB
 *
 * Usage:  node seedColleges.js
 *
 * This script drops existing colleges and seeds fresh data.
 * Remove the College.deleteMany() call if you want to APPEND instead.
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const College = require("./models/College");

dotenv.config();

// ── Tamil Nadu Districts ──
const DISTRICTS = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
  "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram",
  "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
  "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
  "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi",
  "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
  "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur",
  "Vellore", "Viluppuram", "Virudhunagar"
];

// ──────────────────────────────────────────
// COLLEGE DATA — organized by stream
// ──────────────────────────────────────────

const engineeringColleges = [
  { collegeName: "IIT Madras", district: "Chennai", location: "Chennai", state: "Tamil Nadu", stream: "Engineering", accreditation: "NAAC A++", rank: "#1" },
  { collegeName: "Anna University - CEG", district: "Chennai", location: "Guindy, Chennai", state: "Tamil Nadu", stream: "Engineering", accreditation: "NAAC A+", rank: "#5" },
  { collegeName: "NIT Tiruchirappalli", district: "Tiruchirappalli", location: "Tiruchirappalli", state: "Tamil Nadu", stream: "Engineering", accreditation: "NAAC A+", rank: "#10" },
  { collegeName: "PSG College of Technology", district: "Coimbatore", location: "Coimbatore", state: "Tamil Nadu", stream: "Engineering", accreditation: "NAAC A+", rank: "#25" },
  { collegeName: "SSN College of Engineering", district: "Kanchipuram", location: "Kalavakkam", state: "Tamil Nadu", stream: "Engineering", accreditation: "NAAC A+", rank: "#30" },
  { collegeName: "Thiagarajar College of Engineering", district: "Madurai", location: "Madurai", state: "Tamil Nadu", stream: "Engineering", accreditation: "NAAC A", rank: "#40" },
  { collegeName: "Coimbatore Institute of Technology", district: "Coimbatore", location: "Coimbatore", state: "Tamil Nadu", stream: "Engineering", accreditation: "NAAC A", rank: "#50" },
  { collegeName: "Kongu Engineering College", district: "Erode", location: "Perundurai", state: "Tamil Nadu", stream: "Engineering", accreditation: "NAAC A", rank: "#55" },
  { collegeName: "Kumaraguru College of Technology", district: "Coimbatore", location: "Coimbatore", state: "Tamil Nadu", stream: "Engineering", accreditation: "NAAC A+", rank: "#45" },
  { collegeName: "Mepco Schlenk Engineering College", district: "Virudhunagar", location: "Sivakasi", state: "Tamil Nadu", stream: "Engineering", accreditation: "NAAC A", rank: "#60" },
  { collegeName: "Velammal Engineering College", district: "Chennai", location: "Surapet, Chennai", state: "Tamil Nadu", stream: "Engineering", accreditation: "NAAC A", rank: "#70" },
  { collegeName: "SRM Institute of Science and Technology", district: "Kanchipuram", location: "Kattankulathur", state: "Tamil Nadu", stream: "Engineering", accreditation: "NAAC A++", rank: "#15" },
  { collegeName: "VIT Vellore", district: "Vellore", location: "Vellore", state: "Tamil Nadu", stream: "Engineering", accreditation: "NAAC A++", rank: "#12" },
  { collegeName: "Sathyabama Institute of Science and Technology", district: "Chennai", location: "Jeppiaar Nagar, Chennai", state: "Tamil Nadu", stream: "Engineering", accreditation: "NAAC A", rank: "#35" },
  { collegeName: "Government College of Engineering, Salem", district: "Salem", location: "Salem", state: "Tamil Nadu", stream: "Engineering", accreditation: "NAAC A", rank: "#65" },
  { collegeName: "Government College of Engineering, Tirunelveli", district: "Tirunelveli", location: "Tirunelveli", state: "Tamil Nadu", stream: "Engineering", accreditation: "NAAC A", rank: "#68" },
  { collegeName: "Government College of Engineering, Bargur", district: "Krishnagiri", location: "Bargur", state: "Tamil Nadu", stream: "Engineering" },
  { collegeName: "Government College of Engineering, Thanjavur", district: "Thanjavur", location: "Thanjavur", state: "Tamil Nadu", stream: "Engineering" },
  { collegeName: "Government College of Engineering, Dharmapuri", district: "Dharmapuri", location: "Dharmapuri", state: "Tamil Nadu", stream: "Engineering" },
  { collegeName: "Government College of Engineering, Erode", district: "Erode", location: "Erode", state: "Tamil Nadu", stream: "Engineering" },
  { collegeName: "Sri Sivasubramaniya Nadar College of Engineering", district: "Kanchipuram", location: "Kalavakkam", state: "Tamil Nadu", stream: "Engineering" },
  { collegeName: "Saveetha Engineering College", district: "Chennai", location: "Thandalam, Chennai", state: "Tamil Nadu", stream: "Engineering" },
  { collegeName: "St. Joseph's College of Engineering", district: "Chennai", location: "Jeppiaar Nagar, Chennai", state: "Tamil Nadu", stream: "Engineering" },
  { collegeName: "R.M.K. Engineering College", district: "Tiruvallur", location: "Kavaraipettai", state: "Tamil Nadu", stream: "Engineering" },
  { collegeName: "Rajalakshmi Engineering College", district: "Chennai", location: "Thandalam, Chennai", state: "Tamil Nadu", stream: "Engineering" },
];

const medicalColleges = [
  { collegeName: "Madras Medical College", district: "Chennai", location: "Park Town, Chennai", state: "Tamil Nadu", stream: "Medical", accreditation: "NMC Approved", rank: "#1 TN" },
  { collegeName: "Stanley Medical College", district: "Chennai", location: "Royapuram, Chennai", state: "Tamil Nadu", stream: "Medical", accreditation: "NMC Approved", rank: "#3 TN" },
  { collegeName: "Government Kilpauk Medical College", district: "Chennai", location: "Kilpauk, Chennai", state: "Tamil Nadu", stream: "Medical", accreditation: "NMC Approved" },
  { collegeName: "Government Mohan Kumaramangalam Medical College", district: "Salem", location: "Salem", state: "Tamil Nadu", stream: "Medical", accreditation: "NMC Approved" },
  { collegeName: "Thanjavur Medical College", district: "Thanjavur", location: "Thanjavur", state: "Tamil Nadu", stream: "Medical", accreditation: "NMC Approved" },
  { collegeName: "Madurai Medical College", district: "Madurai", location: "Madurai", state: "Tamil Nadu", stream: "Medical", accreditation: "NMC Approved" },
  { collegeName: "Tirunelveli Medical College", district: "Tirunelveli", location: "Tirunelveli", state: "Tamil Nadu", stream: "Medical", accreditation: "NMC Approved" },
  { collegeName: "Coimbatore Medical College", district: "Coimbatore", location: "Coimbatore", state: "Tamil Nadu", stream: "Medical", accreditation: "NMC Approved" },
  { collegeName: "Chengalpattu Medical College", district: "Chengalpattu", location: "Chengalpattu", state: "Tamil Nadu", stream: "Medical", accreditation: "NMC Approved" },
  { collegeName: "Villupuram Medical College", district: "Viluppuram", location: "Viluppuram", state: "Tamil Nadu", stream: "Medical", accreditation: "NMC Approved" },
  { collegeName: "Theni Government Medical College", district: "Theni", location: "Theni", state: "Tamil Nadu", stream: "Medical", accreditation: "NMC Approved" },
  { collegeName: "Thoothukudi Government Medical College", district: "Thoothukudi", location: "Thoothukudi", state: "Tamil Nadu", stream: "Medical", accreditation: "NMC Approved" },
  { collegeName: "Government Vellore Medical College", district: "Vellore", location: "Vellore", state: "Tamil Nadu", stream: "Medical", accreditation: "NMC Approved" },
  { collegeName: "Government Dharmapuri Medical College", district: "Dharmapuri", location: "Dharmapuri", state: "Tamil Nadu", stream: "Medical", accreditation: "NMC Approved" },
  { collegeName: "Government Sivaganga Medical College", district: "Sivaganga", location: "Sivaganga", state: "Tamil Nadu", stream: "Medical", accreditation: "NMC Approved" },
  { collegeName: "Government Ramanathapuram Medical College", district: "Ramanathapuram", location: "Ramanathapuram", state: "Tamil Nadu", stream: "Medical", accreditation: "NMC Approved" },
  { collegeName: "Government Tiruvallur Medical College", district: "Tiruvallur", location: "Tiruvallur", state: "Tamil Nadu", stream: "Medical", accreditation: "NMC Approved" },
  { collegeName: "Government Tiruvannamalai Medical College", district: "Tiruvannamalai", location: "Tiruvannamalai", state: "Tamil Nadu", stream: "Medical", accreditation: "NMC Approved" },
  { collegeName: "Government Karur Medical College", district: "Karur", location: "Karur", state: "Tamil Nadu", stream: "Medical", accreditation: "NMC Approved" },
  { collegeName: "Government Krishnagiri Medical College", district: "Krishnagiri", location: "Krishnagiri", state: "Tamil Nadu", stream: "Medical", accreditation: "NMC Approved" },
  { collegeName: "Government Nagapattinam Medical College", district: "Nagapattinam", location: "Nagapattinam", state: "Tamil Nadu", stream: "Medical", accreditation: "NMC Approved" },
  { collegeName: "Government Namakkal Medical College", district: "Namakkal", location: "Namakkal", state: "Tamil Nadu", stream: "Medical", accreditation: "NMC Approved" },
  { collegeName: "Government Dindigul Medical College", district: "Dindigul", location: "Dindigul", state: "Tamil Nadu", stream: "Medical", accreditation: "NMC Approved" },
  { collegeName: "Government Cuddalore Medical College", district: "Cuddalore", location: "Cuddalore", state: "Tamil Nadu", stream: "Medical", accreditation: "NMC Approved" },
  { collegeName: "Government Erode Medical College", district: "Erode", location: "Perundurai", state: "Tamil Nadu", stream: "Medical", accreditation: "NMC Approved" },
  { collegeName: "Government Kanyakumari Medical College", district: "Kanyakumari", location: "Nagercoil", state: "Tamil Nadu", stream: "Medical", accreditation: "NMC Approved" },
  { collegeName: "JIPMER Puducherry", district: "Chennai", location: "Puducherry", state: "Tamil Nadu", stream: "Medical", accreditation: "NAAC A++", rank: "#2 National" },
  { collegeName: "Christian Medical College, Vellore", district: "Vellore", location: "Vellore", state: "Tamil Nadu", stream: "Medical", accreditation: "NAAC A++", rank: "#2 TN" },
  { collegeName: "Sri Ramachandra Medical College", district: "Chennai", location: "Porur, Chennai", state: "Tamil Nadu", stream: "Medical", accreditation: "NAAC A+" },
  { collegeName: "SRM Medical College Hospital", district: "Kanchipuram", location: "Kattankulathur", state: "Tamil Nadu", stream: "Medical", accreditation: "NMC Approved" },
  { collegeName: "Saveetha Medical College", district: "Chennai", location: "Thandalam, Chennai", state: "Tamil Nadu", stream: "Medical", accreditation: "NMC Approved" },
  { collegeName: "Meenakshi Medical College", district: "Kanchipuram", location: "Enathur, Kanchipuram", state: "Tamil Nadu", stream: "Medical", accreditation: "NMC Approved" },
  { collegeName: "Annamalai University Faculty of Medicine", district: "Cuddalore", location: "Chidambaram", state: "Tamil Nadu", stream: "Medical", accreditation: "NMC Approved" },
  { collegeName: "Government Pudukkottai Medical College", district: "Pudukkottai", location: "Pudukkottai", state: "Tamil Nadu", stream: "Medical", accreditation: "NMC Approved" },
  { collegeName: "Government Ariyalur Medical College", district: "Ariyalur", location: "Ariyalur", state: "Tamil Nadu", stream: "Medical", accreditation: "NMC Approved" },
  { collegeName: "Government Tiruppur Medical College", district: "Tiruppur", location: "Tiruppur", state: "Tamil Nadu", stream: "Medical", accreditation: "NMC Approved" },
  { collegeName: "Government Kallakurichi Medical College", district: "Kallakurichi", location: "Kallakurichi", state: "Tamil Nadu", stream: "Medical", accreditation: "NMC Approved" },
  { collegeName: "Government Virudhunagar Medical College", district: "Virudhunagar", location: "Virudhunagar", state: "Tamil Nadu", stream: "Medical", accreditation: "NMC Approved" },
];

const artsAndScienceColleges = [
  // Chennai
  { collegeName: "Loyola College", district: "Chennai", location: "Nungambakkam, Chennai", state: "Tamil Nadu", stream: "Arts & Science", accreditation: "NAAC A++", rank: "#1 TN" },
  { collegeName: "Madras Christian College", district: "Chennai", location: "Tambaram, Chennai", state: "Tamil Nadu", stream: "Arts & Science", accreditation: "NAAC A++" },
  { collegeName: "Presidency College", district: "Chennai", location: "Chepauk, Chennai", state: "Tamil Nadu", stream: "Arts & Science", accreditation: "NAAC A+" },
  { collegeName: "Stella Maris College", district: "Chennai", location: "Cathedral Road, Chennai", state: "Tamil Nadu", stream: "Arts & Science", accreditation: "NAAC A++" },
  { collegeName: "Women's Christian College", district: "Chennai", location: "College Road, Chennai", state: "Tamil Nadu", stream: "Arts & Science", accreditation: "NAAC A+" },
  { collegeName: "Queen Mary's College", district: "Chennai", location: "Marina, Chennai", state: "Tamil Nadu", stream: "Arts & Science", accreditation: "NAAC A" },
  { collegeName: "Pachaiyappa's College", district: "Chennai", location: "Chetpet, Chennai", state: "Tamil Nadu", stream: "Arts & Science" },
  // Coimbatore
  { collegeName: "PSG College of Arts & Science", district: "Coimbatore", location: "Coimbatore", state: "Tamil Nadu", stream: "Arts & Science", accreditation: "NAAC A++" },
  { collegeName: "Government Arts College, Coimbatore", district: "Coimbatore", location: "Coimbatore", state: "Tamil Nadu", stream: "Arts & Science" },
  { collegeName: "Sri Krishna Arts and Science College", district: "Coimbatore", location: "Coimbatore", state: "Tamil Nadu", stream: "Arts & Science", accreditation: "NAAC A+" },
  // Madurai
  { collegeName: "The American College", district: "Madurai", location: "Madurai", state: "Tamil Nadu", stream: "Arts & Science", accreditation: "NAAC A++" },
  { collegeName: "Lady Doak College", district: "Madurai", location: "Madurai", state: "Tamil Nadu", stream: "Arts & Science", accreditation: "NAAC A+" },
  { collegeName: "Thiagarajar College", district: "Madurai", location: "Teppakulam, Madurai", state: "Tamil Nadu", stream: "Arts & Science", accreditation: "NAAC A+" },
  { collegeName: "Government Arts College, Madurai (Alagarkoil Road)", district: "Madurai", location: "Madurai", state: "Tamil Nadu", stream: "Arts & Science" },
  // Tiruchirappalli
  { collegeName: "St. Joseph's College, Trichy", district: "Tiruchirappalli", location: "Tiruchirappalli", state: "Tamil Nadu", stream: "Arts & Science", accreditation: "NAAC A++" },
  { collegeName: "Bishop Heber College", district: "Tiruchirappalli", location: "Tiruchirappalli", state: "Tamil Nadu", stream: "Arts & Science", accreditation: "NAAC A+" },
  { collegeName: "Jamal Mohamed College", district: "Tiruchirappalli", location: "Tiruchirappalli", state: "Tamil Nadu", stream: "Arts & Science", accreditation: "NAAC A+" },
  { collegeName: "Government Arts College, Tiruchirappalli", district: "Tiruchirappalli", location: "Tiruchirappalli", state: "Tamil Nadu", stream: "Arts & Science" },
  // Salem
  { collegeName: "Government Arts College, Salem", district: "Salem", location: "Salem", state: "Tamil Nadu", stream: "Arts & Science" },
  { collegeName: "Periyar University Constituent Arts College, Salem", district: "Salem", location: "Salem", state: "Tamil Nadu", stream: "Arts & Science" },
  // Thanjavur
  { collegeName: "Government Arts College, Kumbakonam", district: "Thanjavur", location: "Kumbakonam", state: "Tamil Nadu", stream: "Arts & Science" },
  { collegeName: "Government Arts College, Thanjavur", district: "Thanjavur", location: "Thanjavur", state: "Tamil Nadu", stream: "Arts & Science" },
  // Tirunelveli
  { collegeName: "St. Xavier's College, Palayamkottai", district: "Tirunelveli", location: "Palayamkottai", state: "Tamil Nadu", stream: "Arts & Science", accreditation: "NAAC A+" },
  { collegeName: "Government Arts College, Tirunelveli", district: "Tirunelveli", location: "Tirunelveli", state: "Tamil Nadu", stream: "Arts & Science" },
  // Vellore
  { collegeName: "Voorhees College", district: "Vellore", location: "Vellore", state: "Tamil Nadu", stream: "Arts & Science", accreditation: "NAAC A" },
  { collegeName: "Government Arts College, Vellore", district: "Vellore", location: "Vellore", state: "Tamil Nadu", stream: "Arts & Science" },
  // Kanyakumari
  { collegeName: "Scott Christian College", district: "Kanyakumari", location: "Nagercoil", state: "Tamil Nadu", stream: "Arts & Science", accreditation: "NAAC A+" },
  { collegeName: "Government Arts College, Nagercoil", district: "Kanyakumari", location: "Nagercoil", state: "Tamil Nadu", stream: "Arts & Science" },
  // Other districts
  { collegeName: "Government Arts College, Dharmapuri", district: "Dharmapuri", location: "Dharmapuri", state: "Tamil Nadu", stream: "Arts & Science" },
  { collegeName: "Government Arts College, Erode", district: "Erode", location: "Erode", state: "Tamil Nadu", stream: "Arts & Science" },
  { collegeName: "Government Arts College, Karur", district: "Karur", location: "Karur", state: "Tamil Nadu", stream: "Arts & Science" },
  { collegeName: "Government Arts College, Krishnagiri", district: "Krishnagiri", location: "Krishnagiri", state: "Tamil Nadu", stream: "Arts & Science" },
  { collegeName: "Government Arts College, Namakkal", district: "Namakkal", location: "Namakkal", state: "Tamil Nadu", stream: "Arts & Science" },
  { collegeName: "Government Arts College, Cuddalore", district: "Cuddalore", location: "Cuddalore", state: "Tamil Nadu", stream: "Arts & Science" },
  { collegeName: "Government Arts College, Nagapattinam", district: "Nagapattinam", location: "Nagapattinam", state: "Tamil Nadu", stream: "Arts & Science" },
  { collegeName: "Government Arts College, Dindigul", district: "Dindigul", location: "Dindigul", state: "Tamil Nadu", stream: "Arts & Science" },
  { collegeName: "Government Arts College, Tiruvannamalai", district: "Tiruvannamalai", location: "Tiruvannamalai", state: "Tamil Nadu", stream: "Arts & Science" },
  { collegeName: "Government Arts College, Viluppuram", district: "Viluppuram", location: "Viluppuram", state: "Tamil Nadu", stream: "Arts & Science" },
  { collegeName: "Government Arts College, Ramanathapuram", district: "Ramanathapuram", location: "Ramanathapuram", state: "Tamil Nadu", stream: "Arts & Science" },
  { collegeName: "Government Arts College, Pudukkottai", district: "Pudukkottai", location: "Pudukkottai", state: "Tamil Nadu", stream: "Arts & Science" },
  { collegeName: "Government Arts College, Sivaganga", district: "Sivaganga", location: "Sivaganga", state: "Tamil Nadu", stream: "Arts & Science" },
  { collegeName: "Government Arts College, Tiruppur", district: "Tiruppur", location: "Tiruppur", state: "Tamil Nadu", stream: "Arts & Science" },
  { collegeName: "Government Arts College, Ariyalur", district: "Ariyalur", location: "Ariyalur", state: "Tamil Nadu", stream: "Arts & Science" },
  { collegeName: "Government Arts College, Perambalur", district: "Perambalur", location: "Perambalur", state: "Tamil Nadu", stream: "Arts & Science" },
  { collegeName: "Government Arts College, Nilgiris (Ooty)", district: "Nilgiris", location: "Ooty", state: "Tamil Nadu", stream: "Arts & Science" },
  { collegeName: "Government Arts College, Thoothukudi", district: "Thoothukudi", location: "Thoothukudi", state: "Tamil Nadu", stream: "Arts & Science" },
  { collegeName: "Government Arts College, Theni", district: "Theni", location: "Theni", state: "Tamil Nadu", stream: "Arts & Science" },
  { collegeName: "Government Arts College, Virudhunagar", district: "Virudhunagar", location: "Virudhunagar", state: "Tamil Nadu", stream: "Arts & Science" },
  { collegeName: "Government Arts College, Tenkasi", district: "Tenkasi", location: "Tenkasi", state: "Tamil Nadu", stream: "Arts & Science" },
  { collegeName: "Government Arts College, Kallakurichi", district: "Kallakurichi", location: "Kallakurichi", state: "Tamil Nadu", stream: "Arts & Science" },
  { collegeName: "Government Arts College, Tiruvarur", district: "Tiruvarur", location: "Tiruvarur", state: "Tamil Nadu", stream: "Arts & Science" },
  { collegeName: "Government Arts College, Mayiladuthurai", district: "Mayiladuthurai", location: "Mayiladuthurai", state: "Tamil Nadu", stream: "Arts & Science" },
];

const polytechnicColleges = [
  // Chennai region
  { collegeName: "Government Polytechnic College, Guindy", district: "Chennai", location: "Guindy, Chennai", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Alagappa Polytechnic College", district: "Chennai", location: "Guindy, Chennai", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Central Polytechnic College", district: "Chennai", location: "Taramani, Chennai", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Murugappa Polytechnic College", district: "Chennai", location: "Avadi, Chennai", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Sri Sairam Polytechnic College", district: "Chennai", location: "West Tambaram, Chennai", state: "Tamil Nadu", stream: "Polytechnic" },
  // Coimbatore region
  { collegeName: "Government Polytechnic College, Coimbatore", district: "Coimbatore", location: "Coimbatore", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "PSG Polytechnic College", district: "Coimbatore", location: "Peelamedu, Coimbatore", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Kumaraguru Polytechnic College", district: "Coimbatore", location: "Coimbatore", state: "Tamil Nadu", stream: "Polytechnic" },
  // Madurai region
  { collegeName: "Government Polytechnic College, Madurai", district: "Madurai", location: "Madurai", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Thiagarajar Polytechnic College", district: "Madurai", location: "Madurai", state: "Tamil Nadu", stream: "Polytechnic" },
  // Tiruchirappalli
  { collegeName: "Government Polytechnic College, Tiruchirappalli", district: "Tiruchirappalli", location: "Tiruchirappalli", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Srinivasa Subbaraya Polytechnic College", district: "Tiruchirappalli", location: "Tiruchirappalli", state: "Tamil Nadu", stream: "Polytechnic" },
  // District-wise Government Polytechnics
  { collegeName: "Government Polytechnic College, Salem", district: "Salem", location: "Salem", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Government Polytechnic College, Vellore", district: "Vellore", location: "Vellore", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Government Polytechnic College, Tirunelveli", district: "Tirunelveli", location: "Tirunelveli", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Government Polytechnic College, Thanjavur", district: "Thanjavur", location: "Thanjavur", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Government Polytechnic College, Erode", district: "Erode", location: "Erode", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Government Polytechnic College, Dharmapuri", district: "Dharmapuri", location: "Dharmapuri", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Government Polytechnic College, Dindigul", district: "Dindigul", location: "Dindigul", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Government Polytechnic College, Cuddalore", district: "Cuddalore", location: "Cuddalore", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Government Polytechnic College, Kanchipuram", district: "Kanchipuram", location: "Kanchipuram", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Government Polytechnic College, Namakkal", district: "Namakkal", location: "Namakkal", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Government Polytechnic College, Krishnagiri", district: "Krishnagiri", location: "Krishnagiri", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Government Polytechnic College, Karur", district: "Karur", location: "Karur", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Government Polytechnic College, Nagapattinam", district: "Nagapattinam", location: "Nagapattinam", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Government Polytechnic College, Thoothukudi", district: "Thoothukudi", location: "Thoothukudi", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Government Polytechnic College, Kanyakumari", district: "Kanyakumari", location: "Nagercoil", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Government Polytechnic College, Ramanathapuram", district: "Ramanathapuram", location: "Ramanathapuram", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Government Polytechnic College, Pudukkottai", district: "Pudukkottai", location: "Pudukkottai", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Government Polytechnic College, Virudhunagar", district: "Virudhunagar", location: "Virudhunagar", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Government Polytechnic College, Sivaganga", district: "Sivaganga", location: "Sivaganga", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Government Polytechnic College, Theni", district: "Theni", location: "Theni", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Government Polytechnic College, Tiruvannamalai", district: "Tiruvannamalai", location: "Tiruvannamalai", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Government Polytechnic College, Viluppuram", district: "Viluppuram", location: "Viluppuram", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Government Polytechnic College, Ariyalur", district: "Ariyalur", location: "Ariyalur", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Government Polytechnic College, Perambalur", district: "Perambalur", location: "Perambalur", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Government Polytechnic College, Tiruppur", district: "Tiruppur", location: "Tiruppur", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Government Polytechnic College, Nilgiris", district: "Nilgiris", location: "Coonoor", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Government Polytechnic College, Tiruvallur", district: "Tiruvallur", location: "Tiruvallur", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Government Polytechnic College, Chengalpattu", district: "Chengalpattu", location: "Chengalpattu", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Government Polytechnic College, Tenkasi", district: "Tenkasi", location: "Tenkasi", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Government Polytechnic College, Kallakurichi", district: "Kallakurichi", location: "Kallakurichi", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Government Polytechnic College, Ranipet", district: "Ranipet", location: "Ranipet", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Government Polytechnic College, Tirupathur", district: "Tirupathur", location: "Tirupathur", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Government Polytechnic College, Mayiladuthurai", district: "Mayiladuthurai", location: "Mayiladuthurai", state: "Tamil Nadu", stream: "Polytechnic" },
  { collegeName: "Government Polytechnic College, Tiruvarur", district: "Tiruvarur", location: "Tiruvarur", state: "Tamil Nadu", stream: "Polytechnic" },
];

const lawColleges = [
  { collegeName: "Dr. Ambedkar Government Law College", district: "Chennai", location: "Marina, Chennai", state: "Tamil Nadu", stream: "Law", accreditation: "BCI Approved" },
  { collegeName: "School of Excellence in Law, TNDALU", district: "Chennai", location: "Pattabiram, Chennai", state: "Tamil Nadu", stream: "Law", accreditation: "BCI Approved" },
  { collegeName: "Government Law College, Madurai", district: "Madurai", location: "Madurai", state: "Tamil Nadu", stream: "Law", accreditation: "BCI Approved" },
  { collegeName: "Government Law College, Tiruchirappalli", district: "Tiruchirappalli", location: "Tiruchirappalli", state: "Tamil Nadu", stream: "Law", accreditation: "BCI Approved" },
  { collegeName: "Government Law College, Coimbatore", district: "Coimbatore", location: "Coimbatore", state: "Tamil Nadu", stream: "Law", accreditation: "BCI Approved" },
  { collegeName: "Government Law College, Tirunelveli", district: "Tirunelveli", location: "Tirunelveli", state: "Tamil Nadu", stream: "Law", accreditation: "BCI Approved" },
  { collegeName: "Government Law College, Salem", district: "Salem", location: "Salem", state: "Tamil Nadu", stream: "Law", accreditation: "BCI Approved" },
  { collegeName: "Government Law College, Vellore", district: "Vellore", location: "Vellore", state: "Tamil Nadu", stream: "Law", accreditation: "BCI Approved" },
  { collegeName: "SASTRA Deemed University School of Law", district: "Thanjavur", location: "Thanjavur", state: "Tamil Nadu", stream: "Law", accreditation: "BCI Approved" },
  { collegeName: "VIT School of Law", district: "Vellore", location: "Vellore", state: "Tamil Nadu", stream: "Law", accreditation: "BCI Approved" },
  { collegeName: "SRM School of Law", district: "Kanchipuram", location: "Kattankulathur", state: "Tamil Nadu", stream: "Law", accreditation: "BCI Approved" },
  { collegeName: "Saveetha School of Law", district: "Chennai", location: "Thandalam, Chennai", state: "Tamil Nadu", stream: "Law", accreditation: "BCI Approved" },
];

const agricultureColleges = [
  { collegeName: "Tamil Nadu Agricultural University", district: "Coimbatore", location: "Coimbatore", state: "Tamil Nadu", stream: "Agriculture", accreditation: "ICAR Accredited", rank: "#1 TN" },
  { collegeName: "Agricultural College and Research Institute, Madurai", district: "Madurai", location: "Madurai", state: "Tamil Nadu", stream: "Agriculture", accreditation: "ICAR Accredited" },
  { collegeName: "Agricultural College and Research Institute, Killikulam", district: "Tenkasi", location: "Killikulam", state: "Tamil Nadu", stream: "Agriculture", accreditation: "ICAR Accredited" },
  { collegeName: "Agricultural College and Research Institute, Vazhavachanur", district: "Tiruvannamalai", location: "Vazhavachanur", state: "Tamil Nadu", stream: "Agriculture", accreditation: "ICAR Accredited" },
  { collegeName: "Agricultural College and Research Institute, Kudumiyanmalai", district: "Pudukkottai", location: "Kudumiyanmalai", state: "Tamil Nadu", stream: "Agriculture", accreditation: "ICAR Accredited" },
  { collegeName: "Agricultural College and Research Institute, Eachangkottai", district: "Thanjavur", location: "Eachangkottai", state: "Tamil Nadu", stream: "Agriculture", accreditation: "ICAR Accredited" },
  { collegeName: "Anbil Dharmalingam Agricultural College, Trichy", district: "Tiruchirappalli", location: "Tiruchirappalli", state: "Tamil Nadu", stream: "Agriculture", accreditation: "ICAR Accredited" },
  { collegeName: "Agricultural Engineering College, Kumulur", district: "Tiruchirappalli", location: "Kumulur", state: "Tamil Nadu", stream: "Agriculture", accreditation: "ICAR Accredited" },
  { collegeName: "Horticultural College and Research Institute, Periyakulam", district: "Theni", location: "Periyakulam", state: "Tamil Nadu", stream: "Agriculture", accreditation: "ICAR Accredited" },
  { collegeName: "Horticultural College and Research Institute, Coimbatore", district: "Coimbatore", location: "Coimbatore", state: "Tamil Nadu", stream: "Agriculture", accreditation: "ICAR Accredited" },
  { collegeName: "Forest College and Research Institute, Mettupalayam", district: "Coimbatore", location: "Mettupalayam", state: "Tamil Nadu", stream: "Agriculture", accreditation: "ICAR Accredited" },
  { collegeName: "Agricultural College and Research Institute, Karur", district: "Karur", location: "Karur", state: "Tamil Nadu", stream: "Agriculture" },
  { collegeName: "Agricultural College and Research Institute, Tiruchirappalli", district: "Tiruchirappalli", location: "Tiruchirappalli", state: "Tamil Nadu", stream: "Agriculture" },
  { collegeName: "Community Science College and Research Institute, Madurai", district: "Madurai", location: "Madurai", state: "Tamil Nadu", stream: "Agriculture" },
  { collegeName: "Vanavarayar Institute of Agriculture, Pollachi", district: "Coimbatore", location: "Pollachi", state: "Tamil Nadu", stream: "Agriculture" },
  { collegeName: "Imayam Institute of Agriculture and Technology", district: "Tiruchirappalli", location: "Thuraiyur", state: "Tamil Nadu", stream: "Agriculture" },
  { collegeName: "Adhiparasakthi Agricultural College", district: "Vellore", location: "Kalavai, Vellore", state: "Tamil Nadu", stream: "Agriculture" },
  { collegeName: "Annamalai University Faculty of Agriculture", district: "Cuddalore", location: "Chidambaram", state: "Tamil Nadu", stream: "Agriculture" },
  { collegeName: "Agricultural College and Research Institute, Thiruvannamalai", district: "Tiruvannamalai", location: "Tiruvannamalai", state: "Tamil Nadu", stream: "Agriculture" },
  { collegeName: "Agricultural College and Research Institute, Coimbatore", district: "Coimbatore", location: "Coimbatore", state: "Tamil Nadu", stream: "Agriculture" },
  { collegeName: "Agricultural College and Research Institute, Vellore", district: "Vellore", location: "Vellore", state: "Tamil Nadu", stream: "Agriculture" },
  { collegeName: "Pandit Jawaharlal Nehru College of Agriculture, Karaikal", district: "Nagapattinam", location: "Karaikal", state: "Tamil Nadu", stream: "Agriculture" },
  { collegeName: "Agricultural College and Research Institute, Chettinad", district: "Sivaganga", location: "Chettinad", state: "Tamil Nadu", stream: "Agriculture" },
  { collegeName: "Agricultural College and Research Institute, Attur", district: "Salem", location: "Attur", state: "Tamil Nadu", stream: "Agriculture" },
  { collegeName: "Agricultural College and Research Institute, Kumulur", district: "Tiruchirappalli", location: "Kumulur", state: "Tamil Nadu", stream: "Agriculture" },
  { collegeName: "Agricultural College and Research Institute, Kudumiyanmalai", district: "Pudukkottai", location: "Kudumiyanmalai", state: "Tamil Nadu", stream: "Agriculture" },
  { collegeName: "Agricultural College and Research Institute, Killikulam", district: "Tirunelveli", location: "Killikulam", state: "Tamil Nadu", stream: "Agriculture" },
  { collegeName: "Agricultural College and Research Institute, Nagercoil", district: "Kanyakumari", location: "Nagercoil", state: "Tamil Nadu", stream: "Agriculture" },
];

// ── Combine all colleges ──
const ALL_COLLEGES = [
  ...engineeringColleges,
  ...medicalColleges,
  ...artsAndScienceColleges,
  ...polytechnicColleges,
  ...lawColleges,
  ...agricultureColleges,
];

// ── Seed function ──
async function seedColleges() {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.error("ERROR: MONGO_URI not found in .env");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB");

    // Drop existing colleges
    const deleteResult = await College.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing colleges`);

    // Insert all colleges
    const inserted = await College.insertMany(ALL_COLLEGES, { ordered: false });
    console.log(`\nSuccessfully inserted ${inserted.length} colleges!`);

    // Print summary by stream
    const summary = {};
    for (const c of inserted) {
      summary[c.stream] = (summary[c.stream] || 0) + 1;
    }
    console.log("\nSummary by stream:");
    for (const [stream, count] of Object.entries(summary)) {
      console.log(`  ${stream}: ${count}`);
    }

    // Print unique districts
    const districts = [...new Set(inserted.map((c) => c.district).filter(Boolean))].sort();
    console.log(`\nUnique districts: ${districts.length}`);
    console.log(`  ${districts.join(", ")}`);

    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error.message);
    if (error.insertedDocs) {
      console.log(`Partial insert: ${error.insertedDocs.length} succeeded`);
    }
    process.exit(1);
  }
}

seedColleges();
