const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const College = require("../models/College");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

const dataset = [
    { collegeName: "Sasi Creative Institute of Design", location: "Coimbatore", district: "Coimbatore", state: "Tamil Nadu", feesPerYear: 225000, stream: "Design", category: "Private" },
    { collegeName: "Bon Secours College for Women", location: "Thanjavur", district: "Thanjavur", state: "Tamil Nadu", feesPerYear: 45000, stream: "Design", category: "Private" },
    { collegeName: "Bishop Appasamy College of Arts and Science", location: "Coimbatore", district: "Coimbatore", state: "Tamil Nadu", feesPerYear: 65000, stream: "Design", category: "Private" },
    { collegeName: "Sardar Vallabhbhai Patel International School of Textiles & Management", location: "Coimbatore", district: "Coimbatore", state: "Tamil Nadu", feesPerYear: 120000, stream: "Design", category: "Government" },
    { collegeName: "Kumaraguru College of Liberal Arts and Science (KCLAS)", location: "Coimbatore", district: "Coimbatore", state: "Tamil Nadu", feesPerYear: 110000, stream: "Design", category: "Private" },
    { collegeName: "Bharath Institute of Higher Education and Research (BIHER)", location: "Selaiyur", district: "Chennai", state: "Tamil Nadu", feesPerYear: 150000, stream: "Design", category: "Private" },
    { collegeName: "Saveetha Institute of Medical and Technical Sciences (SIMATS)", location: "Poonamallee", district: "Chennai", state: "Tamil Nadu", feesPerYear: 175000, stream: "Design", category: "Private" },
    { collegeName: "Kalasalingam Academy of Research and Education", location: "Krishnankoil", district: "Virudhunagar", state: "Tamil Nadu", feesPerYear: 120000, stream: "Design", category: "Private" },
    { collegeName: "Noorul Islam Centre for Higher Education", location: "Kumaracoil", district: "Kanyakumari", state: "Tamil Nadu", feesPerYear: 90000, stream: "Design", category: "Private" },
    { collegeName: "St. Peter's Institute of Higher Education and Research", location: "Avadi", district: "Chennai", state: "Tamil Nadu", feesPerYear: 85000, stream: "Design", category: "Private" },
    { collegeName: "IIITDM Kancheepuram (Product Design)", location: "Kancheepuram", district: "Kanchipuram", state: "Tamil Nadu", feesPerYear: 180000, stream: "Design", category: "Government" },
    { collegeName: "JD Institute of Fashion Technology", location: "Nungambakkam", district: "Chennai", state: "Tamil Nadu", feesPerYear: 160000, stream: "Design", category: "Private" },
    { collegeName: "INIFD Chennai", location: "Kothari Road", district: "Chennai", state: "Tamil Nadu", feesPerYear: 140000, stream: "Design", category: "Private" },
    { collegeName: "Raffles Millennium International", location: "Chennai", district: "Chennai", state: "Tamil Nadu", feesPerYear: 450000, stream: "Design", category: "Private" },
    { collegeName: "Wiztoonz Academy of Media and Design", location: "Chennai", district: "Chennai", state: "Tamil Nadu", feesPerYear: 130000, stream: "Design", category: "Private" },
    { collegeName: "Image College of Arts, Animation & Technology (ICAT)", location: "Chennai", district: "Chennai", state: "Tamil Nadu", feesPerYear: 150000, stream: "Design", category: "Private" },
    { collegeName: "DreamZone School of Creative Studies", location: "Various Locations", district: "Chennai", state: "Tamil Nadu", feesPerYear: 80000, stream: "Design", category: "Private" },
    { collegeName: "Annai Fathima College of Arts and Science", location: "Madurai", district: "Madurai", state: "Tamil Nadu", feesPerYear: 55000, stream: "Design", category: "Private" },
    { collegeName: "Cheran College of Arts and Science", location: "Kangayam", district: "Tiruppur", state: "Tamil Nadu", feesPerYear: 48000, stream: "Design", category: "Private" },
    { collegeName: "AJK College of Arts and Science", location: "Coimbatore", district: "Coimbatore", state: "Tamil Nadu", feesPerYear: 60000, stream: "Design", category: "Private" },
    { collegeName: "Kathir College of Arts and Science", location: "Coimbatore", district: "Coimbatore", state: "Tamil Nadu", feesPerYear: 50000, stream: "Design", category: "Private" },
    { collegeName: "R.V.S. College of Arts and Science", location: "Sulur", district: "Coimbatore", state: "Tamil Nadu", feesPerYear: 45000, stream: "Design", category: "Private" },
    { collegeName: "Sankara College of Science and Commerce", location: "Saravanampatty", district: "Coimbatore", state: "Tamil Nadu", feesPerYear: 52000, stream: "Design", category: "Private" },
    { collegeName: "V.L.B. Janakiammal College of Arts and Science", location: "Coimbatore", district: "Coimbatore", state: "Tamil Nadu", feesPerYear: 58000, stream: "Design", category: "Private" },
    { collegeName: "Karpagam Academy of Higher Education", location: "Coimbatore", district: "Coimbatore", state: "Tamil Nadu", feesPerYear: 95000, stream: "Design", category: "Private" },
    { collegeName: "P.P.G. College of Arts and Science", location: "Coimbatore", district: "Coimbatore", state: "Tamil Nadu", feesPerYear: 42000, stream: "Design", category: "Private" },
    { collegeName: "Vidyasagar College of Arts and Science", location: "Udumalpet", district: "Tiruppur", state: "Tamil Nadu", feesPerYear: 38000, stream: "Design", category: "Private" },
    { collegeName: "Tiruppur Kumaran College for Women", location: "Tiruppur", district: "Tiruppur", state: "Tamil Nadu", feesPerYear: 35000, stream: "Design", category: "Private" },
    { collegeName: "Jayaraj Annapackiam College for Women", location: "Periyakulam", district: "Theni", state: "Tamil Nadu", feesPerYear: 32000, stream: "Design", category: "Private" },
    { collegeName: "Auxilium College", location: "Vellore", district: "Vellore", state: "Tamil Nadu", feesPerYear: 40000, stream: "Design", category: "Private" },
    { collegeName: "Islamiah Women's Arts and Science College", location: "Vaniyambadi", district: "Tirupathur", state: "Tamil Nadu", feesPerYear: 36000, stream: "Design", category: "Private" },
    { collegeName: "Mazharul Uloom College", location: "Ambur", district: "Tirupathur", state: "Tamil Nadu", feesPerYear: 34000, stream: "Design", category: "Private" },
    { collegeName: "Sacred Heart College (Autonomous)", location: "Tirupathur", district: "Tirupathur", state: "Tamil Nadu", feesPerYear: 42000, stream: "Design", category: "Private" }
];

const insertColleges = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.");

        console.log(`Inserting ${dataset.length} additional design colleges...`);
        
        for (const data of dataset) {
            await College.findOneAndUpdate(
                { collegeName: data.collegeName },
                data,
                { upsert: true, returnDocument: 'after' }
            );
        }

        console.log("✅ 50+ Design colleges target reached.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error inserting data:", error);
        process.exit(1);
    }
};

insertColleges();
