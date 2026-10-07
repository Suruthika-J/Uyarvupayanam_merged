const mongoose = require("mongoose");

const teammateListingSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    creatorName: {
      type: String,
      required: true,
      trim: true
    },
    creatorDepartment: {
      type: String,
      default: ""
    },
    creatorYear: {
      type: String,
      default: ""
    },
    creatorCollege: {
      type: String,
      default: ""
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    category: {
      type: String,
      enum: [
        "hackathon",
        "mini_project",
        "final_year_project",
        "symposium",
        "paper_presentation",
        "ideathon"
      ],
      default: "hackathon"
    },
    eventName: {
      type: String,
      required: true,
      trim: true,
      default: "Smart India Hackathon (SIH)"
    },
    domain: {
      type: String,
      enum: [
        "AI / ML & Data Science",
        "IoT & Embedded Systems",
        "Web & Full Stack Development",
        "Robotics & Mechatronics",
        "Core Hardware & VLSI",
        "Cybersecurity & Cloud",
        "App Development (Flutter/React Native)",
        "Blockchain & Web3",
        "Open Innovation"
      ],
      default: "AI / ML & Data Science"
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000
    },
    problemStatement: {
      type: String,
      trim: true,
      default: ""
    },
    skillsLookingFor: [
      {
        type: String,
        trim: true
      }
    ],
    teamSizeMax: {
      type: Number,
      required: true,
      min: 2,
      max: 6,
      default: 4
    },
    members: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true },
        department: { type: String, default: "" },
        role: { type: String, default: "Team Member" },
        joinedAt: { type: Date, default: Date.now }
      }
    ],
    joinRequests: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true },
        email: { type: String, default: "" },
        department: { type: String, default: "" },
        year: { type: String, default: "" },
        skills: [{ type: String }],
        message: { type: String, trim: true, default: "" },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending"
        },
        requestedAt: { type: Date, default: Date.now }
      }
    ],
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PeerConversation",
      default: null
    },
    status: {
      type: String,
      enum: ["open", "team_full", "completed", "closed"],
      default: "open",
      index: true
    },
    deadline: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

teammateListingSchema.index({ domain: 1, category: 1, status: 1 });
teammateListingSchema.index({ title: "text", description: "text", eventName: "text" });

module.exports = mongoose.model("TeammateListing", teammateListingSchema);
