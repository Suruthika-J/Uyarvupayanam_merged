const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const College = require("../models/College");
const Course = require("../models/Course");

const polytechnicCollegesPart2 = [
    { name: "MUTHAYAMMAL POLYTECHNIC INSTITUTION, Kakkaveri (830)", district: "Namakkal" },
    { name: "MUTHIAH POLYTECHNIC COLLEGE, ANNAMALAINAGAR (208)", district: "Cuddalore" },
    { name: "N A MANJAMMAL POLYTECHNIC COLLEGE, RAJAPALAYAM (377)", district: "Virudhunagar" },
    { name: "N P A CENTENARY POLYTECHNIC COLLEGE, Kotagiri (231)", district: "The Nilgiris" },
    { name: "N P R INST OF HOTEL MANAGEMENT AND CATERING TECHNOLOGY, PUNNAPATTI (620)", district: "Dindigul" },
    { name: "N P R POLYTECHNIC COLLEGE, PUNNAPATTI (716)", district: "Dindigul" },
    { name: "N.M. POLYTECHNIC COLLEGE, PUDUKKOTTAI (792)", district: "Pudukkottai" },
    { name: "N.V. POLYTECHNIC COLLEGE, SOMAVARAPATTI (762)", district: "Tiruppur" },
    { name: "NACHIAPPA SWAMIGAL POLYTECHNIC COLLEGE, KOVILOOR (824)", district: "Sivaganga" },
    { name: "NACHIMUTHU POLYTECHNIC COLLEGE, POLLACHI (212)", district: "Coimbatore" },
    { name: "NADAR MAHAJANA SANGAM VIMALA CHELLADURAI, SENAPATHIPALAYAM (914)", district: "Tiruppur" },
    { name: "NAGA SIVA POLYTECHNIC COLLEGE, VIRATHANOOR (593)", district: "Madurai" },
    { name: "NANDHA POLYTECHNIC COLLEGE, Veppampalayam (550)", district: "Erode" },
    { name: "NANJAPPA POLYTECHNIC COLLEGE, KARUMATHAMPATTI (319)", district: "Coimbatore" },
    { name: "NANJIAH LINGAMMAL POLYTECH COLLEGE, Chikkadasam palayam (318)", district: "Coimbatore" },
    { name: "NARASIMMA PALLAVAN POLYTECHNIC COLLEGE, THIMMA SAMUDRAM (741)", district: "Kancheepuram" },
    { name: "NATIONAL INSTITUTE OF POLYTECHNIC, Udayarpalayam (719)", district: "Ariyalur" },
    { name: "NETHAJI SUBASH CHANDRA BOSE POLYTECHNIC COLLEGE, KEELAKAVATHUKUDY (815)", district: "Tiruvarur" },
    { name: "NEW CAPE POLYTECHNIC COLLEGE, BOOTHAPANDY (828)", district: "Kanyakumari" },
    { name: "NOORUL ISLAM POLYTECHNIC COLLEGE, THIRUVITHAMCODE (357)", district: "Kanyakumari" },
    { name: "P A C RAMASAMY RAJA POLYTECHNIC COLLEGE, VENGANALLUR PANCHAYAT (226)", district: "Virudhunagar" },
    { name: "P A POLYTECHNIC COLLEGE, Pollachi (576)", district: "Coimbatore" },
    { name: "P G P POLYTECHNIC COLLEGE, Paramathi (549)", district: "Namakkal" },
    { name: "P S B POLYTECHNIC COLLEGE, THIRUPORUR (505)", district: "Kancheepuram" },
    { name: "P S G POLYTECHNIC COLLEGE, PEELAMEDU (209)", district: "Coimbatore" },
    { name: "P S N R A M POLYTECHNIC COLLEGE FOR GIRLS, Devadhanam (277)", district: "Tiruchirappalli" },
    { name: "P S R POLYTECHNIC COLLEGE, APPAYANAYAKEN PATTI (594)", district: "Virudhunagar" },
    { name: "P T LEE CHENGALVARAYA NAICKER POLYTECHNIC COLLEGE, PURASAIWALKAM (201)", district: "Chennai" },
    { name: "P V POLYTECHNIC COLLEGE, PELAKUPPAM (599)", district: "Villupuram" },
    { name: "P.S.N INSTITUTE OF TECHNOLOGY, MARUNGOOR (726)", district: "Kanyakumari" },
    { name: "P.S.N. POLYTECHNIC COLLEGE, -MELATHEDIYOOR (720)", district: "Tirunelveli" },
    { name: "PAAVAI POLYTECHNIC COLLEGE, PACHAL (533)", district: "Namakkal" },
    { name: "PAAVENDHAR POLYTECHNIC COLLEGE, MINIVIZHUNDHAN SOUTH (737)", district: "Salem" },
    { name: "PADALESUWARAR POLYTECHNIC COLLEGE, MANJAKUPPAM (534)", district: "Cuddalore" },
    { name: "PALLAVAN POLYTECHNIC COLLEGE, KOLIVAKKAM (370)", district: "Kancheepuram" },
    { name: "PANDIYAN POLYTECHNIC COLLEGE, ADHIYUR VILLAGE (312)", district: "Vellore" },
    { name: "PANIMALAR POLYTECHNIC COLLEGE, - (372)", district: "Chennai" },
    { name: "PARAMVEER POLYTECHNIC COLLEGE, PAPPARAPATTY (790)", district: "Dharmapuri" },
    { name: "PARIMALA PANDURANGAN POLYTECHNIC COLLEGE, WALAJAPET (911)", district: "Vellore" },
    { name: "PARK AMC POLYTECHNIC COLLEGE, KARUMATHAMPATTI (365)", district: "Coimbatore" },
    { name: "PAVAI VARAM POLYTECHNIC COLLEGE, PACHAL (709)", district: "Namakkal" },
    { name: "PAVENDAR BHARATHIDASAN POLYTECHNIC COLLEGE, mathur (710)", district: "Tiruchirappalli" },
    { name: "PEE GEE POLYTECHNIC COLLEGE, NO (389)", district: "Dharmapuri" },
    { name: "PERIYAR CENTENARY POLYTECHNIC COLLEGE, VALLAM (276)", district: "Thanjavur" },
    { name: "PET POLYTECHNIC COLLEGE, ACHAMPADU (772)", district: "Tirunelveli" },
    { name: "PONNAIYAH RAMAJAYAM POLYTECHNIC COLLEGE, VALLAM (570)", district: "Thanjavur" },
    { name: "POTHIGAI POLYTECHNIC COLLEGE, PERAMBALUR NORTH (878)", district: "Perambalur" },
    { name: "PRIYADARSHINI POLYTECHNIC COLLEGE, CHETTIYAPPANUR (507)", district: "Vellore" },
    { name: "PSV POLYTECHNIC COLLEGE, Mirattunilai (870)", district: "Pudukkottai" },
    { name: "R V REHA POLYTECHNIC COLLEGE, PARUVAKUDI (927)", district: "Tirunelveli" },
    { name: "SAKTHI POLYTECHNIC COLLEGE, VemapthiVellalapalayam (215)", district: "Erode" },
    { name: "SALEM KONGU POLYTECHNIC COLLEGE, VEERAPANDI (733)", district: "Salem" },
    { name: "SAMUEL POLYTECHNIC COLLEGE, MUDIVAITHANEDAL (560)", district: "Thoothukkudi" },
    { name: "SANKAR POLYTECHNIC COLLEGE, SANKARNAGAR (229)", district: "Tirunelveli" },
    { name: "SANKARA POLYTECHNIC COLLEGE, SARAVANAMPATTY (315)", district: "Coimbatore" },
    { name: "SETHU INSTITUTE OF TECHNOLOGY, PULIYAMPATTI (595)", district: "Dharmapuri" }, // Structure changed in list
    { name: "SIGA POLYTECHNIC COLLEGE, EGMORE (408)", district: "Chennai" },
    { name: "SIR ISSAC NEWTON POLYTECHNIC COLLEGE, -PAPPAKOIL (765)", district: "Nagapattinam" },
    { name: "SIVAKASI INSTITUTE OF PRINTING TECHNOLOGY, A MEENAKSHIPURAM (410)", district: "Virudhunagar" },
    { name: "SRI RAMAKRISHNA POLYTECHNIC COLLEGE, Coimbatore (211)", district: "Coimbatore" },
    { name: "SRINIVASA POLYTECHNIC COLLEGE, Kalamavur (363)", district: "Pudukkottai" },
    { name: "SSM POLYTECHNIC COLLEGE, KOMARAPALAYAM - AMANI (217)", district: "Namakkal" }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const courses = await Course.find({ category: "Polytechnic" }).limit(10);
        const courseIds = courses.map(c => c._id);

        if (courseIds.length === 0) {
            console.log("No Polytechnic courses found.");
            process.exit(1);
        }

        let createdCount = 0;
        for (const college of polytechnicCollegesPart2) {
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
                streamsOffered: ["Diploma in Engineering"]
            });
            createdCount++;
        }

        console.log(`Successfully added ${createdCount} more Polytechnic colleges.`);

    } catch (error) {
        console.error("Seeding failed:", error);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
