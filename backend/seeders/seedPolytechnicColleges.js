const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const College = require("../models/College");
const Course = require("../models/Course");

const polytechnicColleges = [
    { name: "A M K TECHNOLOGICAL POLYTECHNIC COLLEGE, SEMBARAMBAKKAM (205)", district: "Tiruvallur" },
    { name: "A R J POLYTECHNIC COLLEGE, EDAYARNATHAM (587)", district: "Tiruvarur" },
    { name: "A. D. J. DHARMAMBAL POLYTECHNIC COLLEGE, NAGAPATTINAM (280)", district: "Nagapattinam" },
    { name: "A.K.T. MEMORIAL POLYTECHNIC COLLEGE, KALLKURICHI (749)", district: "Villupuram" },
    { name: "A.V.C. POLYTECHNIC COLLEGE, MANNAMPANDAL (332)", district: "Nagapattinam" },
    { name: "AALIM MUHAMMED SALEGH POLYTECHNIC COLLEGE, Avadi (514)", district: "Tiruvallur" },
    { name: "AAROORAN POLYTECHNIC COLLEGE, Surrakudi (702)", district: "Tiruvarur" },
    { name: "ACHARYA POLYTECHNIC COLLEGE, -VELLARIVELLI (818)", district: "Salem" },
    { name: "ADHIPARASAKTHI POLYTECHNIC COLLEGE, Melmaruvathur (304)", district: "Kancheepuram" },
    { name: "ADHITHYA POLYTECHNIC COLLEGE, Pullagoundampatti (838)", district: "Salem" },
    { name: "ADHIYAMAAN POLYTECHNIC COLLEGE, Dr M G R NAGAR HOSUR (382)", district: "Krishnagiri" },
    { name: "ADI PARASAKTHI POLYTECHNIC COLLEGE, ERUMIYAMPATTI VILLAGE (778)", district: "Dharmapuri" },
    { name: "AISHWARYA POLYTECHNIC COLLEGE, PARUVACHI (803)", district: "Erode" },
    { name: "AL AMEEN POLYTECHNIC COLLEGE, ERODE (324)", district: "Erode" },
    { name: "AL ISLAMIYA POLYTECHNIC COLLEGE, PENNAGARAM (856)", district: "Dharmapuri" },
    { name: "ALAGAPPA POLYTECHNIC COLLEGE, -KARAIKUDI (117)", district: "Sivaganga" },
    { name: "AMMA POLYTECHNIC COLLEGE, villangadu (852)", district: "Tiruvarur" },
    { name: "AMMAI APPAA POLYTECHNIC COLLEGE, Phazavoor part II (771)", district: "Tirunelveli" },
    { name: "AMMAIAPPAR POLYTECHNIC COLLEGE, PUTHUR (928)", district: "Virudhunagar" },
    { name: "ANGEL POLYTECHNIC COLLEGE, SOUTH VENGANALLUR (894)", district: "Virudhunagar" },
    { name: "ANNAI COLLEGE OF POLYTECHNIC KOVILACHERI., Kovilacheri (758)", district: "Thanjavur" },
    { name: "ANNAI FATHIMA INSTITUTE OF HOTEL MANAGEMENT, ALAMPATTI (614)", district: "Madurai" },
    { name: "ANNAI J K K SAMPOORANIAMMAL POLYTECHNIC COLLEGE, GOBICHETTIPALAYAM (325)", district: "Erode" },
    { name: "ANNAI MADHA POLYTECHNIC COLLEGE, TITTAGUDI (814)", district: "Cuddalore" },
    { name: "ANNAI TERASA POLYTECHNIC COLLEGE, VEERAPATTI (751)", district: "Pudukkottai" },
    { name: "ANNAI VELANKANNI POLYTECHNIC COLLEGE, ANGUCHETTYPALAYAM (371)", district: "Cuddalore" },
    { name: "ANNAMALAI POLYTECHNIC COLLEGE, CHETTINAD (224)", district: "Sivaganga" },
    { name: "ANNDAVAR POLYTECHNIC COLLEGE, Alukkuli (539)", district: "Erode" },
    { name: "APOLLO POLYTECHNIC COLLEGE, -Panruti Village (572)", district: "Kancheepuram" },
    { name: "APOLLO SUBBULAKSHMI POLYTECHNIC COLLEGE, Kunnathur (835)", district: "Pudukkottai" },
    { name: "ARASAN GANESAN POLYTECHNIC COLLEGE, AMATHUR (228)", district: "Virudhunagar" },
    { name: "ARAVINDAR POLYTECHNIC COLLEGE, AMBATHURAI (585)", district: "Dindigul" },
    { name: "ARIES POLYTECHNIC COLLEGE, Kurunjipadi (548)", district: "Cuddalore" },
    { name: "ARULMIGU KALASALINGAM POLYTECHNIC COLLEGE, NATHAMPATI (347)", district: "Virudhunagar" },
    { name: "ARULMIGU KALLALAGAR POLYTECHNIC COLLEGE, ATTUKKULAM (344)", district: "Madurai" },
    { name: "ARULMIGU PALANIANDAVAR POLYTECHNIC COLLEGE, Palani- (222)", district: "Dindigul" },
    { name: "ARULMIGU SENTHILANDAVAR POLYTECHNIC COLLEGE, TENKASI (366)", district: "Tirunelveli" },
    { name: "ARULMIGU THIRUPURASUNDARI AMMAN POLYTECHNIC COLLEGE, EGAI (305)", district: "Kancheepuram" },
    { name: "ARULMURUGAN POLYTECHNIC COLLEGE, THENNILAI WEST (588)", district: "Karur" },
    { name: "ASAN MEMORIAL INSTITUTE OF HOTEL MANAGEMENT AND CATERING TEC, JALADAMPET (607)", district: "Kancheepuram" },
    { name: "AYYA NADAR JANAKI AMMAL POLYTECHNIC COLLEGE, Chinnakkamanpatti (279)", district: "Virudhunagar" },
    { name: "AYYAPPA POLYTECHNIC COLLEGE, AIVADHUGUDI (750)", district: "Cuddalore" },
    { name: "BAKTHAVATCHALAM POLY. COLLEGE, KARAIPETTAI (204)", district: "Kancheepuram" },
    { name: "BARATHIAR CENTENARYMEMORIAL WOMENS POLYTECH COLLEGE, -Ettayapuram (178)", district: "Thoothukkudi" },
    { name: "BHARATH INSTITUTE OF CATERING TECHNOLOGY AND HOTEL MANAGEMEN, THANJAVUR (618)", district: "Thanjavur" },
    { name: "BHARATH NIKETAN POLYTECHNIC COLLEGE, THIMMARASANAICKANOOR (860)", district: "Theni" },
    { name: "BHARATH POLYTECHNIC COLLEGE, Koothampoondi (552)", district: "Namakkal" },
    { name: "BHARATH POLYTECHNIC COLLEGE, THIRVANCHERRY (383)", district: "Kancheepuram" },
    { name: "BHAVANI POLYTECHNIC COLLEGE, VARADHANALLUR (728)", district: "Erode" },
    { name: "BWDA POLYTECHNIC COLLEGE, Ponmanai (823)", district: "Kanyakumari" }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Fetch some Polytechnic courses to link
        const courses = await Course.find({ category: "Polytechnic" }).limit(10);
        const courseIds = courses.map(c => c._id);

        if (courseIds.length === 0) {
            console.log("No Polytechnic courses found. Please ensure courses are seeded first.");
            process.exit(1);
        }

        let createdCount = 0;
        for (const college of polytechnicColleges) {
            // Check if already exists
            const existing = await College.findOne({ collegeName: college.name });
            if (existing) continue;

            await College.create({
                collegeName: college.name,
                stream: "Polytechnic",
                category: "Polytechnic",
                type: "Polytechnic College",
                district: college.district,
                location: college.district,
                state: "Tamil Nadu",
                coursesOffered: courseIds,
                streamsOffered: ["Diploma in Engineering", "Diploma in Technology"]
            });
            createdCount++;
        }

        console.log(`Successfully added ${createdCount} Polytechnic colleges.`);

    } catch (error) {
        console.error("Seeding failed:", error);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
