const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const College = require("../models/College");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

const dataset = [
    {
        collegeName: "Madras Christian College",
        location: "Tambaram",
        district: "Chennai",
        state: "Tamil Nadu",
        feesPerYear: 27000,
        stream: "Management",
        category: "Government",
        accreditation: "NAAC A",
        type: "Autonomous"
    },
    {
        collegeName: "Indian Maritime University",
        location: "Chennai",
        district: "Chennai",
        state: "Tamil Nadu",
        feesPerYear: 310000,
        stream: "Management",
        category: "Government",
        type: "Central University"
    },
    {
        collegeName: "SIVET College",
        location: "Gowrivakkam",
        district: "Chennai",
        state: "Tamil Nadu",
        feesPerYear: 0,
        stream: "Management",
        category: "Government",
        accreditation: "NAAC",
    },
    {
        collegeName: "Pachaiyappas College",
        location: "Chennai",
        district: "Chennai",
        state: "Tamil Nadu",
        feesPerYear: 0,
        stream: "Management",
        category: "Government",
        accreditation: "NAAC",
    },
    {
        collegeName: "Government Arts College (GAC), Paramakudi",
        location: "Paramakudi",
        district: "Ramanathapuram",
        state: "Tamil Nadu",
        feesPerYear: 0,
        stream: "Management",
        category: "Government",
        accreditation: "NAAC",
    },
    {
        collegeName: "Arumugam Pillai Seethai Ammal College",
        location: "Thiruppattur",
        district: "Sivaganga",
        state: "Tamil Nadu",
        feesPerYear: 0,
        stream: "Management",
        category: "Government",
        accreditation: "NAAC",
    },
    {
        collegeName: "Bharathiar University Arts and Science College (BUCAS), Coimbatore",
        location: "Coimbatore",
        district: "Coimbatore",
        state: "Tamil Nadu",
        feesPerYear: 0,
        stream: "Management",
        category: "Government",
        rank: "#76 NIRF"
    },
    {
        collegeName: "Government Arts College, Coimbatore",
        location: "Coimbatore",
        district: "Coimbatore",
        state: "Tamil Nadu",
        feesPerYear: 1355,
        stream: "Management",
        category: "Government",
    },
    {
        collegeName: "Government Arts College, Salem (GAC Salem)",
        location: "Salem",
        district: "Salem",
        state: "Tamil Nadu",
        feesPerYear: 2225,
        stream: "Management",
        category: "Government",
        accreditation: "NAAC",
    },
    {
        collegeName: "Arignar Anna Government Arts College (AAGA), Namakkal",
        location: "Namakkal",
        district: "Namakkal",
        state: "Tamil Nadu",
        feesPerYear: 0,
        stream: "Management",
        category: "Government",
        accreditation: "NAAC",
    },
    {
        collegeName: "Sri Parasakthi College for Women",
        location: "Courtallam",
        district: "Tenkasi",
        state: "Tamil Nadu",
        feesPerYear: 0,
        stream: "Management",
        category: "Government",
        accreditation: "NAAC",
    },
    {
        collegeName: "Gobi Arts & Science College",
        location: "Gobichettipalayam",
        district: "Erode",
        state: "Tamil Nadu",
        feesPerYear: 0,
        stream: "Management",
        category: "Government",
        accreditation: "NAAC",
    },
    {
        collegeName: "G.V.N. College",
        location: "Kovilpatti",
        district: "Thoothukudi",
        state: "Tamil Nadu",
        feesPerYear: 0,
        stream: "Management",
        category: "Government",
        accreditation: "NAAC",
    },
    {
        collegeName: "Bharathi Women's Arts & Science College",
        location: "Kallakurichi",
        district: "Kallakurichi",
        state: "Tamil Nadu",
        feesPerYear: 0,
        stream: "Management",
        category: "Government",
        accreditation: "NAAC",
    },
    {
        collegeName: "Avinashilingam Institute for Home Science and Higher Education for Women",
        location: "Coimbatore",
        district: "Coimbatore",
        state: "Tamil Nadu",
        feesPerYear: 53000,
        stream: "Management",
        category: "Government",
        type: "Deemed University",
        accreditation: "NAAC"
    }
];

const insertColleges = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.");

        console.log(`Inserting ${dataset.length} management colleges...`);
        
        for (const data of dataset) {
            await College.findOneAndUpdate(
                { collegeName: data.collegeName },
                data,
                { upsert: true, returnDocument: 'after' }
            );
        }

        console.log("✅ Management colleges inserted successfully.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error inserting data:", error);
        process.exit(1);
    }
};

insertColleges();
