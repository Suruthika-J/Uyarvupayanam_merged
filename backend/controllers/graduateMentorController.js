const GraduateMentorProfile = require("../models/GraduateMentorProfile");
const GraduateMentorRelationship = require("../models/GraduateMentorRelationship");
const MentorRequest = require("../models/MentorRequest");
const { PeerConversation, PeerMessage } = require("../models/PeerChat");
const Notification = require("../models/Notification");
const User = require("../models/User");

// ── GET /api/graduate/mentor/requests ─────────────────────────────────────────
exports.getIncomingMentorRequests = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    // Fetch pending requests from MentorRequest collection or GraduateMentorRelationship
    const relationships = await GraduateMentorRelationship.find({
      mentorId: userId,
      status: "PENDING"
    }).sort({ createdAt: -1 }).lean();

    // If no specific assigned relationships, fetch general pending mentor requests from students
    let generalRequests = [];
    if (relationships.length === 0) {
      generalRequests = await MentorRequest.find({
        status: { $in: ["Pending", "In Progress"] }
      }).sort({ createdAt: -1 }).limit(10).lean();
    }

    const requests = [
      ...relationships.map(r => ({
        _id: r._id,
        relationshipId: r._id,
        studentId: r.studentId,
        studentName: r.studentName,
        classLevel: r.studentDegree || "B.E. CSE — Final Year",
        interest: r.interest || "Software Engineering & Career Guidance",
        message: r.message,
        createdAt: r.createdAt,
        type: "direct"
      })),
      ...generalRequests.map(g => ({
        _id: g._id,
        studentId: g.userId,
        studentName: g.studentName,
        classLevel: g.classLevel || "College Student",
        interest: g.interest || "Career Guidance",
        message: g.message,
        createdAt: g.createdAt,
        type: "general"
      }))
    ];

    res.status(200).json({ success: true, requests });
  } catch (error) {
    console.error("Get incoming mentor requests error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch mentor requests" });
  }
};

// ── POST /api/graduate/mentor/requests/:id/accept ─────────────────────────────
exports.acceptMentorRequest = async (req, res) => {
  try {
    const mentorId = req.student?._id || req.user?._id || req.student?.id;
    const { id } = req.params;

    let relationship = await GraduateMentorRelationship.findById(id);

    if (!relationship) {
      // Create from general MentorRequest if id corresponds to MentorRequest
      const mentorReq = await MentorRequest.findById(id);
      if (mentorReq) {
        let studentUser = null;
        if (mentorReq.userId) {
          studentUser = await User.findById(mentorReq.userId);
        }

        // Create PeerConversation between mentor and student
        let conversation = null;
        if (studentUser) {
          conversation = await PeerConversation.findOne({
            participants: { $all: [mentorId, studentUser._id] }
          });
          if (!conversation) {
            conversation = new PeerConversation({
              participants: [mentorId, studentUser._id],
              lastMessage: "Mentor request accepted! Let's start guiding your career journey."
            });
            await conversation.save();
          }
        }

        relationship = new GraduateMentorRelationship({
          studentId: mentorReq.userId || mentorId,
          mentorId,
          requestId: mentorReq._id,
          studentName: mentorReq.studentName,
          studentDegree: mentorReq.classLevel,
          interest: mentorReq.interest,
          message: mentorReq.message,
          status: "ACTIVE",
          conversationId: conversation?._id,
          acceptedAt: new Date()
        });
        await relationship.save();

        // Update original MentorRequest
        mentorReq.status = "In Progress";
        mentorReq.assignedMentor = req.student?.name || "Graduate Mentor";
        await mentorReq.save();
      } else {
        return res.status(404).json({ success: false, message: "Mentor request not found" });
      }
    } else {
      relationship.status = "ACTIVE";
      relationship.acceptedAt = new Date();

      // Create conversation if not present
      if (!relationship.conversationId) {
        const conversation = new PeerConversation({
          participants: [mentorId, relationship.studentId],
          lastMessage: "Mentor request accepted!"
        });
        await conversation.save();
        relationship.conversationId = conversation._id;
      }
      await relationship.save();
    }

    // Send Notification to Student
    const mentorUser = await User.findById(mentorId);
    await Notification.create({
      userId: relationship.studentId,
      title: "Mentorship Request Accepted! 🎓",
      message: `${mentorUser?.name || "Your Graduate Mentor"} accepted your mentorship request. Click to open live chat!`,
      type: "counselling",
      targetLevel: "All",
      sentByAdmin: false
    });

    res.status(200).json({
      success: true,
      message: "Mentorship request accepted successfully!",
      relationship
    });
  } catch (error) {
    console.error("Accept mentor request error:", error);
    res.status(500).json({ success: false, message: "Failed to accept mentor request" });
  }
};

