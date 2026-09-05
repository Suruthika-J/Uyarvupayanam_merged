import React from "react";
import { motion } from "framer-motion";

const confettiDots = [
  { top: "12%", left: "8%", size: 6, color: "#93c5fd", delay: 0 },
  { top: "25%", right: "12%", size: 5, color: "#a5b4fc", delay: 0.3 },
  { top: "60%", left: "15%", size: 7, color: "#86efac", delay: 0.6 },
  { top: "70%", right: "20%", size: 4, color: "#fca5a5", delay: 0.9 },
  { top: "40%", left: "45%", size: 5, color: "#fcd34d", delay: 1.2 },
  { top: "15%", right: "35%", size: 6, color: "#c4b5fd", delay: 0.4 },
  { top: "80%", left: "40%", size: 4, color: "#67e8f9", delay: 0.7 },
  { top: "50%", right: "5%", size: 5, color: "#fdba74", delay: 1.0 },
];

export default function DailyMission({ mission, onGenerate, onComplete }) {
  const hasMission = !!mission;
  const isCompleted = mission?.completed || false;

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #e0e7ff 100%)",
        backgroundSize: "200% 200%",
        border: "none",
        borderLeft: "4px solid #3b82f6",
        borderRadius: 20,
        padding: 0,
      }}
    >
      {/* Animated gradient shift */}
      <style>{`
        @keyframes missionGradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes missionSparkle {
          0%, 100% { box-shadow: 0 4px 16px rgba(37,99,235,0.3); }
          50% { box-shadow: 0 4px 24px rgba(37,99,235,0.5), 0 0 40px rgba(96,165,250,0.2); }
        }
        @keyframes missionPulse {
          0%, 100% { box-shadow: 0 4px 16px rgba(34,197,94,0.3); }
          50% { box-shadow: 0 4px 24px rgba(34,197,94,0.5), 0 0 40px rgba(74,222,128,0.15); }
        }
        @keyframes confettiFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-6px) rotate(180deg); opacity: 0.5; }
        }
      `}</style>

      {/* Floating confetti dots */}
      {confettiDots.map((dot, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -8, 0],
            rotate: [0, 180, 360],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 3 + dot.delay,
            repeat: Infinity,
            ease: "easeInOut",
            delay: dot.delay,
          }}
          style={{
            position: "absolute",
            top: dot.top,
            left: dot.left,
            right: dot.right,
            width: dot.size,
            height: dot.size,
            borderRadius: 999,
            background: dot.color,
            opacity: 0.2,
            pointerEvents: "none",
          }}
        />
      ))}

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: hasMission ? "flex-start" : "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 20,
          padding: "28px 30px",
        }}
      >
        {/* Left side */}
        <div style={{ flex: "1 1 300px", minWidth: 260 }}>
          {/* Icon badge + label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
            }}
          >
            {/* Emoji badge */}
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 999,
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                boxShadow: "0 3px 10px rgba(37,99,235,0.3)",
                flexShrink: 0,
              }}
            >
              🎯
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: 1.2,
                color: "#2563eb",
              }}
            >
              Daily Communication Mission
            </span>
          </div>

          {hasMission ? (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#0f172a",
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              {mission.missionText}
            </motion.p>
          ) : (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                fontSize: 15,
                color: "#94a3b8",
                margin: 0,
                fontStyle: "italic",
                lineHeight: 1.6,
              }}
            >
              Unlock your daily challenge!
            </motion.p>
          )}
        </div>

        {/* Right side */}
        <div style={{ flex: "0 0 auto", display: "flex", alignItems: "center" }}>
          {!hasMission && (
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGenerate}
              style={{
                position: "relative",
                overflow: "hidden",
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                border: "none",
                color: "#fff",
                borderRadius: 14,
                padding: "14px 26px",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
                animation: "missionSparkle 2s ease-in-out infinite",
              }}
            >
              <span style={{ position: "relative", zIndex: 1 }}>
                Unlock Today&apos;s Mission ✨
              </span>
            </motion.button>
          )}

          {hasMission && !isCompleted && (
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              onClick={onComplete}
              style={{
                position: "relative",
                overflow: "hidden",
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                border: "none",
                color: "#fff",
                borderRadius: 14,
                padding: "14px 26px",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
                animation: "missionPulse 2s ease-in-out infinite",
              }}
            >
              Mark Complete ✨
            </motion.button>
          )}

          {hasMission && isCompleted && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "linear-gradient(135deg, #dcfce7, #bbf7d0)",
                color: "#166534",
                fontWeight: 700,
                fontSize: 14,
                padding: "12px 22px",
                borderRadius: 14,
                whiteSpace: "nowrap",
                border: "1.5px solid #86efac",
                boxShadow: "0 2px 12px rgba(34,197,94,0.15)",
              }}
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
                style={{ fontSize: 16 }}
              >
                ✓
              </motion.span>
              Mission Complete +20 XP
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
