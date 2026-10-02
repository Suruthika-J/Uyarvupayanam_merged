const { PeerConversation, PeerMessage } = require("../models/PeerChat");
const CollegeStudentProfile = require("../models/CollegeStudentProfile");
const User = require("../models/User");

// ─── GET /api/peer-chat/students ─────────────────────────────────────────────
// Search/discover other college students (excluding self).
exports.discoverStudents = async (req, res) => {
  try {
    const userId = req.student?._id || req.student?.id;
    const { q, skills, interests, department, year } = req.query;

    // Build a profile filter
    const profileFilter = { userId: { $ne: userId } };
    if (skills)    profileFilter.skills       = { $in: skills.split(",").map(s => new RegExp(s.trim(), "i")) };
    if (interests) profileFilter.academicInterests = { $in: interests.split(",").map(s => new RegExp(s.trim(), "i")) };
    if (year)      profileFilter.currentYear   = new RegExp(year, "i");
    if (department) profileFilter.field        = new RegExp(department, "i");

    // Get current student profile to determine domain for peer matching
    const myProfile = await CollegeStudentProfile.findOne({ userId }).lean();
    const myDomain = myProfile?.domain || myProfile?.specialization || myProfile?.targetCareer || "Artificial Intelligence & Machine Learning";
    const myDomainTokens = myDomain.toLowerCase().split(/\s+/).filter(w => w.length > 2);

    const profiles = await CollegeStudentProfile.find(profileFilter)
      .limit(50)
      .lean();

    const userIds = profiles.map(p => p.userId);
    const users   = await User.find({ _id: { $in: userIds }, role: "student" }).select("_id name").lean();

    const userMap = {};
    users.forEach(u => { userMap[u._id.toString()] = u.name; });

    // Combine profile data & calculate domain match relevance
    let combined = profiles.map(p => {
      const pDomain = (p.domain || p.specialization || p.targetCareer || p.field || "").toLowerCase();
      const isExactMatch = pDomain === myDomain.toLowerCase();
      const isPartialMatch = myDomainTokens.some(tok => pDomain.includes(tok));
      const sameDomainMatch = isExactMatch || isPartialMatch;

      return {
        userId:          p.userId,
        name:            userMap[p.userId?.toString()] || "Student Peer",
        institution:     p.institution,
        field:           p.field,
        degreeProgramme: p.degreeProgramme,
        currentYear:     p.currentYear,
        domain:          p.domain || p.specialization || "Engineering",
        skills:          p.skills || [],
        academicInterests: p.academicInterests || [],
        careerInterests:   p.careerInterests   || [],
        sameDomainMatch,
        matchScore: isExactMatch ? 100 : isPartialMatch ? 85 : 40
      };
    });

    if (q) {
      const rx = new RegExp(q, "i");
      combined = combined.filter(s =>
        rx.test(s.name) || rx.test(s.field) || rx.test(s.domain) ||
        s.skills.some(sk => rx.test(sk)) || s.academicInterests.some(i => rx.test(i))
      );
    }

    // Sort peers so students with same domain match appear first
    combined.sort((a, b) => b.matchScore - a.matchScore);

    res.json({ success: true, myDomain, students: combined });
  } catch (err) {
    console.error("discoverStudents error:", err);
    res.status(500).json({ success: false, message: "Failed to discover students." });
  }
};

