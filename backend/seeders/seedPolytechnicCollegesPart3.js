const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const College = require("../models/College");
const Course = require("../models/Course");

const polytechnicCollegesPart3 = [
    { name: "THE KONGHU POLYTECHNIC COLLEGE, MUKKUTHIPALAYAM (590)", district: "Salem" },
    { name: "THE NEW POLYTECHNIC COLLEGE, INAM KULATHUR (708)", district: "Tiruchirappalli" },
    { name: "THE SALEM CO OP SUGAR MILLS POLYTECHNIC COLLEGE, PETTAPALAYAM (330)", district: "Namakkal" },
    { name: "THE SALEM POLYTECHNIC COLLEGE, GAJALNAICKENPATTY (326)", district: "Salem" },
    { name: "THE SURABI COLLEGE OF POLYTECHNIC, -MARAPPANAICKENPATTY (718)", district: "Namakkal" },
    { name: "THE WINNERS POLYTECHNIC COLLEGE, Thattaravalasu (834)", district: "Tiruppur" },
    { name: "THENI KAMMAVAR SANGAM POLYTECHNIC COLLEGE, KODUVILARPATTI (714)", district: "Theni" },
    { name: "THEVANESAM ERUDHAYA AMMAL POLYTECHNIC COLLEGE, Vembar (891)", district: "Thoothukkudi" },
    { name: "THIAGARAJAR POLYTECHNIC COLLEGE, Jagir Ammapalayam - Meyyanoor (216)", district: "Salem" },
    { name: "THIRU RAMAKRISHNA NALLAMMAI POLYTECHNIC COLLEGE, NANJIYAMPALAYAM (323)", district: "Tiruppur" },
    { name: "THIRU SEVEN HILLS POLYTECHNIC COLLEGE, -MADURAVOYAL (373)", district: "Tiruvallur" },
    { name: "THIRUMAGAL POLYTECHNIC COLLEGE, VANCHUVANCERRY (918)", district: "Kancheepuram" },
    { name: "THIRUMALAI MADHANUR POLYTECHNIC COLLEGE, Palur (808)", district: "Vellore" },
    { name: "THIRUMALAI POLYTECHNIC COLLEGE, kanchipuram (829)", district: "Kancheepuram" },
    { name: "THIRUMATHI ELIZABETH POLYTECHNIC COLLEGE, ANNAMANGALAM (369)", district: "Perambalur" },
    { name: "THIRUTHANI POLYTECHNIC COLLEGE, LAKSHMAPURAM (556)", district: "Tiruvallur" },
    { name: "THIRUVALLUVAR POLYTECHNIC COLLEGE, Vellamadai (763)", district: "Coimbatore" },
    { name: "THIRUVALLUVAR POLYTECHNIC COLLEGE, SOOLAPPURAM (759)", district: "Madurai" },
    { name: "TIRUMALA POLYTECHNIC COLLEGE, Nallan pillai petrai village (865)", district: "Tiruvannamalai" },
    { name: "TIRUPATTUR POLYTECHNIC COLLEGE, -PACHAL (527)", district: "Vellore" },
    { name: "U.S.P. POLYTECHNIC COLLEGE, KODIKURICHI (822)", district: "Tirunelveli" },
    { name: "UDAYA INSTITUTE OF TECHNOLOGY, Neendakarai - B (774)", district: "Kanyakumari" },
    { name: "UDAYA POLYTECHNIC COLLEGE, Neendakarai B (568)", district: "Kanyakumari" },
    { name: "UDHAYAM POLYTECHNIC COLLEGE, Thangachimadam (722)", district: "Ramanathapuram" },
    { name: "UNION CHRISTIAN POLYTECHNIC COLLEGE, EDAICODE (775)", district: "Kanyakumari" },
    { name: "V J P CATERING AND HOTEL MANAGEMENT, -Siruganur (606)", district: "Tiruchirappalli" },
    { name: "V K P POLYTECHNIC COLLEGE, Chockampatti (857)", district: "Tirunelveli" },
    { name: "V RAMAKRISHNA POLYTECHNIC COLLEGE, Thiruvottiyur (301)", district: "Tiruvallur" },
    { name: "V S V NADAR POLYTECHNIC COLLEGE, ROSLAPATI (225)", district: "Virudhunagar" },
    { name: "V.I.P. POLYTECHNIC COLLEGE, MANNACHANALLUR (825)", district: "Tiruchirappalli" },
    { name: "VAANI POLYTECHNIC COLLEGE, Bethakkallupalli (876)", district: "Vellore" },
    { name: "VAIRAMANI RAMASAMY POLYTECHNIC COLLEGE, THAMBIKKOTTAI (787)", district: "Thanjavur" },
    { name: "VALIVALAM DESIKAR POLYTECHNIC COLLEGE, NAGAPATTINAM (219)", district: "Nagapattinam" },
    { name: "VALLIAMMAI POLYTECHNIC COLLEGE, KATTANKULATHUR (307)", district: "Kancheepuram" },
    { name: "VANDAVASI POLYTECHNIC COLLEGE, CHENNAVARAM (903)", district: "Tiruvannamalai" },
    { name: "VANDAYAR POLYTECHNIC COLLEGE, PULAVARNATHAM (571)", district: "Thanjavur" },
    { name: "VARADHARAJAN POLYTECHNIC COLLEGE, VARISAIPATTI (907)", district: "Perambalur" },
    { name: "VEL TECH, Morai (557)", district: "Tiruvallur" },
    { name: "VELLORE POLYTECHNIC COLLEGE, Latteri (872)", district: "Vellore" },
    { name: "VELUDAIYAR POLYTECHNIC COLLEGE, AMMAIYAPPAN (933)", district: "Tiruvarur" },
    { name: "VENKATARAMANA POLYTECHNIC COLLEGE, velliyanai (892)", district: "Karur" },
    { name: "VENKATESWARA POLYTECHNIC COLLEGE, kaikkurichi (516)", district: "Pudukkottai" },
    { name: "VETHATHIRI MAHARISHI INSTITUTE OF TECHNOLOGY, Kodivalasal Athiman jeri Pet (806)", district: "Tiruvallur" },
    { name: "VETRI VINAYAHA POLYTECHNIC COLLEGE, THOTTIAM (701)", district: "Tiruchirappalli" },
    { name: "VICKRAM POLYTECHNIC COLLEGE, Enathi (777)", district: "Sivaganga" },
    { name: "VIGNESH POLYTECHNIC COLLEGE, Kizhkachirapet (384)", district: "Tiruvannamalai" },
    { name: "VIGNESHWARA POLYTECHNIC COLLEGE, Keezhpoovanikuppam (794)", district: "Cuddalore" },
    { name: "VIVEKANANDA POLYTECHNIC COLLEGE, Kummangudi (768)", district: "Sivaganga" },
    { name: "VIVEKANANDA POLYTECHNIC COLLEGE, Agasteeswaram (866)", district: "Kanyakumari" },
    { name: "VIVEKANANDA POLYTECHNIC COLLEGE, KAMMAPURAM (545)", district: "Cuddalore" },
    { name: "VOICE OF GOD POLYTECHNIC COLLEGE, DEVARAYAPURAM (739)", district: "Namakkal" }
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
        for (const college of polytechnicCollegesPart3) {
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

        console.log(`Successfully added ${createdCount} more Polytechnic colleges (Final Batch).`);

    } catch (error) {
        console.error("Seeding failed:", error);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
