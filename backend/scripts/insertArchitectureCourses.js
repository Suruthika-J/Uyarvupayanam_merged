const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });
const Course = require('../models/Course');

const architectureCourses = [
  {
    courseName: "Bachelor of Architecture (B.Arch)",
    category: "Architecture",
    duration: "5 Years",
    eligibility: "12th Pass with Maths (Min 50%) + NATA/JEE Paper 2",
    level: "after12th",
    shortDescription: "A comprehensive professional degree in architecture covering design, construction, and planning.",
    careerOptions: ["Architect", "Interior Designer", "Urban Planner", "Project Manager"]
  },
  {
    courseName: "B.Arch in Interior Design",
    category: "Architecture",
    duration: "5 Years",
    eligibility: "12th Pass with Maths + NATA",
    level: "after12th",
    shortDescription: "Specialized architectural degree focusing on interior spaces, aesthetics, and functional design.",
    careerOptions: ["Interior Architect", "Space Planner", "Furniture Designer"]
  },
  {
    courseName: "B.Arch in Urban Planning",
    category: "Architecture",
    duration: "5 Years",
    eligibility: "12th Pass with Maths + NATA",
    level: "after12th",
    shortDescription: "Focuses on the design and regulation of uses of space that focus on the physical form, economic functions, and social impacts of the urban environment.",
    careerOptions: ["Urban Planner", "City Designer", "Transportation Planner"]
  },
  {
    courseName: "Diploma in Architecture",
    category: "Architecture",
    duration: "3 Years",
    eligibility: "10th Pass",
    level: "diploma",
    shortDescription: "Entry-level technical course in architectural drafting and construction basics.",
    careerOptions: ["Draftsman", "Site Supervisor", "Junior Architect"]
  },
  {
    courseName: "M.Arch (Urban Design)",
    category: "Architecture",
    duration: "2 Years",
    eligibility: "B.Arch Pass",
    level: "after12th", // Note: the system uses level for target, might need adjustment but keeping consistent with existing after12th/after10th/diploma logic
    shortDescription: "Advanced study in the design of urban environments and city structures.",
    careerOptions: ["Urban Designer", "Policy Maker", "Consultant"]
  }
];

async function insertCourses() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/uyarvu-payanam');
    console.log('Connected to MongoDB');

    for (const courseData of architectureCourses) {
      let course = await Course.findOne({ courseName: courseData.courseName });
      if (course) {
        Object.assign(course, courseData);
      } else {
        course = new Course(courseData);
      }
      await course.save();
    }

    console.log('Successfully inserted common Architecture courses');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error inserting courses:', err);
    process.exit(1);
  }
}

insertCourses();
