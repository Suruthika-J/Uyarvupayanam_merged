import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronRight, FiCheck, FiHeart, FiStar, FiX } from "react-icons/fi";

function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const emotionColors = {
  happy: { gradient: "linear-gradient(135deg, #fbbf24, #f59e0b)", bg: "#fef9c3", border: "#fbbf24" },
  sad: { gradient: "linear-gradient(135deg, #60a5fa, #3b82f6)", bg: "#dbeafe", border: "#60a5fa" },
  angry: { gradient: "linear-gradient(135deg, #f87171, #ef4444)", bg: "#fee2e2", border: "#f87171" },
  scared: { gradient: "linear-gradient(135deg, #a78bfa, #8b5cf6)", bg: "#ede9fe", border: "#a78bfa" },
  surprised: { gradient: "linear-gradient(135deg, #fb923c, #f97316)", bg: "#ffedd5", border: "#fb923c" },
  disgusted: { gradient: "linear-gradient(135deg, #4ade80, #22c55e)", bg: "#dcfce7", border: "#4ade80" },
  confused: { gradient: "linear-gradient(135deg, #f472b6, #ec4899)", bg: "#fce7f3", border: "#f472b6" },
  nervous: { gradient: "linear-gradient(135deg, #c084fc, #a855f7)", bg: "#f3e8ff", border: "#c084fc" },
};

function getEmotionColor(correct) {
  const key = (correct || "").toLowerCase();
  for (const k of Object.keys(emotionColors)) {
    if (key.includes(k)) return emotionColors[k];
  }
  return { gradient: "linear-gradient(135deg, #60a5fa, #3b82f6)", bg: "#dbeafe", border: "#60a5fa" };
}

function getStarCount(score, total) {
  if (total === 0) return 0;
  const pct = score / total;
  if (pct >= 0.95) return 5;
  if (pct >= 0.8) return 4;
  if (pct >= 0.6) return 3;
  if (pct >= 0.4) return 2;
  return 1;
}

const optionEmoji = ["😊", "😢", "😡", "😨"];

