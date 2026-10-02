const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/uyarvu_payanam";

const User = require("../models/User");
const CollegeStudentProfile = require("../models/CollegeStudentProfile");

const samplePeers = [
  {
    name: "Kavya Subramanian",
    email: "kavya.ai@nec.edu.in",
    password: "password123",
    institution: "National Engineering College, Kovilpatti",
    degreeProgramme: "B.E. (Bachelor of Engineering)",
    field: "engineering",
    domain: "Artificial Intelligence & Machine Learning",
    specialization: "Artificial Intelligence & Machine Learning",
    targetCareer: "Artificial Intelligence & Machine Learning",
    currentYear: "4th Year",
    currentSemester: "Semester 7",
    cgpa: "8.95",
    skills: ["Python", "PyTorch", "Computer Vision", "Scikit-Learn", "OpenCV"],
    careerObjective: "Passionate AI undergraduate researching computer vision algorithms and deep learning models."
  },
  {
    name: "Rahul Venkatesh",
    email: "rahul.ml@nec.edu.in",
    password: "password123",
    institution: "National Engineering College, Kovilpatti",
    degreeProgramme: "B.E. (Bachelor of Engineering)",
    field: "engineering",
    domain: "Artificial Intelligence & Machine Learning",
    specialization: "Artificial Intelligence & Machine Learning",
    targetCareer: "Artificial Intelligence & Machine Learning",
    currentYear: "3rd Year",
    currentSemester: "Semester 5",
    cgpa: "8.60",
    skills: ["Python", "TensorFlow", "NLP", "Deep Learning", "SQL", "Pandas"],
    careerObjective: "Building natural language processing tools and predictive machine learning applications."
  },
  {
    name: "Priya Dharshini M",
    email: "priya.cyber@nec.edu.in",
    password: "password123",
    institution: "National Engineering College, Kovilpatti",
    degreeProgramme: "B.E. (Bachelor of Engineering)",
    field: "engineering",
    domain: "Cyber Security & Information Assurance",
    specialization: "Cyber Security & Information Assurance",
    targetCareer: "Cyber Security & Information Assurance",
    currentYear: "4th Year",
    currentSemester: "Semester 7",
    cgpa: "8.75",
    skills: ["Ethical Hacking", "Network Security", "Wireshark", "Cryptography", "Linux"],
    careerObjective: "Aspiring cybersecurity analyst specializing in penetration testing and threat intelligence."
  },
  {
    name: "Karthik Raja S",
    email: "karthik.dev@nec.edu.in",
    password: "password123",
    institution: "National Engineering College, Kovilpatti",
    degreeProgramme: "B.E. (Bachelor of Engineering)",
    field: "engineering",
    domain: "Full Stack Web Development",
    specialization: "Full Stack Web Development",
    targetCareer: "Full Stack Web Development",
    currentYear: "3rd Year",
    currentSemester: "Semester 5",
    cgpa: "8.40",
    skills: ["React.js", "Node.js", "Express.js", "MongoDB", "JavaScript", "Tailwind CSS"],
    careerObjective: "Full stack developer interested in modern web application architectures and cloud deployments."
  },
  {
    name: "Ananya N",
    email: "ananya.ds@annauniv.edu.in",
    password: "password123",
    institution: "Anna University, Chennai",
    degreeProgramme: "B.Tech (Bachelor of Technology)",
    field: "engineering",
    domain: "Artificial Intelligence & Machine Learning",
    specialization: "Artificial Intelligence & Machine Learning",
    targetCareer: "Artificial Intelligence & Machine Learning",
    currentYear: "4th Year",
    currentSemester: "Semester 7",
    cgpa: "9.10",
    skills: ["Python", "Data Science", "SQL", "Tableau", "Machine Learning", "R"],
    careerObjective: "Data science enthusiast focused on statistical modeling and business analytics."
  },
  {
    name: "Siddharth Kumar",
    email: "siddharth.cloud@nec.edu.in",
    password: "password123",
    institution: "National Engineering College, Kovilpatti",
    degreeProgramme: "B.E. (Bachelor of Engineering)",
    field: "engineering",
    domain: "Cloud Computing & DevOps",
    specialization: "Cloud Computing & DevOps",
    targetCareer: "Cloud Computing & DevOps",
    currentYear: "3rd Year",
    currentSemester: "Semester 6",
    cgpa: "8.25",
    skills: ["AWS", "Docker", "Kubernetes", "Linux", "CI/CD Pipelines", "Terraform"],
    careerObjective: "Cloud practitioner passionate about containerization, infrastructure as code, and DevOps automation."
  }
];

async function seedPeerStudents() {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB:", mongoUri);

    for (const peer of samplePeers) {
      let user = await User.findOne({ email: peer.email });
      if (!user) {
        user = new User({
          name: peer.name,
          email: peer.email,
          password: peer.password,
          role: "student",
          userType: "college_student",
          status: "active",
          onboardingCompleted: true,
          isVerified: true
        });
        await user.save();
        console.log(`Created peer user: ${peer.name} (${peer.email})`);
      }

      let profile = await CollegeStudentProfile.findOne({ userId: user._id });
      if (!profile) {
        profile = new CollegeStudentProfile({
          userId: user._id,
          firstName: peer.name.split(" ")[0],
          lastName: peer.name.split(" ").slice(1).join(" "),
          institution: peer.institution,
          degreeProgramme: peer.degreeProgramme,
          field: peer.field,
          domain: peer.domain,
          specialization: peer.specialization,
          targetCareer: peer.targetCareer,
          currentYear: peer.currentYear,
          currentSemester: peer.currentSemester,
          cgpa: peer.cgpa,
          skills: peer.skills,
          careerObjective: peer.careerObjective,
          isCompleted: true
        });
        await profile.save();
        console.log(`Created profile for: ${peer.name}`);
      } else {
        profile.domain = peer.domain;
        profile.specialization = peer.specialization;
        profile.targetCareer = peer.targetCareer;
        profile.institution = peer.institution;
        profile.currentYear = peer.currentYear;
        profile.skills = peer.skills;
        await profile.save();
        console.log(`Updated profile for: ${peer.name}`);
      }
    }

    console.log("✓ Peer students successfully seeded in MongoDB!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding peer students:", error);
    process.exit(1);
  }
}

seedPeerStudents();