// ─── GET /api/peer-chat/conversations ────────────────────────────────────────
// List all conversations for the current user, with last message + unread count.
exports.getConversations = async (req, res) => {
  try {
    const userId = req.student?._id || req.student?.id;

    const convos = await PeerConversation.find({ participants: userId })
      .sort({ lastMessageAt: -1 })
      .lean();

    // Attach peer names
    const peerIds = convos.map(c => c.participants.find(p => p.toString() !== userId.toString()));
    const peerUsers = await User.find({ _id: { $in: peerIds } }).select("_id name").lean();
    const peerMap = {};
    peerUsers.forEach(u => { peerMap[u._id.toString()] = u.name; });

    const result = convos.map(c => {
      const peerId = c.participants.find(p => p.toString() !== userId.toString());
      return {
        _id:           c._id,
        peerId,
        peerName:      peerMap[peerId?.toString()] || "Student",
        lastMessage:   c.lastMessage,
        lastMessageAt: c.lastMessageAt,
        unreadCount:   c.unreadCounts?.[userId.toString()] || 0
      };
    });

    res.json({ success: true, conversations: result });
  } catch (err) {
    console.error("getConversations error:", err);
    res.status(500).json({ success: false, message: "Failed to load conversations." });
  }
};

// ─── POST /api/peer-chat/conversations ───────────────────────────────────────
// Get or create a conversation with another student.
exports.getOrCreateConversation = async (req, res) => {
  try {
    const userId   = req.student?._id || req.student?.id;
    const { peerId } = req.body;

    if (!peerId) return res.status(400).json({ success: false, message: "peerId required." });
    if (peerId.toString() === userId.toString())
      return res.status(400).json({ success: false, message: "Cannot chat with yourself." });

    // Find existing conversation
    let convo = await PeerConversation.findOne({
      participants: { $all: [userId, peerId], $size: 2 }
    });

    if (!convo) {
      convo = await PeerConversation.create({
        participants: [userId, peerId],
        unreadCounts: {}
      });
    }

    const peerUser = await User.findById(peerId).select("name").lean();
    res.json({
      success: true,
      conversation: {
        _id: convo._id,
        peerId,
        peerName: peerUser?.name || "Student",
        lastMessage: convo.lastMessage,
        lastMessageAt: convo.lastMessageAt,
        unreadCount: convo.unreadCounts?.[userId.toString()] || 0
      }
    });
  } catch (err) {
    console.error("getOrCreateConversation error:", err);
    res.status(500).json({ success: false, message: "Failed to open conversation." });
  }
};

// ─── GET /api/peer-chat/conversations/:id/messages ───────────────────────────
// Load paginated messages for a conversation.
exports.getMessages = async (req, res) => {
  try {
    const userId   = req.student?._id || req.student?.id;
    const convoId  = req.params.id;
    const page     = Math.max(1, parseInt(req.query.page) || 1);
    const limit    = Math.min(100, parseInt(req.query.limit) || 40);

    // Verify user is a participant
    const convo = await PeerConversation.findOne({ _id: convoId, participants: userId });
    if (!convo) return res.status(403).json({ success: false, message: "Access denied." });

    const messages = await PeerMessage.find({ conversationId: convoId, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    messages.reverse();

    // Mark as read
    await PeerConversation.findByIdAndUpdate(convoId, {
      $set: { [`unreadCounts.${userId}`]: 0 }
    });

    // Mark messages as read by this user
    await PeerMessage.updateMany(
      { conversationId: convoId, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );

    res.json({ success: true, messages });
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ success: false, message: "Failed to load messages." });
  }
};

// ─── POST /api/peer-chat/conversations/:id/messages ──────────────────────────
// Send a message. Also broadcasts via Socket.io if available.
exports.sendMessage = async (req, res) => {
  try {
    const userId  = req.student?._id || req.student?.id;
    const convoId = req.params.id;
    const { content, type, studyInvite } = req.body;

    if (!content?.trim()) return res.status(400).json({ success: false, message: "Message cannot be empty." });

    // Verify membership
    const convo = await PeerConversation.findOne({ _id: convoId, participants: userId });
    if (!convo) return res.status(403).json({ success: false, message: "Access denied." });

    const message = await PeerMessage.create({
      conversationId: convoId,
      senderId:       userId,
      content:        content.trim().substring(0, 2000),
      type:           type || "text",
      studyInvite:    studyInvite || undefined,
      readBy:         [userId]
    });

    // Update conversation metadata + increment unread for peer
    const peerId = convo.participants.find(p => p.toString() !== userId.toString());
    await PeerConversation.findByIdAndUpdate(convoId, {
      $set: {
        lastMessage: content.trim().substring(0, 80),
        lastMessageAt: new Date(),
        lastSenderId: userId,
        [`unreadCounts.${peerId}`]: (convo.unreadCounts?.get(peerId?.toString()) || 0) + 1
      }
    });

    // Broadcast via Socket.io to peer's personal room
    const io = req.app.get("io");
    if (io && peerId) {
      const senderUser = await User.findById(userId).select("name").lean();
      io.to(`user_${peerId}`).emit("peer:message", {
        conversationId: convoId,
        message: {
          ...message.toObject(),
          senderName: senderUser?.name || "Student"
        }
      });
    }

    res.status(201).json({ success: true, message });
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ success: false, message: "Failed to send message." });
  }
};

