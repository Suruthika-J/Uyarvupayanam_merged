import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiStar } from "react-icons/fi";

const emojiOptions = [
  { emoji: "😊", label: "Friendly" },
  { emoji: "😍", label: "Loved it" },
  { emoji: "😄", label: "Fun" },
  { emoji: "😎", label: "Proud" },
];

function ConfettiDot({ delay, x, color }) {
  return (
    <motion.div
      initial={{ y: -10, opacity: 0, rotate: 0 }}
      animate={{
        y: [0, 80, 160],
        opacity: [0, 1, 0],
        rotate: [0, 180, 360],
        x: [0, x, x * 0.5],
      }}
      transition={{
        duration: 2.5,
        delay,
        repeat: Infinity,
        ease: "easeOut",
      }}
      style={{
        position: "absolute",
        top: 0,
        left: "50%",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: color,
      }}
    />
  );
}

function Sparkle({ delay, x, y }) {
  return (
    <motion.div
      animate={{
        scale: [0, 1, 0],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: 1.5,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        position: "absolute",
        top: y,
        left: x,
        fontSize: 18,
        color: "#f59e0b",
      }}
    >
      ✦
    </motion.div>
  );
}

export default function Reflection({ onSelect, onComplete, studentId }) {
  const [selected, setSelected] = useState(null);
  const [completed, setCompleted] = useState(false);

  const confettiDots = useMemo(() => {
    const colors = ["#3b82f6", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6", "#ef4444", "#14b8a6"];
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      delay: i * 0.15,
      x: (Math.random() - 0.5) * 200,
      color: colors[i % colors.length],
    }));
  }, []);

  const sparkles = useMemo(() => {
    const positions = [
      { x: "20%", y: "10%" },
      { x: "75%", y: "5%" },
      { x: "10%", y: "50%" },
      { x: "85%", y: "45%" },
      { x: "30%", y: "80%" },
      { x: "70%", y: "75%" },
      { x: "50%", y: "0%" },
      { x: "90%", y: "20%" },
    ];
    return positions.map((pos, i) => ({
      id: i,
      ...pos,
      delay: i * 0.3,
    }));
  }, []);

  const handleSelect = (option) => {
    setSelected(option);
  };

  const handleConfirm = () => {
    if (!selected) return;
    setCompleted(true);
    if (onSelect) onSelect(selected);
    if (onComplete) onComplete();
  };

  return (
    <div
      style={{
        textAlign: "center",
        maxWidth: 600,
        margin: "0 auto",
        padding: "0 16px",
      }}
    >
      {/* Celebration Area */}
      <div
        style={{
          position: "relative",
          padding: "40px 20px 32px",
          marginBottom: 8,
        }}
      >
        {/* Confetti */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 300,
            height: 180,
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          {confettiDots.map((dot) => (
            <ConfettiDot key={dot.id} {...dot} />
          ))}
        </div>

        {/* Animated Trophy */}
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, -3, 3, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            display: "inline-block",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 64,
              lineHeight: 1,
              filter: "drop-shadow(0 4px 12px rgba(251,191,36,0.4))",
              textShadow: "0 0 30px rgba(251,191,36,0.3)",
            }}
          >
            🏆
          </div>
        </motion.div>

        {/* Title with gradient */}
        <h2
          style={{
            fontSize: 30,
            fontWeight: 900,
            margin: "0 0 10px 0",
            background: "linear-gradient(135deg, #f59e0b, #ef4444, #8b5cf6, #3b82f6)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            lineHeight: 1.3,
          }}
        >
          Become a Communication Hero!
        </h2>

        <p
          style={{
            fontSize: 16,
            color: "#64748b",
            margin: 0,
            lineHeight: 1.6,
            fontWeight: 500,
          }}
        >
          You've completed the entire communication journey!
        </p>
      </div>

      {/* Reflection Card */}
      <div
        style={{
          background: "#fff",
          padding: 32,
          borderRadius: 28,
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          maxWidth: 520,
          margin: "24px auto 0",
        }}
      >
        <p
          style={{
            fontSize: 17,
            fontWeight: 800,
            color: "#1e293b",
            margin: "0 0 24px 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <span>🤔</span> Which activity did you enjoy most?
        </p>

        <div
          style={{
            display: "flex",
            gap: 14,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {emojiOptions.map((option) => {
            const isSelected = selected?.emoji === option.emoji;
            return (
              <motion.button
                key={option.emoji}
                whileHover={{ y: -4, boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelect(option)}
                style={{
                  width: 100,
                  height: 80,
                  borderRadius: 20,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  background: isSelected
                    ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                    : "#fff",
                  color: isSelected ? "#fff" : "#1e293b",
                  border: isSelected ? "2px solid #3b82f6" : "2px solid #e2e8f0",
                  boxShadow: isSelected
                    ? "0 4px 16px rgba(59,130,246,0.3)"
                    : "0 2px 8px rgba(0,0,0,0.04)",
                  transform: isSelected ? "scale(1.08)" : "scale(1)",
                  transition: "all 0.2s ease",
                }}
              >
                <span style={{ fontSize: 32 }}>{option.emoji}</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: isSelected ? "#fff" : "#64748b",
                  }}
                >
                  {option.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {selected && !completed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              style={{ marginTop: 28 }}
            >
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: "0 8px 24px rgba(59,130,246,0.4)" }}
                whileTap={{ scale: 0.97 }}
                onClick={handleConfirm}
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 16,
                  padding: "14px 36px",
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(59,130,246,0.35)",
                }}
              >
                Confirm Selection
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Achievement Card */}
      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 15 }}
            style={{
              marginTop: 32,
              background: "linear-gradient(135deg, #dcfce7, #bbf7d0)",
              borderRadius: 28,
              padding: 36,
              textAlign: "center",
              border: "1px solid #86efac",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Sparkles around badge */}
            {sparkles.map((s) => (
              <Sparkle key={s.id} {...s} />
            ))}

            {/* Animated Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 15,
                delay: 0.3,
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                boxShadow: "0 4px 20px rgba(251,191,36,0.4)",
                marginBottom: 16,
              }}
            >
              <span style={{ fontSize: 36 }}>🏆</span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: "#166534",
                margin: "0 0 8px 0",
              }}
            >
              🏆 Communication Hero Badge Unlocked!
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: "spring", stiffness: 400 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(245,158,11,0.15)",
                borderRadius: 20,
                padding: "6px 16px",
                marginBottom: 24,
              }}
            >
              <FiStar size={16} style={{ color: "#d97706" }} />
              <span style={{ fontSize: 16, fontWeight: 900, color: "#d97706" }}>
                +50 XP Earned
              </span>
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ✨
              </motion.span>
            </motion.div>

            <div style={{ marginTop: 8 }}>
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: "0 8px 24px rgba(16,185,129,0.4)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  window.location.href = `/student/class5/skills/communicationskills/passport/${studentId}`;
                }}
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 16,
                  padding: "14px 28px",
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(16,185,129,0.35)",
                }}
              >
                View My Communication Passport
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
