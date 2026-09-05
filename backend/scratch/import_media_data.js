const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load models
const Course = require('../models/Course');
const College = require('../models/College');

dotenv.config({ path: path.join(__dirname, '../.env') });

const data = [
  { college: "PSG College of Arts and Science, Coimbatore", course: "M.Sc Electronic Media Self Finance" },
  { college: "Meenakshi Ramaswamy Arts and Science College, Ariyalur", course: "Diploma in Journalism" },
  { college: "Rajapalayam Rajus College, Rajapalayam", course: "Diploma in Journalism" },
  { college: "Vivekanandha College for Women (VCW), Tiruchengode", course: "M.A in Journalism" },
  { college: "Shrimathi Devkunvar Nanalal Bhatt Vaishnav College for Women, Chennai", course: "MA Journalism and Communication Self Financed" },
  { college: "MOP Vaishnav College for Women, Chennai", course: "MA Media Management" },
  { college: "DG Vaishnav College (DGVC), Chennai", course: "MA Journalism Self Financing" },
  { college: "Shri Shankarlal Sundarbai Shasun Jain College for Women, Chennai", course: "MA Journalism and Communication" },
  { college: "Mahendra Arts and Science College, Namakkal", course: "BA Journalism and Mass Communication" },
  { college: "Amrita School of Communication, Amritanagar", course: "PGD Journalism" },
  { college: "Manonmaniam Sundaranar University, Tirunelveli", course: "M.Sc Electronic Media Integrated" },
  { college: "National College, Tiruchirappalli", course: "Diploma in Journalism and Editing" },
  { college: "Ethiraj College for Women, Chennai", course: "MA Journalism and Communication Self Financed" },
  { college: "Centre for Distance Education, Bharathidasan University, Tiruchirappalli", course: "MA Journalism and Mass Communication" },
  { college: "Madras Christian College, Chennai", course: "BA Journalism Self Financed" },
  { college: "Madurai Kamaraj University, Madurai", course: "M.Sc Film and Electronic Media Studies" },
  { college: "Alagappa University, Karaikudi", course: "MJMC" },
  { college: "SRM Institute of Science and Technology, Chennai", course: "MA Journalism and Mass Communication" },
  { college: "Bharathiar University, Coimbatore", course: "MJMC" },
  { college: "Mar Gregorios College of Arts and Science, Chennai", course: "BA Journalism II Shift" }
];

async function run() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error("MONGO_URI not found");
    
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    for (const item of data) {
      // 1. Create or Find Course
      let course = await Course.findOne({ courseName: item.course });
      if (!course) {
        course = await Course.create({
          courseName: item.course,
          category: "Media & Journalism",
          level: "after12th",
          duration: item.course.toLowerCase().includes("m.") || item.course.toLowerCase().includes("ma ") || item.course.toLowerCase().includes("mjmc") ? "2 Years" : "3 Years",
          eligibility: item.course.toLowerCase().includes("m.") || item.course.toLowerCase().includes("ma ") || item.course.toLowerCase().includes("mjmc") ? "Any Graduation" : "12th Pass",
          shortDescription: `${item.course} program in Media & Journalism.`
        });
        console.log(`Created course: ${course.courseName}`);
      }

      // 2. Create or Find College
      let collegeName = item.college.split(',')[0].trim();
      let location = item.college.split(',')[1] ? item.college.split(',')[1].trim() : "";
      
      let college = await College.findOne({ collegeName: { $regex: new RegExp(`^${collegeName}$`, 'i') } });
      
      if (!college) {
        college = await College.create({
          collegeName: collegeName,
          location: location,
          district: location,
          stream: "Arts & Science",
          streamsOffered: ["Arts & Science", "Media & Journalism"],
          coursesOffered: [course._id]
        });
        console.log(`Created college: ${college.collegeName}`);
      } else {
        // Update streams and courses
        if (!college.streamsOffered) college.streamsOffered = [];
        if (!college.streamsOffered.includes("Media & Journalism")) {
          college.streamsOffered.push("Media & Journalism");
        }
        
        if (!college.coursesOffered) college.coursesOffered = [];
        if (!college.coursesOffered.includes(course._id)) {
          college.coursesOffered.push(course._id);
        }
        
        await college.save();
        console.log(`Updated college: ${college.collegeName}`);
      }
    }

    console.log("Bulk import completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Import error:", err);
    process.exit(1);
  }
}

run();
