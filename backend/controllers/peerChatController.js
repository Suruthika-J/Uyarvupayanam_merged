const { PeerConversation, PeerMessage } = require("../models/PeerChat");
const CollegeStudentProfile = require("../models/CollegeStudentProfile");
const User = require("../models/User");

// ─── GET /api/peer-chat/students ─────────────────────────────────────────────
// ─── GET /api/peer-chat/students ─────────────────────────────────────────────
// Search/discover other college students (excluding self) from database.
exports.discoverStudents = async (req, res) => {
  try {
    const userId = req.student?._id || req.student?.id;
    const { q, skills, interests, department, year } = req.query;

    // Get current student profile to determine domain for peer matching
    const myProfile = await CollegeStudentProfile.findOne({
      $or: [{ userId }, { userId: userId?.toString() }]
    }).lean();

    const myDomain = myProfile?.domain || myProfile?.specialization || myProfile?.targetCareer || "Full Stack Web & Mobile Development";
    const myDomainTokens = myDomain.toLowerCase().split(/\s+/).filter(w => w.length > 2);

    // 1. Fetch real student users from MongoDB database except current logged-in user
    const users = await User.find({
      _id: { $ne: userId },
      role: "student"
    }).select("_id name email district userType classLevel").sort({ createdAt: -1 }).lean();

    const userIds = users.map(u => u._id);

    // 2. Fetch matching college student profiles
    const profiles = await CollegeStudentProfile.find({
      $or: [
        { userId: { $in: userIds } },
        { userId: { $in: userIds.map(id => id.toString()) } }
      ]
    }).lean();

    const profileMap = {};
    profiles.forEach(p => {
      if (p.userId) {
        profileMap[p.userId.toString()] = p;
      }
    });

    // 3. Map real users into peer objects
    let combined = users.map(u => {
      const p = profileMap[u._id.toString()] || {};
      const pDomain = (p.domain || p.specialization || p.targetCareer || p.field || "Computer Science").toLowerCase();
      const isExactMatch = pDomain === myDomain.toLowerCase();
      const isPartialMatch = myDomainTokens.some(tok => pDomain.includes(tok));
      const sameDomainMatch = isExactMatch || isPartialMatch;

      return {
        userId:          u._id,
        name:            u.name || "Student Peer",
        institution:     p.institution || (u.district ? `${u.district} College` : "PSG College of Technology"),
        field:           p.field || "engineering",
        degreeProgramme: p.degreeProgramme || "B.E. (Bachelor of Engineering)",
        currentYear:     p.currentYear || "College Student",
        domain:          p.domain || p.specialization || "Full Stack Web & Mobile Development",
        skills:          (p.skills && p.skills.length > 0) ? p.skills : ["Python / Data Science", "Problem Solving & Logic"],
        academicInterests: p.academicInterests || [],
        careerInterests:   p.careerInterests   || [],
        sameDomainMatch,
        matchScore: isExactMatch ? 100 : isPartialMatch ? 85 : 40
      };
    });

    if (q) {
      const rx = new RegExp(q, "i");
      combined = combined.filter(s =>
        rx.test(s.name) || rx.test(s.field) || rx.test(s.domain) || rx.test(s.institution) ||
        s.skills.some(sk => rx.test(sk)) || s.academicInterests.some(i => rx.test(i))
      );
    }

    if (skills) {
      const skList = skills.split(",").map(s => s.trim().toLowerCase());
      combined = combined.filter(s => s.skills.some(sk => skList.some(k => sk.toLowerCase().includes(k))));
    }

    // Sort peers so closest matches appear first
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
// Accept or decline a study invite & launch Multiplayer Quiz Session
exports.respondToStudyInvite = async (req, res) => {
  try {
    const userId  = req.student?._id || req.student?.id;
    const msgId   = req.params.msgId;
    const { response } = req.body; // "accepted" | "declined"

    console.log(`[INVITE] Accept/Decline requested for messageId: ${msgId} by userId: ${userId} (response: ${response})`);

    const msg = await PeerMessage.findById(msgId);
    if (!msg || msg.type !== "study_invite") {
      return res.status(404).json({ success: false, message: "Invite not found." });
    }

    const currentStatus = String(msg.studyInvite?.status || "PENDING").toUpperCase();

    if (response === "ended" || response === "end") {
      console.log(`[INVITE] Study invite ${msgId} marked as ended by user ${userId}`);
      msg.studyInvite.status = "ended";
      await msg.save();

      if (msg.studyInvite?.sessionId) {
        try {
          const MultiplayerQuizSession = require("../models/MultiplayerQuizSession");
          await MultiplayerQuizSession.findOneAndUpdate(
            { sessionId: msg.studyInvite.sessionId },
            { status: "CANCELLED", completedAt: new Date() }
          );
        } catch (sessErr) {
          console.error("Error cancelling session in invite-response fallback:", sessErr);
        }
      }

      const io = req.app.get("io");
      if (io) {
        const payload = { conversationId: msg.conversationId, inviteId: msg._id, sessionId: msg.studyInvite?.sessionId };
        io.to(`user_${msg.senderId}`).emit("study:ended", payload);
        io.to(`user_${userId}`).emit("study:ended", payload);
      }

      return res.json({ success: true, status: "ended", message: msg });
    }

    // Only the receiver (non-sender) can accept or decline
    if (msg.senderId.toString() === userId.toString()) {
      console.warn(`[INVITE] Sender ${userId} attempted to accept/decline own invite ${msgId}`);
      return res.status(403).json({ success: false, message: "Only the invited student can accept or decline this invitation." });
    }

    if (response === "declined") {
      console.log(`[INVITE] Receiver explicitly declined invite ${msgId}`);
      msg.studyInvite.status = "DECLINED";
      await msg.save();

      const io = req.app.get("io");
      if (io) {
        const payload = { conversationId: msg.conversationId, messageId: msg._id, responderId: userId };
        io.to(`user_${msg.senderId}`).emit("study:declined", payload);
        io.to(`user_${userId}`).emit("study:declined", payload);
      }

      return res.json({ success: true, status: "DECLINED" });
    }

    // Response is ACCEPTED
    console.log(`[INVITE] Status transition: PENDING → ACCEPTED for inviteId: ${msgId}`);
    msg.studyInvite.status = "ACCEPTED";

    let quizSession = null;

    try {
      const MultiplayerQuizSession = require("../models/MultiplayerQuizSession");
      const { createQuiz } = require("../services/quizAI/QuizAIEngine");

      // Check if session already created for this invite
      quizSession = await MultiplayerQuizSession.findOne({ inviteId: msg._id });

      if (!quizSession) {
        const topic = msg.studyInvite?.subject || "DBMS";
        const subtopic = msg.studyInvite?.goal || "Queries";
        const durationMins = msg.studyInvite?.durationMinutes || 25;

        console.log(`[QUIZ-AI] Creating quiz for topic: "${topic}", subtopic: "${subtopic}"...`);
        const quizData = await createQuiz({
          topic,
          subtopic,
          questionCount: 10,
          duration: durationMins
        });

        const questionIds = quizData.questionIds;
        console.log(`[QUIZ-AI] Quiz created with ${questionIds.length} questions. Assembling session...`);

        const [senderUser, responderUser] = await Promise.all([
          User.findById(msg.senderId).select("name").lean(),
          User.findById(userId).select("name").lean()
        ]);

        const sessionId = `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        quizSession = await MultiplayerQuizSession.create({
          sessionId,
          inviteId: msg._id,
          conversationId: msg.conversationId,
          topic: quizData.normalizedTopic || topic,
          subtopic: quizData.normalizedSubtopic || subtopic,
          questionIds,
          participants: [
            {
              userId: msg.senderId,
              name: senderUser?.name || "Student A",
              status: "WAITING",
              score: 0,
              answeredCount: 0,
              correctCount: 0,
              currentQuestionIndex: 0
            },
            {
              userId,
              name: responderUser?.name || "Student B",
              status: "WAITING",
              score: 0,
              answeredCount: 0,
              correctCount: 0,
              currentQuestionIndex: 0
            }
          ],
          status: "WAITING",
          totalQuestions: questionIds.length,
          durationSeconds: durationMins * 60,
          questionTimeoutSeconds: 45,
          currentQuestionIndex: 0
        });

        console.log(`[SESSION] Created multiplayer quiz session: ${sessionId}`);
      }

      msg.studyInvite.status = "QUIZ_CREATED";
      msg.studyInvite.sessionId = quizSession.sessionId;
      await msg.save();

      console.log(`[INVITE] Status transition: ACCEPTED → QUIZ_CREATED for inviteId: ${msgId}`);

    } catch (errQuiz) {
      console.error("[INVITE] Quiz creation error:", errQuiz);
      msg.studyInvite.status = "QUIZ_CREATION_FAILED";
      await msg.save();

      return res.status(500).json({
        success: false,
        errorCode: "QUIZ_CREATION_FAILED",
        message: "Unable to create the study game."
      });
    }

    // Extract clean string IDs for room targeting
    const senderIdStr = (typeof msg.senderId === "object" ? (msg.senderId._id || msg.senderId.id) : msg.senderId).toString();
    const receiverIdStr = userId.toString();

    console.log(`[STUDY INVITE] Accept processed for inviteId: ${msg._id}`);
    console.log(`[STUDY INVITE] Sender: ${senderIdStr} | Receiver: ${receiverIdStr}`);
    console.log(`[STUDY INVITE] Status after: QUIZ_CREATED | SessionId: ${quizSession.sessionId}`);

    // Notify both users via socket
    const io = req.app.get("io");
    const payload = {
      inviteId: msg._id,
      conversationId: msg.conversationId,
      messageId: msg._id,
      senderId: senderIdStr,
      receiverId: receiverIdStr,
      responderId: userId,
      status: "QUIZ_CREATED",
      sessionId: quizSession.sessionId,
      topic: quizSession.topic,
      subtopic: quizSession.subtopic,
      questionCount: quizSession.totalQuestions,
      duration: Math.round(quizSession.durationSeconds / 60)
    };

    if (io) {
      console.log(`[SOCKET] Emitting study:quiz-created to rooms: user_${senderIdStr} and user_${receiverIdStr}`);
      io.to(`user_${senderIdStr}`).emit("study:accepted", payload);
      io.to(`user_${receiverIdStr}`).emit("study:accepted", payload);
      io.to(`user_${senderIdStr}`).emit("study:quiz-created", payload);
      io.to(`user_${receiverIdStr}`).emit("study:quiz-created", payload);
      io.to(`user_${senderIdStr}`).emit("quiz:session-created", payload);
      io.to(`user_${receiverIdStr}`).emit("quiz:session-created", payload);
    }

    return res.json({
      success: true,
      inviteId: msg._id,
      sessionId: quizSession.sessionId,
      status: "QUIZ_CREATED",
      redirectTo: `/college/multiplayer-quiz/${quizSession.sessionId}`
    });
  } catch (err) {
    console.error("respondToStudyInvite error:", err);
    res.status(500).json({ success: false, message: "Failed to respond." });
  }
};

// Dev utility to clean old test study invites
exports.cleanTestInvites = async (req, res) => {
  try {
    await PeerMessage.deleteMany({ type: "study_invite" });
    console.log("[INVITE] Dev cleanup: Deleted test study invite messages.");
    res.json({ success: true, message: "All test study invites cleaned successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
