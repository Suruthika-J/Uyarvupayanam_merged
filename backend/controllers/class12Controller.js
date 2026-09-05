const Course = require("../models/Course");
const College = require("../models/College");

/**
 * Normalization Mapping Rule:
 * Architecture -> Engineering
 * IT & Computer -> Engineering
 * Arts / Commerce / Science / Design / Media & Journalism -> Arts & Science
 * Hotel Management -> Others
 * ITI -> Polytechnic
 * Agriculture -> Agriculture
 * Medical -> Medical
 * Law -> Law
 * Polytechnic -> Polytechnic
 */
const CATEGORY_MAP = {
  // Parent mapping (Raw Category -> Master Category)
  "Engineering": "Engineering",
  "Medical": "Medical",
  "Arts": "Arts & Science",
  "Science": "Arts & Science",
  "Arts & Science": "Arts & Science",
  "Law": "Law",
  "Commerce": "Commerce",
  "Management": "Management",
  "IT & Computer": "IT & Computer",
  "Agriculture": "Agriculture",
  "Architecture": "Architecture",
  "Design": "Design",
  "Hotel Management": "Hotel Management",
  "ITI": "ITI",
  "Polytechnic": "Polytechnic",
  "Media & Journalism": "Media & Journalism",
  "Certificate": "Others",
  "Others": "Others"
};

const MASTER_CATEGORIES = [
  "Engineering",
  "Medical",
  "Arts & Science",
  "Law",
  "Commerce",
  "Management",
  "IT & Computer",
  "Agriculture",
  "Architecture",
  "Design",
  "Hotel Management",
  "ITI",
  "Polytechnic",
  "Media & Journalism",
  "Others"
];

exports.getClass12Categories = async (req, res) => {
  try {
    const { level } = req.query;

    // Course model stores level as: "after12th", "after10th", "diploma"
    // Support both old ("After 12th") and new ("after12th") formats
    let targetLevels;
    if (level === "10") {
      targetLevels = ["after10th", "After 10th", "diploma", "Diploma"];
    } else {
      targetLevels = ["after12th", "After 12th", "diploma", "Diploma"];
    }

    const courses = await Course.find({
      level: { $in: targetLevels }
    }).select("category").lean();

    const colleges = await College.find().select("stream").lean();

    const stats = MASTER_CATEGORIES.map(cat => {
      const courseCount = courses.filter(c => CATEGORY_MAP[c.category] === cat).length;
      const collegeCount = colleges.filter(clg => clg.stream === cat).length;
      return { categoryName: cat, courseCount, collegeCount };
    });

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error("getClass12Categories error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getClass12Content = async (req, res) => {
  try {
    const { category, search, level } = req.query;

    // Course model stores level as: "after12th", "after10th", "diploma"
    // Support both old ("After 12th") and new ("after12th") formats
    let targetLevels;
    if (level === "10") {
      targetLevels = ["after10th", "After 10th", "diploma", "Diploma"];
    } else {
      targetLevels = ["after12th", "After 12th", "diploma", "Diploma"];
    }

    let courseQuery = { level: { $in: targetLevels } };
    let collegeQuery = {};

    if (search) {
      courseQuery.$or = [
        { courseName: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } }
      ];
      collegeQuery.$or = [
        { collegeName: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { district: { $regex: search, $options: "i" } }
      ];
    }

    // If specific category requested, filter server-side for performance
    if (category) {
      // Map category name back to DB values
      const matchingCats = Object.entries(CATEGORY_MAP)
        .filter(([, v]) => v.toLowerCase() === category.toLowerCase())
        .map(([k]) => k);
      if (matchingCats.length > 0) courseQuery.category = { $in: matchingCats };
      collegeQuery.stream = category;
    }

    const [allCourses, allColleges] = await Promise.all([
      Course.find(courseQuery)
        .select("courseName level category duration sourceName slug status isPublished")
        .lean(),
      College.find(collegeQuery)
        .select("collegeName stream district location website collegeCode")
        .lean()
    ]);

    if (category) {
      // Return single category result
      const catCourses = allCourses.filter(c => CATEGORY_MAP[c.category] === category);
      const catColleges = allColleges; // already filtered by stream
      return res.json({
        success: true,
        data: {
          categoryName: category,
          courseCount: catCourses.length,
          collegeCount: catColleges.length,
          courses: catCourses,
          colleges: catColleges
        }
      });
    }

    const result = MASTER_CATEGORIES.map(cat => {
      const catCourses = allCourses.filter(c => CATEGORY_MAP[c.category] === cat);
      const catColleges = allColleges.filter(clg => clg.stream === cat);
      return {
        categoryName: cat,
        courseCount: catCourses.length,
        collegeCount: catColleges.length,
        courses: catCourses,
        colleges: catColleges
      };
    });

    res.json({ success: true, data: result });
  } catch (error) {
    console.error("getClass12Content error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
