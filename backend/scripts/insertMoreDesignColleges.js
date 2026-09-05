const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const College = require("../models/College");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

const dataset = [
    {
        collegeName: "ICAT Design and Media College",
        location: "Mylapore",
        district: "Chennai",
        state: "Tamil Nadu",
        feesPerYear: 150000,
        stream: "Design",
        category: "Private",
        type: "Design & Media College"
    },
    {
        collegeName: "B.S. Abdur Rahman Crescent Institute of Science and Technology",
        location: "Vandalur",
        district: "Chennai",
        state: "Tamil Nadu",
        feesPerYear: 120000,
        stream: "Design",
        category: "Private",
        accreditation: "NAAC A+"
    },
    {
        collegeName: "Amrita School of Engineering (Department of Design)",
        location: "Ettimadai",
        district: "Coimbatore",
        state: "Tamil Nadu",
        feesPerYear: 250000,
        stream: "Design",
        category: "Private",
        accreditation: "NAAC A++"
    },
    {
        collegeName: "Hindusthan College of Arts and Science (HICAS)",
        location: "Coimbatore",
        district: "Coimbatore",
        state: "Tamil Nadu",
        feesPerYear: 60000,
        stream: "Design",
        category: "Private",
        accreditation: "NAAC B++"
    },
    {
        collegeName: "Nehru Arts and Science College",
        location: "Tirumalayampalayam",
        district: "Coimbatore",
        state: "Tamil Nadu",
        feesPerYear: 50000,
        stream: "Design",
        category: "Private",
        accreditation: "NAAC A"
    },
    {
        collegeName: "Kongu Arts and Science College",
        location: "Erode",
        district: "Erode",
        state: "Tamil Nadu",
        feesPerYear: 45000,
        stream: "Design",
        category: "Private",
        accreditation: "NAAC A+"
    },
    {
        collegeName: "Vels Institute of Science, Technology & Advanced Studies (VISTAS)",
        location: "Pallavaram",
        district: "Chennai",
        state: "Tamil Nadu",
        feesPerYear: 110000,
        stream: "Design",
        category: "Private",
        accreditation: "NAAC A"
    },
    {
        collegeName: "Bishop Heber College (B.Voc Fashion Tech)",
        location: "Tiruchirappalli",
        district: "Tiruchirappalli",
        state: "Tamil Nadu",
        feesPerYear: 40000,
        stream: "Design",
        category: "Private",
        accreditation: "NAAC A++"
    },
    {
        collegeName: "Sona College of Arts and Science",
        location: "Salem",
        district: "Salem",
        state: "Tamil Nadu",
        feesPerYear: 55000,
        stream: "Design",
        category: "Private",
        accreditation: "NAAC A"
    },
    {
        collegeName: "KSR College of Arts and Science",
        location: "Tiruchengode",
        district: "Namakkal",
        state: "Tamil Nadu",
        feesPerYear: 35000,
        stream: "Design",
        category: "Private",
        accreditation: "NAAC A"
    }
];

const insertColleges = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.");

        console.log(`Inserting ${dataset.length} more design colleges...`);
        
        for (const data of dataset) {
            await College.findOneAndUpdate(
                { collegeName: data.collegeName },
                data,
                { upsert: true, returnDocument: 'after' }
            );
        }

        console.log("✅ Additional Design colleges inserted successfully.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error inserting data:", error);
        process.exit(1);
    }
};

insertColleges();
