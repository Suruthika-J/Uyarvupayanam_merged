import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";

const GRADIENTS = [
  "linear-gradient(135deg, #3b82f6, #1d4ed8)",
  "linear-gradient(135deg, #10b981, #059669)",
  "linear-gradient(135deg, #8b5cf6, #6d28d9)",
  "linear-gradient(135deg, #ec4899, #db2777)",
  "linear-gradient(135deg, #f97316, #ea580c)",
  "linear-gradient(135deg, #14b8a6, #0d9488)",
  "linear-gradient(135deg, #6366f1, #4f46e5)",
  "linear-gradient(135deg, #f59e0b, #d97706)",
];

const BORDER_COLORS = [
  "#3b82f6",
  "#10b981",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#14b8a6",
  "#6366f1",
  "#f59e0b",
];

export default function CommunicationTips({ tips }) {
  const [flippedTips, setFlippedTips] = useState({});

  const toggleFlip = (index) => {
    setFlippedTips((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 900,
            color: "#0f172a",
            margin: "0 0 8px 0",
          }}
        >
          💡 Communication Tips
        </h2>
        <p
          style={{
            fontSize: 15,
            color: "#94a3b8",
            margin: 0,
            fontWeight: 600,
          }}
        >
          Click any card to reveal the secret!
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 20,
        }}
      >
        {tips.map((tip, index) => {
          const flipped = !!flippedTips[index];
          const gradient = GRADIENTS[index % GRADIENTS.length];
          const borderColor = BORDER_COLORS[index % BORDER_COLORS.length];

          return (
            <div
              key={index}
              onClick={() => toggleFlip(index)}
              style={{
                height: 180,
                cursor: "pointer",
                perspective: 1000,
              }}
            >
              <motion.div
                animate={{
                  rotateY: flipped ? 180 : 0,
                }}
                transition={{
                  duration: 0.6,
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                }}
                whileHover={
                  !flipped
                    ? {
                        y: -6,
                        boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                      }
                    : {}
                }
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Front Face */}
                <div
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    backfaceVisibility: "hidden",
                    background: gradient,
                    borderRadius: 24,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    padding: 24,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    overflow: "hidden",
                  }}
                >
                  <motion.div
                    animate={{
                      y: [0, -6, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{ fontSize: 14, lineHeight: 1 }}
                  >
                    <span style={{ fontSize: 40, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}>
                      {tip.front.match(/^[\p{Emoji}]+/u)?.[0] || "💡"}
                    </span>
                  </motion.div>
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: "#fff",
                      lineHeight: 1.4,
                      marginTop: 12,
                      textShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }}
                  >
                    {tip.front.replace(/^[\p{Emoji}]+\s*/u, "")}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.7)",
                      marginTop: "auto",
                      fontWeight: 700,
                    }}
                  >
                    Tap to flip ↻
                  </span>
                </div>

                {/* Back Face */}
                <div
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    background: "#fff",
                    borderRadius: 24,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    padding: 24,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    borderLeft: `5px solid ${borderColor}`,
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      color: "#334155",
                      lineHeight: 1.7,
                      fontWeight: 600,
                    }}
                  >
                    {tip.back}
                  </span>
                  <div
                    style={{
                      marginTop: "auto",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      color: "#16a34a",
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    <FiCheck size={16} />
                    Got it! ✓
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