// ── POST /api/graduate/mentor/requests/:id/reject ─────────────────────────────
exports.rejectMentorRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const relationship = await GraduateMentorRelationship.findById(id);
    if (relationship) {
      relationship.status = "REJECTED";
      await relationship.save();
    } else {
      await MentorRequest.findByIdAndUpdate(id, { status: "Rejected" });
    }

    res.status(200).json({ success: true, message: "Mentor request declined" });
  } catch (error) {
    console.error("Reject mentor request error:", error);
    res.status(500).json({ success: false, message: "Failed to decline mentor request" });
  }
};

// ── GET /api/graduate/mentor/mentees ──────────────────────────────────────────
exports.getActiveMentees = async (req, res) => {
  try {
    const mentorId = req.student?._id || req.user?._id || req.student?.id;
    if (!mentorId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const mentees = await GraduateMentorRelationship.find({
      mentorId,
      status: "ACTIVE"
    }).sort({ updatedAt: -1 }).lean();

    res.status(200).json({ success: true, mentees });
  } catch (error) {
    console.error("Get active mentees error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch mentees" });
  }
};

// ── GET /api/graduate/mentor/relationships/:id/messages ───────────────────────
exports.getRelationshipMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const relationship = await GraduateMentorRelationship.findById(id);

    if (!relationship || !relationship.conversationId) {
      return res.status(200).json({ success: true, messages: [] });
    }

    const messages = await PeerMessage.find({
      conversationId: relationship.conversationId
    }).sort({ createdAt: 1 }).lean();

    res.status(200).json({ success: true, relationship, messages });
  } catch (error) {
    console.error("Get relationship messages error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch chat messages" });
  }
};

// ── POST /api/graduate/mentor/relationships/:id/messages ──────────────────────
exports.sendRelationshipMessage = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: "Message content required" });
    }

    const relationship = await GraduateMentorRelationship.findById(id);
    if (!relationship) {
      return res.status(404).json({ success: false, message: "Relationship not found" });
    }

    let conversationId = relationship.conversationId;
    if (!conversationId) {
      const conv = new PeerConversation({
        participants: [relationship.mentorId, relationship.studentId],
        lastMessage: content
      });
      await conv.save();
      conversationId = conv._id;
      relationship.conversationId = conversationId;
      await relationship.save();
    }

    const message = new PeerMessage({
      conversationId,
      senderId: userId,
      content: content.trim()
    });
    await message.save();

    await PeerConversation.findByIdAndUpdate(conversationId, {
      lastMessage: content.trim(),
      lastMessageAt: new Date(),
      lastSenderId: userId
    });

    res.status(200).json({ success: true, message });
  } catch (error) {
    console.error("Send relationship message error:", error);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
};

// ── GET & PUT /api/graduate/mentor/profile ────────────────────────────────────
exports.getMentorProfile = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    let profile = await GraduateMentorProfile.findOne({ userId });

    if (!profile) {
      const user = await User.findById(userId);
      profile = new GraduateMentorProfile({
        userId,
        headline: `${user?.name || "Graduate"} — Alumni Mentor`,
        graduationDegree: "B.E. Computer Science",
        graduationYear: "2026"
      });
      await profile.save();
    }

    res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error("Get mentor profile error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch mentor profile" });
  }
};

exports.updateMentorProfile = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    const patch = req.body;

    let profile = await GraduateMentorProfile.findOneAndUpdate(
      { userId },
      { $set: patch },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error("Update mentor profile error:", error);
    res.status(500).json({ success: false, message: "Failed to update mentor profile" });
  }
};
