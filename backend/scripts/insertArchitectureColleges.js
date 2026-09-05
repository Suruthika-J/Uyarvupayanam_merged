const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the root .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const College = require('../models/College');

const architectureColleges = [
  {
    collegeName: "School of Architecture and Planning, Anna University",
    stream: "Architecture",
    category: "Architecture",
    type: "Government",
    district: "Chennai",
    location: "Sardar Patel Road, Guindy, Chennai",
    state: "Tamil Nadu",
    feesPerYear: "46,720",
    placementPercentage: "85",
    rank: "1",
    accreditation: "COA Approved, Anna University Affiliated",
    website: "https://sap.annauniv.edu/"
  },
  {
    collegeName: "National Institute of Technology (NIT) Tiruchirappalli",
    stream: "Architecture",
    category: "Architecture",
    type: "Government",
    district: "Tiruchirappalli",
    location: "Tanjore Main Road, NH 67, Tiruchirappalli",
    state: "Tamil Nadu",
    feesPerYear: "1,45,000",
    placementPercentage: "92",
    rank: "2",
    accreditation: "NIT Council, NIRF Top Ranked",
    website: "https://www.nitt.edu/"
  },
  {
    collegeName: "Thiagarajar College of Engineering (TCE) Madurai",
    stream: "Architecture",
    category: "Architecture",
    type: "Government Aided",
    district: "Madurai",
    location: "Tiruparankundram, Madurai",
    state: "Tamil Nadu",
    feesPerYear: "85,000",
    placementPercentage: "80",
    rank: "3",
    accreditation: "COA Approved, Autonomous",
    website: "https://www.tce.edu/"
  },
  {
    collegeName: "SRM Institute of Science and Technology (SRMIST)",
    stream: "Architecture",
    category: "Architecture",
    type: "Private Deemed",
    district: "Chengalpattu",
    location: "Kattankulathur, Kanchipuram District",
    state: "Tamil Nadu",
    feesPerYear: "2,75,000",
    placementPercentage: "88",
    rank: "4",
    accreditation: "NAAC A++, COA Approved",
    website: "https://www.srmist.edu.in/"
  },
  {
    collegeName: "Vellore Institute of Technology (VIT)",
    stream: "Architecture",
    category: "Architecture",
    type: "Private Deemed",
    district: "Vellore",
    location: "Katpadi, Vellore",
    state: "Tamil Nadu",
    feesPerYear: "3,10,000",
    placementPercentage: "90",
    rank: "5",
    accreditation: "NAAC A++, NIRF Ranked",
    website: "https://vit.ac.in/"
  },
  {
    collegeName: "BS Abdur Rahman Crescent Institute of Science & Technology",
    stream: "Architecture",
    category: "Architecture",
    type: "Private Deemed",
    district: "Chengalpattu",
    location: "Vandalur, Chennai",
    state: "Tamil Nadu",
    feesPerYear: "2,50,000",
    placementPercentage: "75",
    rank: "6",
    accreditation: "COA Approved, NAAC A+",
    website: "https://crescent.education/"
  },
  {
    collegeName: "Sathyabama Institute of Science and Technology",
    stream: "Architecture",
    category: "Architecture",
    type: "Private Deemed",
    district: "Chennai",
    location: "Jeppiaar Nagar, Old Mamallapuram Road, Chennai",
    state: "Tamil Nadu",
    feesPerYear: "2,20,000",
    placementPercentage: "82",
    rank: "7",
    accreditation: "NAAC A, COA Approved",
    website: "https://www.sathyabama.ac.in/"
  },
  {
    collegeName: "Hindustan Institute of Technology and Science (HITS)",
    stream: "Architecture",
    category: "Architecture",
    type: "Private Deemed",
    district: "Chennai",
    location: "Padur, Kelambakkam, Chennai",
    state: "Tamil Nadu",
    feesPerYear: "2,40,000",
    placementPercentage: "78",
    rank: "8",
    accreditation: "NAAC A, COA Approved",
    website: "https://hindustanuniv.ac.in/"
  },
  {
    collegeName: "MEASI Academy of Architecture",
    stream: "Architecture",
    category: "Architecture",
    type: "Private",
    district: "Chennai",
    location: "Royapettah, Chennai",
    state: "Tamil Nadu",
    feesPerYear: "75,000",
    placementPercentage: "70",
    rank: "9",
    accreditation: "COA Approved, Affiliated to Anna University",
    website: "http://measiarch.ac.in/"
  },
  {
    collegeName: "Sasi Creative School of Architecture",
    stream: "Architecture",
    category: "Architecture",
    type: "Private",
    district: "Coimbatore",
    location: "Myleripalayam, Coimbatore",
    state: "Tamil Nadu",
    feesPerYear: "1,50,000",
    placementPercentage: "85",
    rank: "10",
    accreditation: "COA Approved, International Exchange",
    website: "https://scsa.ac.in/"
  },
  {
    collegeName: "McGAN'S Ooty School of Architecture",
    stream: "Architecture",
    category: "Architecture",
    type: "Private",
    district: "Nilgiris",
    location: "Perar, Kotagiri Road, Ooty",
    state: "Tamil Nadu",
    feesPerYear: "1,25,000",
    placementPercentage: "75",
    rank: "11",
    accreditation: "COA Approved, Affiliated to Anna University",
    website: "http://ootyarchitecture.com/"
  },
  {
    collegeName: "Adhiyamaan College of Engineering (Architecture)",
    stream: "Architecture",
    category: "Architecture",
    type: "Private",
    district: "Krishnagiri",
    location: "Hosur, Tamil Nadu",
    state: "Tamil Nadu",
    feesPerYear: "65,000",
    placementPercentage: "70",
    rank: "12",
    accreditation: "COA Approved, Anna University",
    website: "http://adhiyamaan.ac.in/"
  },
  {
    collegeName: "Kongu School of Architecture",
    stream: "Architecture",
    category: "Architecture",
    type: "Private",
    district: "Erode",
    location: "Perundurai, Erode",
    state: "Tamil Nadu",
    feesPerYear: "70,000",
    placementPercentage: "72",
    rank: "13",
    accreditation: "COA Approved, Kongu Engineering College Campus",
    website: "https://ksa.ac.in/"
  },
  {
    collegeName: "Mohamed Sathak A.J. Academy of Architecture",
    stream: "Architecture",
    category: "Architecture",
    type: "Private",
    district: "Kanchipuram",
    location: "OMR, Siruseri, Kanchipuram",
    state: "Tamil Nadu",
    feesPerYear: "80,000",
    placementPercentage: "70",
    rank: "14",
    accreditation: "COA Approved, Affiliated to Anna University",
    website: "https://msajaa.com/"
  },
  {
    collegeName: "Periyar Maniammai Institute of Science and Technology (PMIST)",
    stream: "Architecture",
    category: "Architecture",
    type: "Private Deemed",
    district: "Thanjavur",
    location: "Vallam, Thanjavur",
    state: "Tamil Nadu",
    feesPerYear: "95,000",
    placementPercentage: "65",
    rank: "15",
    accreditation: "COA Approved, NAAC B++",
    website: "https://pmu.edu/"
  },
  {
    collegeName: "CARE School of Architecture",
    stream: "Architecture",
    category: "Architecture",
    type: "Private",
    district: "Tiruchirappalli",
    location: "Thayanoor, Trichy",
    state: "Tamil Nadu",
    feesPerYear: "1,10,000",
    placementPercentage: "80",
    rank: "16",
    accreditation: "COA Approved, Affiliated to Anna University",
    website: "https://care.ac.in/arch/"
  },
  {
    collegeName: "MARG Institute of Design and Architecture Swarnabhoomi (MIDAS)",
    stream: "Architecture",
    category: "Architecture",
    type: "Private",
    district: "Kanchipuram",
    location: "ECR, Seekinankuppam, Kanchipuram",
    state: "Tamil Nadu",
    feesPerYear: "2,00,000",
    placementPercentage: "75",
    rank: "17",
    accreditation: "COA Approved, Affiliated to Anna University",
    website: "https://midas.ac.in/"
  },
  {
    collegeName: "Prime College of Architecture and Planning",
    stream: "Architecture",
    category: "Architecture",
    type: "Private",
    district: "Nagapattinam",
    location: "Kilvelur, Nagapattinam",
    state: "Tamil Nadu",
    feesPerYear: "60,000",
    placementPercentage: "60",
    rank: "18",
    accreditation: "COA Approved, Affiliated to Anna University",
    website: "http://primecollege.com/"
  },
  {
    collegeName: "Rajalakshmi School of Architecture",
    stream: "Architecture",
    category: "Architecture",
    type: "Private",
    district: "Kanchipuram",
    location: "Thandalam, Chennai",
    state: "Tamil Nadu",
    feesPerYear: "1,20,000",
    placementPercentage: "80",
    rank: "19",
    accreditation: "COA Approved, Affiliated to Anna University",
    website: "https://www.rajalakshmi.org/rsa/"
  },
  {
    collegeName: "Meenakshi College of Engineering (Architecture)",
    stream: "Architecture",
    category: "Architecture",
    type: "Private",
    district: "Chennai",
    location: "Vembuliamman Koil Street, West KK Nagar, Chennai",
    state: "Tamil Nadu",
    feesPerYear: "90,000",
    placementPercentage: "70",
    rank: "20",
    accreditation: "COA Approved, Affiliated to Anna University",
    website: "http://mce.edu.in/"
  },
  {
    collegeName: "Excel School of Architecture",
    stream: "Architecture",
    category: "Architecture",
    type: "Private",
    district: "Namakkal",
    location: "Pallakkapalayam, Komarapalayam, Namakkal",
    state: "Tamil Nadu",
    feesPerYear: "65,000",
    placementPercentage: "65",
    rank: "21",
    accreditation: "COA Approved, Affiliated to Anna University",
    website: "https://excelcolleges.com/"
  },
  {
    collegeName: "Skandha School of Architecture",
    stream: "Architecture",
    category: "Architecture",
    type: "Private",
    district: "Salem",
    location: "Kakkaveri, Salem",
    state: "Tamil Nadu",
    feesPerYear: "60,000",
    placementPercentage: "60",
    rank: "22",
    accreditation: "COA Approved, Affiliated to Anna University",
    website: "http://skandhaarchitecture.com/"
  },
  {
    collegeName: "Dhanalakshmi Srinivasan University (Architecture)",
    stream: "Architecture",
    category: "Architecture",
    type: "Private State University",
    district: "Perambalur",
    location: "Samayapuram, Trichy (Perambalur Dist)",
    state: "Tamil Nadu",
    feesPerYear: "1,50,000",
    placementPercentage: "75",
    rank: "23",
    accreditation: "COA Approved",
    website: "https://dsu.edu.in/"
  },
  {
    collegeName: "Kalasalingam Academy of Research and Education (Architecture)",
    stream: "Architecture",
    category: "Architecture",
    type: "Private Deemed",
    district: "Virudhunagar",
    location: "Anand Nagar, Krishnankoil",
    state: "Tamil Nadu",
    feesPerYear: "1,10,000",
    placementPercentage: "80",
    rank: "24",
    accreditation: "NAAC A, COA Approved",
    website: "https://kalasalingam.ac.in/"
  },
  {
    collegeName: "Aalim Muhammed Salegh Academy of Architecture",
    stream: "Architecture",
    category: "Architecture",
    type: "Private",
    district: "Chennai",
    location: "Muthapudupet, Avadi IAF, Chennai",
    state: "Tamil Nadu",
    feesPerYear: "85,000",
    placementPercentage: "70",
    rank: "25",
    accreditation: "COA Approved, Affiliated to Anna University",
    website: "https://aalimmuhammedsalegh.org/architecture/"
  },
  {
    collegeName: "Anand School of Architecture",
    stream: "Architecture",
    category: "Architecture",
    type: "Private",
    district: "Chennai",
    location: "Old Mahabalipuram Road, Kalasalingam Enclave, Chennai",
    state: "Tamil Nadu",
    feesPerYear: "95,000",
    placementPercentage: "65",
    rank: "26",
    accreditation: "COA Approved, Affiliated to Anna University",
    website: "https://anandarchitecture.ac.in/"
  },
  {
    collegeName: "Ranganathan Architecture College",
    stream: "Architecture",
    category: "Architecture",
    type: "Private",
    district: "Coimbatore",
    location: "Thondamuthur, Coimbatore",
    state: "Tamil Nadu",
    feesPerYear: "75,000",
    placementPercentage: "60",
    rank: "27",
    accreditation: "COA Approved, Affiliated to Anna University",
    website: "http://rac.org.in/"
  },
  {
    collegeName: "San Academy of Architecture",
    stream: "Architecture",
    category: "Architecture",
    type: "Private",
    district: "Coimbatore",
    location: "Mawthangal, Coimbatore",
    state: "Tamil Nadu",
    feesPerYear: "80,000",
    placementPercentage: "65",
    rank: "28",
    accreditation: "COA Approved, Affiliated to Anna University",
    website: "http://sanarchitecture.com/"
  },
  {
    collegeName: "Surya School of Architecture",
    stream: "Architecture",
    category: "Architecture",
    type: "Private",
    district: "Viluppuram",
    location: "Surya Nagar, GST Road, Vikravandi",
    state: "Tamil Nadu",
    feesPerYear: "60,000",
    placementPercentage: "55",
    rank: "29",
    accreditation: "COA Approved, Affiliated to Anna University",
    website: "http://suryagroup.edu.in/"
  },
  {
    collegeName: "VPS School of Architecture",
    stream: "Architecture",
    category: "Architecture",
    type: "Private",
    district: "Madurai",
    location: "Pillaayarnatham, Madurai",
    state: "Tamil Nadu",
    feesPerYear: "65,000",
    placementPercentage: "60",
    rank: "30",
    accreditation: "COA Approved, Affiliated to Anna University",
    website: "http://vpsarch.com/"
  },
  {
    collegeName: "J.K.K. Munirajah School of Architecture",
    stream: "Architecture",
    category: "Architecture",
    type: "Private",
    district: "Erode",
    location: "T.N.Palayam, Gobi, Erode",
    state: "Tamil Nadu",
    feesPerYear: "60,000",
    placementPercentage: "55",
    rank: "31",
    accreditation: "COA Approved, Affiliated to Anna University",
    website: "http://jkkmarch.edu.in/"
  },
  {
    collegeName: "Dr. M.G.R. Educational and Research Institute (Architecture)",
    stream: "Architecture",
    category: "Architecture",
    type: "Private Deemed",
    district: "Chennai",
    location: "Maduravoyal, Chennai",
    state: "Tamil Nadu",
    feesPerYear: "1,50,000",
    placementPercentage: "80",
    rank: "32",
    accreditation: "COA Approved, NAAC A",
    website: "https://www.drmgrdu.ac.in/"
  },
  {
    collegeName: "Tamilnadu School of Architecture",
    stream: "Architecture",
    category: "Architecture",
    type: "Private",
    district: "Coimbatore",
    location: "Karumathampatti, Coimbatore",
    state: "Tamil Nadu",
    feesPerYear: "70,000",
    placementPercentage: "65",
    rank: "33",
    accreditation: "COA Approved, Affiliated to Anna University",
    website: "http://tnsa.ac.in/"
  },
  {
    collegeName: "RVS School of Architecture",
    stream: "Architecture",
    category: "Architecture",
    type: "Private",
    district: "Coimbatore",
    location: "Kannampalayam, Coimbatore",
    state: "Tamil Nadu",
    feesPerYear: "75,000",
    placementPercentage: "70",
    rank: "34",
    accreditation: "COA Approved, Affiliated to Anna University",
    website: "http://rvsarch.ac.in/"
  },
  {
    collegeName: "Measi Academy of Architecture",
    stream: "Architecture",
    category: "Architecture",
    type: "Private",
    district: "Chennai",
    location: "Peters Road, Royapettah, Chennai",
    state: "Tamil Nadu",
    feesPerYear: "85,000",
    placementPercentage: "75",
    rank: "35",
    accreditation: "COA Approved, Affiliated to Anna University",
    website: "http://measiarch.ac.in/"
  }
];

async function insertColleges() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/uyarvu-payanam');
    console.log('Connected to MongoDB');

    for (const college of architectureColleges) {
      const cleanedCollege = {
        ...college,
        feesPerYear: Number(college.feesPerYear.replace(/,/g, '')) || 0,
        placementPercentage: Number(college.placementPercentage) || 0,
        rank: Number(college.rank) || 0
      };
      await College.findOneAndUpdate(
        { collegeName: cleanedCollege.collegeName },
        cleanedCollege,
        { upsert: true, new: true }
      );
    }

    console.log('Successfully inserted/updated Architecture colleges');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error inserting colleges:', err);
    process.exit(1);
  }
}

insertColleges();
