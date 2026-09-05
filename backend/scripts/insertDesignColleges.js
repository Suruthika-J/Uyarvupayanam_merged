const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const College = require("../models/College");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

const dataset = [
    {
        collegeName: "National Institute of Fashion Technology (NIFT)",
        location: "Taramani",
        district: "Chennai",
        state: "Tamil Nadu",
        feesPerYear: 270000,
        stream: "Design",
        category: "Government",
        type: "Statutory Institute",
        accreditation: "Ministry of Textiles"
    },
    {
        collegeName: "DJ Academy of Design (DJAD)",
        location: "Coimbatore",
        district: "Coimbatore",
        state: "Tamil Nadu",
        feesPerYear: 350000,
        stream: "Design",
        category: "Private",
        type: "Design Institute"
    },
    {
        collegeName: "Footwear Design and Development Institute (FDDI)",
        location: "Irungattukottai",
        district: "Kanchipuram",
        state: "Tamil Nadu",
        feesPerYear: 200000,
        stream: "Design",
        category: "Government",
        type: "Institution of National Importance"
    },
    {
        collegeName: "DOT School of Design",
        location: "Ambattur",
        district: "Chennai",
        state: "Tamil Nadu",
        feesPerYear: 250000,
        stream: "Design",
        category: "Private",
        type: "Design School"
    },
    {
        collegeName: "NIFT-TEA College of Knitwear Fashion",
        location: "Tiruppur",
        district: "Tiruppur",
        state: "Tamil Nadu",
        feesPerYear: 80000,
        stream: "Design",
        category: "Private",
        type: "Co-Ed",
        accreditation: "TEA Sponsored"
    },
    {
        collegeName: "Madras Institute of Fashion Technology (MIFT)",
        location: "Chennai",
        district: "Chennai",
        state: "Tamil Nadu",
        feesPerYear: 120000,
        stream: "Design",
        category: "Private",
    },
    {
        collegeName: "Loyola College (DDU KAUSHAL Kendra)",
        location: "Nungambakkam",
        district: "Chennai",
        state: "Tamil Nadu",
        feesPerYear: 90000,
        stream: "Design",
        category: "Private",
        accreditation: "NAAC A++"
    },
    {
        collegeName: "Hindustan Institute of Technology and Science (HITS)",
        location: "Padur",
        district: "Chennai",
        state: "Tamil Nadu",
        feesPerYear: 185000,
        stream: "Design",
        category: "Private",
        accreditation: "NAAC A+"
    },
    {
        collegeName: "Vellore Institute of Technology (VIT)",
        location: "Vellore",
        district: "Vellore",
        state: "Tamil Nadu",
        feesPerYear: 176000,
        stream: "Design",
        category: "Private",
        accreditation: "NAAC A++"
    },
    {
        collegeName: "PSG College of Technology (Department of Fashion Tech)",
        location: "Coimbatore",
        district: "Coimbatore",
        state: "Tamil Nadu",
        feesPerYear: 55000,
        stream: "Design",
        category: "Private",
        accreditation: "NAAC A++"
    }
];

const insertColleges = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.");

        console.log(`Inserting ${dataset.length} design colleges...`);
        
        for (const data of dataset) {
            await College.findOneAndUpdate(
                { collegeName: data.collegeName },
                data,
                { upsert: true, returnDocument: 'after' }
            );
        }

        console.log("✅ Design colleges inserted successfully.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error inserting data:", error);
        process.exit(1);
    }
};

insertColleges();