export default function EmotionDetective({ questions, onComplete }) {
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);

  const [answeredEmotion, setAnsweredEmotion] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [emotionCorrect, setEmotionCorrect] = useState(false);

  const [answeredEmpathy, setAnsweredEmpathy] = useState(false);
  const [selectedEmpathy, setSelectedEmpathy] = useState(null);

  const [phase, setPhase] = useState("emotion");
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setShuffledQuestions(shuffleArray(questions));
  }, [questions]);

  const currentQuestion = shuffledQuestions[currentIndex];
  const totalQuestions = shuffledQuestions.length;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const handleEmotionSelect = (option) => {
    if (answeredEmotion) return;
    setSelectedEmotion(option);
    setAnsweredEmotion(true);
    const correct = option === currentQuestion.correct;
    setEmotionCorrect(correct);
    if (correct) setScore((prev) => prev + 1);
  };

  const handleEmpathySelect = (optionObj) => {
    if (answeredEmpathy) return;
    setSelectedEmpathy(optionObj);
    setAnsweredEmpathy(true);
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentIndex((prev) => prev + 1);
      setAnsweredEmotion(false);
      setSelectedEmotion(null);
      setEmotionCorrect(false);
      setAnsweredEmpathy(false);
      setSelectedEmpathy(null);
      setPhase("emotion");
    } else {
      const finalScore = emotionCorrect ? score + 1 : score;
      setCompleted(true);
      if (onComplete) onComplete(finalScore);
    }
  };

  if (!currentQuestion && !completed) return null;

  const progressPct = totalQuestions > 0 ? ((currentIndex + (phase === "feedback" ? 1 : 0)) / totalQuestions) * 100 : 0;
  const ec = getEmotionColor(currentQuestion?.correct);
  const starCount = getStarCount(score, totalQuestions);

  /* ───── Completion Card ───── */
  if (completed) {
    return (
      <div style={{ minHeight: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          style={{
            background: "#fff",
            borderRadius: 28,
            padding: "48px 40px",
            textAlign: "center",
            boxShadow: "0 24px 64px -12px rgba(0,0,0,0.15)",
            maxWidth: 440,
            width: "100%",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 6,
              background: "linear-gradient(90deg, #10b981, #3b82f6, #8b5cf6)",
            }}
          />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.3, stiffness: 200 }}
            style={{ fontSize: 72, marginBottom: 12 }}
          >
            🏆
          </motion.div>
          <h3 style={{ fontSize: 24, fontWeight: 900, color: "#1e293b", margin: "0 0 8px" }}>
            Challenge Complete!
          </h3>
          <p style={{ fontSize: 16, color: "#64748b", margin: "0 0 24px" }}>
            You finished the Emotion Detective game!
          </p>

          {/* Stars */}
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 20 }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <motion.div
                key={s}
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: s <= starCount ? 1 : 0.7, rotate: 0 }}
                transition={{ type: "spring", delay: 0.4 + s * 0.1, stiffness: 300 }}
              >
                <FiStar
                  size={32}
                  style={{
                    color: s <= starCount ? "#f59e0b" : "#e2e8f0",
                    fill: s <= starCount ? "#f59e0b" : "none",
                    filter: s <= starCount ? "drop-shadow(0 2px 6px rgba(245,158,11,0.4))" : "none",
                  }}
                />
              </motion.div>
            ))}
          </div>

          {/* Score */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
              padding: "12px 28px",
              borderRadius: 999,
              marginBottom: 20,
            }}
          >
            <FiStar size={20} style={{ color: "#f59e0b", fill: "#f59e0b" }} />
            <span style={{ fontSize: 22, fontWeight: 900, color: "#16a34a" }}>
              {score} / {totalQuestions}
            </span>
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 1, stiffness: 250 }}
            style={{
              display: "inline-block",
              background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
              color: "#fff",
              padding: "8px 20px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            🕵️ Emotion Detective Badge Earned!
          </motion.div>
        </motion.div>
      </div>
    );
  }

  /* ───── Main Game UI ───── */
  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 32 }}>🕵️‍♂️</span>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 900,
            margin: 0,
            color: "#1e293b",
          }}
        >
          Emotion Detective
        </h2>
        <div
          style={{
            marginLeft: "auto",
            background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
            color: "#2563eb",
            padding: "6px 18px",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 800,
            border: "1px solid #bfdbfe",
          }}
        >
          Q {currentIndex + 1} / {totalQuestions}
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: "100%",
          height: 8,
          background: "#f1f5f9",
          borderRadius: 999,
          marginBottom: 24,
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            height: "100%",
            background: "linear-gradient(90deg, #10b981, #34d399)",
            borderRadius: 999,
            boxShadow: "0 0 12px rgba(16,185,129,0.4)",
          }}
        />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.35 }}
          style={{
            background: "#fff",
            borderRadius: 28,
            padding: "32px 32px 28px",
            border: `3px solid ${ec.border}`,
            boxShadow: `0 20px 50px -12px rgba(0,0,0,0.1), 0 0 0 0 ${ec.border}22`,
            marginBottom: 24,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* top colored accent */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 5,
              background: ec.gradient,
            }}
          />

          {/* background dots pattern */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.03,
              backgroundImage:
                "radial-gradient(circle, #000 1px, transparent 1px)",
              backgroundSize: "20px 20px",
              pointerEvents: "none",
            }}
          />

          {/* Emoji in gradient circle */}
          <motion.div
            key={`emoji-${currentIndex}`}
            initial={{ scale: 0.3, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: "50%",
                background: ec.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `3px solid ${ec.border}33`,
                boxShadow: `0 12px 32px -8px ${ec.border}33`,
              }}
            >
              <span style={{ fontSize: 100, lineHeight: 1 }}>{currentQuestion.emoji}</span>
            </div>
          </motion.div>

          {/* Question text */}
          <p
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#1e293b",
              textAlign: "center",
              lineHeight: 1.5,
              margin: "0 0 28px 0",
            }}
          >
            {currentQuestion.question}
          </p>

          {/* ── Emotion Selection ── */}
          {phase === "emotion" && (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 12,
                }}
              >
                {currentQuestion.options.map((opt, i) => {
                  const isSelected = selectedEmotion === opt;
                  const showResult = answeredEmotion && isSelected;
                  const isCorrectOpt = opt === currentQuestion.correct;

                  let bgStyle = "#fff";
                  let borderStyle = "#e2e8f0";
                  let textColor = "#1e293b";

                  if (showResult) {
                    if (emotionCorrect) {
                      bgStyle = "linear-gradient(135deg, #10b981, #059669)";
                      borderStyle = "#10b981";
                      textColor = "#fff";
                    } else {
                      bgStyle = "linear-gradient(135deg, #ef4444, #dc2626)";
                      borderStyle = "#ef4444";
                      textColor = "#fff";
                    }
                  } else if (answeredEmotion && isCorrectOpt) {
                    bgStyle = "linear-gradient(135deg, #10b981, #059669)";
                    borderStyle = "#10b981";
                    textColor = "#fff";
                  }

                  return (
                    <motion.button
                      key={opt}
                      whileHover={
                        !answeredEmotion ? { y: -4, boxShadow: `0 8px 24px -4px ${ec.border}44` } : {}
                      }
                      whileTap={!answeredEmotion ? { scale: 0.96 } : {}}
                      onClick={() => handleEmotionSelect(opt)}
                      disabled={answeredEmotion}
                      animate={
                        showResult && !emotionCorrect
                          ? { x: [0, -6, 6, -6, 6, 0] }
                          : {}
                      }
                      transition={
                        showResult && !emotionCorrect
                          ? { duration: 0.4 }
                          : {}
                      }
                      style={{
                        padding: "16px 20px",
                        borderRadius: 18,
                        border: `2.5px solid ${borderStyle}`,
                        background: bgStyle,
                        fontSize: 16,
                        fontWeight: 700,
                        color: textColor,
                        cursor: answeredEmotion ? "default" : "pointer",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        transition: "background 0.3s, border-color 0.3s, color 0.3s",
                        boxShadow: answeredEmotion ? "none" : "0 2px 8px rgba(0,0,0,0.04)",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <span style={{ fontSize: 22 }}>{optionEmoji[i] || "🤔"}</span>
                      <span style={{ flex: 1 }}>{opt}</span>
                      {showResult && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          {emotionCorrect ? (
                            <FiCheck size={20} color="#fff" strokeWidth={3} />
                          ) : (
                            <FiX size={20} color="#fff" strokeWidth={3} />
                          )}
                        </motion.span>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Emotion Feedback Banner */}
              <AnimatePresence>
                {answeredEmotion && (
                  <motion.div
                    initial={{ opacity: 0, y: 16, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    style={{
                      marginTop: 20,
                      padding: "16px 22px",
                      borderRadius: 18,
                      background: emotionCorrect
                        ? "linear-gradient(135deg, #ecfdf5, #d1fae5)"
                        : "linear-gradient(135deg, #fef2f2, #fecaca)",
                      border: `2px solid ${emotionCorrect ? "#10b981" : "#ef4444"}`,
                      color: emotionCorrect ? "#065f46" : "#991b1b",
                      fontWeight: 700,
                      fontSize: 15,
                      textAlign: "center",
                      lineHeight: 1.5,
                    }}
                  >
                    {emotionCorrect
                      ? "🎉 Great observation! You identified the emotion correctly!"
                      : `💡 Not quite. The correct answer is "${currentQuestion.correct}". Keep trying — you're learning!`}
                  </motion.div>
                )}
              </AnimatePresence>

              {answeredEmotion && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  style={{ textAlign: "center", marginTop: 20 }}
                >
                  <motion.button
                    whileHover={{ y: -3, boxShadow: "0 8px 24px -4px rgba(16,185,129,0.35)" }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setPhase("empathy")}
                    style={{
                      padding: "14px 32px",
                      borderRadius: 999,
                      border: "none",
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: 15,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      boxShadow: "0 4px 14px rgba(16,185,129,0.3)",
                    }}
                  >
                    Continue to Empathy Check
                    <FiChevronRight size={18} />
                  </motion.button>
                </motion.div>
              )}
            </>
          )}

          {/* ── Empathy Follow-Up ── */}
          {phase === "empathy" && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: "linear-gradient(135deg, #fffbeb, #fef3c7)",
                  borderRadius: 20,
                  padding: "20px 24px",
                  marginBottom: 20,
                  border: "2px solid #fcd34d",
                  position: "relative",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ fontSize: 24 }}>💡</span>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: 1.5,
                        color: "#b45309",
                        marginBottom: 6,
                      }}
                    >
                      Empathy Check
                    </div>
                    <p
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        fontStyle: "italic",
                        color: "#92400e",
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      {currentQuestion.followUp}
                    </p>
                  </div>
                </div>
              </motion.div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {currentQuestion.followUpOptions.map((optObj, idx) => {
                  const isSelected = answeredEmpathy && selectedEmpathy === optObj;
                  let bgStyle = "#fff";
                  let borderStyle = "#e2e8f0";
                  let textColor = "#1e293b";

                  if (isSelected) {
                    if (optObj.empathy) {
                      bgStyle = "linear-gradient(135deg, #fde68a, #fbbf24)";
                      borderStyle = "#f59e0b";
                    } else {
                      bgStyle = "#fef2f2";
                      borderStyle = "#fca5a5";
                    }
                  } else if (answeredEmpathy && optObj.empathy) {
                    bgStyle = "linear-gradient(135deg, #fde68a, #fbbf24)";
                    borderStyle = "#f59e0b";
                  }

                  return (
                    <motion.button
                      key={idx}
                      whileHover={!answeredEmpathy ? { y: -2, boxShadow: "0 6px 18px -4px rgba(0,0,0,0.1)" } : {}}
                      whileTap={!answeredEmpathy ? { scale: 0.98 } : {}}
                      onClick={() => handleEmpathySelect(optObj)}
                      disabled={answeredEmpathy}
                      animate={isSelected && !optObj.empathy ? { x: [0, -4, 4, -4, 4, 0] } : {}}
                      transition={isSelected && !optObj.empathy ? { duration: 0.35 } : {}}
                      style={{
                        padding: "16px 20px",
                        borderRadius: 18,
                        border: `2.5px solid ${borderStyle}`,
                        background: bgStyle,
                        fontSize: 15,
                        fontWeight: 600,
                        color: textColor,
                        cursor: answeredEmpathy ? "default" : "pointer",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        transition: "background 0.3s, border-color 0.3s",
                      }}
                    >
                      <span
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: "50%",
                          background: isSelected
                            ? optObj.empathy
                              ? "#b45309"
                              : "#dc2626"
                            : answeredEmpathy && optObj.empathy
                              ? "#b45309"
                              : "#e2e8f0",
                          color: isSelected || (answeredEmpathy && optObj.empathy) ? "#fff" : "#64748b",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span style={{ flex: 1 }}>{optObj.text}</span>
                      {isSelected && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          {optObj.empathy ? (
                            <FiHeart size={20} style={{ color: "#b45309", fill: "#b45309" }} />
                          ) : (
                            <FiX size={18} color="#dc2626" strokeWidth={3} />
                          )}
                        </motion.span>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Empathy Feedback Banner */}
              <AnimatePresence>
                {answeredEmpathy && (
                  <motion.div
                    initial={{ opacity: 0, y: 16, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    style={{
                      marginTop: 20,
                      padding: "16px 22px",
                      borderRadius: 18,
                      background: selectedEmpathy?.empathy
                        ? "linear-gradient(135deg, #fef9c3, #fde68a)"
                        : "linear-gradient(135deg, #fef2f2, #fecaca)",
                      border: `2px solid ${selectedEmpathy?.empathy ? "#f59e0b" : "#fca5a5"}`,
                      color: selectedEmpathy?.empathy ? "#92400e" : "#991b1b",
                      fontWeight: 700,
                      fontSize: 15,
                      textAlign: "center",
                      lineHeight: 1.5,
                    }}
                  >
                    {selectedEmpathy?.empathy
                      ? "💖 Beautiful empathy! You truly understand how others feel."
                      : "🌟 That's okay! Think about how your friend would feel. Being kind and supportive makes you a great friend!"}
                  </motion.div>
                )}
              </AnimatePresence>

              {answeredEmpathy && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  style={{ textAlign: "center", marginTop: 20 }}
                >
                  <motion.button
                    whileHover={{ y: -3, boxShadow: "0 8px 24px -4px rgba(59,130,246,0.35)" }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleNext}
                    style={{
                      padding: "14px 32px",
                      borderRadius: 999,
                      border: "none",
                      background: isLastQuestion
                        ? "linear-gradient(135deg, #f59e0b, #d97706)"
                        : "linear-gradient(135deg, #3b82f6, #2563eb)",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: 16,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      boxShadow: isLastQuestion
                        ? "0 4px 14px rgba(245,158,11,0.35)"
                        : "0 4px 14px rgba(59,130,246,0.35)",
                    }}
                  >
                    {isLastQuestion ? "Complete Detective Challenge" : "Next Question"}
                    <FiChevronRight size={20} />
                  </motion.button>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Persistent Score */}
      {!completed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginTop: 4,
          }}
        >
          <FiStar size={18} style={{ color: "#f59e0b", fill: "#f59e0b" }} />
          <span style={{ fontSize: 16, fontWeight: 800, color: "#1e293b" }}>
            {score} / {totalQuestions}
          </span>
        </motion.div>
      )}
    </div>
  );
}