// ─── POST /api/peer-chat/conversations/:id/study-invite ──────────────────────
// Send a study session invitation.
exports.sendStudyInvite = async (req, res) => {
  try {
    const userId  = req.student?._id || req.student?.id;
    const convoId = req.params.id;
    const { subject, goal, durationMinutes } = req.body;

    const convo = await PeerConversation.findOne({ _id: convoId, participants: userId });
    if (!convo) return res.status(403).json({ success: false, message: "Access denied." });

    const inviteText = `📚 Study Invite: ${subject || "General Study"} — ${goal || "Let's study together!"} (${durationMinutes || 25} mins)`;
    const message = await PeerMessage.create({
      conversationId: convoId,
      senderId:       userId,
      content:        inviteText,
      type:           "study_invite",
      studyInvite: {
        subject:         subject || "General Study",
        goal:            goal    || "",
        durationMinutes: durationMinutes || 25,
        status:          "pending"
      },
      readBy: [userId]
    });

    await PeerConversation.findByIdAndUpdate(convoId, {
      $set: { lastMessage: inviteText.substring(0, 80), lastMessageAt: new Date() }
    });

    // Notify peer via socket
    const peerId = convo.participants.find(p => p.toString() !== userId.toString());
    const io = req.app.get("io");
    if (io && peerId) {
      io.to(`user_${peerId}`).emit("study:invite", {
        conversationId: convoId,
        messageId: message._id,
        subject, goal, durationMinutes,
        fromUserId: userId
      });
    }

    res.status(201).json({ success: true, message });
  } catch (err) {
    console.error("sendStudyInvite error:", err);
    res.status(500).json({ success: false, message: "Failed to send invite." });
  }
};

// ─── PATCH /api/peer-chat/messages/:msgId/invite-response ────────────────────
// Accept or decline a study invite.
exports.respondToStudyInvite = async (req, res) => {
  try {
    const userId  = req.student?._id || req.student?.id;
    const msgId   = req.params.msgId;
    const { response } = req.body; // "accepted" | "declined"

    const msg = await PeerMessage.findById(msgId);
    if (!msg || msg.type !== "study_invite")
      return res.status(404).json({ success: false, message: "Invite not found." });

    // Only the peer (non-sender) can respond
    if (msg.senderId.toString() === userId.toString())
      return res.status(403).json({ success: false, message: "Cannot respond to own invite." });

    msg.studyInvite.status = response === "accepted" ? "accepted" : "declined";
    await msg.save();

    // Notify sender
    const io = req.app.get("io");
    const eventName = response === "accepted" ? "study:accepted" : "study:declined";
    io?.to(`user_${msg.senderId}`).emit(eventName, {
      conversationId: msg.conversationId,
      messageId: msg._id,
      responderId: userId
    });

    res.json({ success: true, status: msg.studyInvite.status });
  } catch (err) {
    console.error("respondToStudyInvite error:", err);
    res.status(500).json({ success: false, message: "Failed to respond." });
  }
};
