import React from "react";
import { motion } from "framer-motion";

const floatingCircles = [
  { w: 140, h: 140, top: "-5%", right: "8%", opacity: 0.08, delay: 0 },
  { w: 90, h: 90, top: "60%", right: "25%", opacity: 0.06, delay: 0.4 },
  { w: 180, h: 180, bottom: "-12%", right: "-3%", opacity: 0.05, delay: 0.8 },
  { w: 60, h: 60, top: "15%", right: "40%", opacity: 0.09, delay: 0.2 },
  { w: 110, h: 110, bottom: "10%", left: "60%", opacity: 0.07, delay: 0.6 },
  { w: 50, h: 50, top: "40%", left: "80%", opacity: 0.1, delay: 1.0 },
];

const floatingEmojis = [
  { emoji: "🗣️", top: "12%", right: "8%", size: 64, rotate: -12, delay: 0 },
  { emoji: "👂", bottom: "18%", right: "12%", size: 56, rotate: 18, delay: 0.3 },
  { emoji: "💬", top: "55%", right: "5%", size: 50, rotate: -22, delay: 0.6 },
  { emoji: "🌟", top: "8%", right: "28%", size: 44, rotate: 15, delay: 0.9 },
  { emoji: "🎯", bottom: "12%", right: "30%", size: 48, rotate: 25, delay: 1.2 },
];

const dotPatternStyle = {
  position: "absolute",
  inset: 0,
  backgroundImage:
    "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",
  backgroundSize: "24px 24px",
  pointerEvents: "none",
};

export default function WelcomeBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "relative",
        width: "100%",
        background:
          "linear-gradient(135deg, #059669 0%, #10b981 30%, #34d399 60%, #6ee7b7 100%)",
        borderRadius: 32,
        padding: "48px 48px 64px 48px",
        boxShadow:
          "0 12px 48px rgba(5,150,105,0.35), 0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.15)",
        overflow: "hidden",
        color: "#fff",
        minHeight: 340,
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Dot pattern overlay */}
      <div style={dotPatternStyle} />

      {/* Animated floating white circles */}
      {floatingCircles.map((c, i) => (
        <motion.div
          key={`circle-${i}`}
          animate={{ y: [0, -(8 + i * 3), 0] }}
          transition={{
            duration: 3.5 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: c.delay,
          }}
          style={{
            position: "absolute",
            width: c.w,
            height: c.h,
            borderRadius: "50%",
            background: "rgba(255,255,255,1)",
            opacity: c.opacity,
            top: c.top,
            right: c.right,
            bottom: c.bottom,
            left: c.left,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Content grid: text left, emojis right */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          gap: 40,
          flexWrap: "wrap",
        }}
      >
        {/* Left: Text content */}
        <div style={{ flex: "1 1 420px", maxWidth: 640 }}>
          {/* Badge chip */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderRadius: 999,
              padding: "8px 20px",
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 20,
              letterSpacing: 0.3,
              border: "1px solid rgba(255,255,255,0.25)",
              boxShadow:
                "0 0 20px rgba(255,255,255,0.15), 0 0 60px rgba(52,211,153,0.3)",
              animation: "pulseGlow 2.5s ease-in-out infinite",
            }}
          >
            <span style={{ fontSize: 16 }}>🎯</span>
            Tamil Nadu Class 5 • Interactive Learning Lab
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{
              fontSize: "clamp(36px, 5vw, 48px)",
              fontWeight: 900,
              margin: "0 0 10px 0",
              lineHeight: 1.1,
              textShadow:
                "0 2px 8px rgba(0,0,0,0.15), 0 4px 24px rgba(5,150,105,0.3)",
              letterSpacing: "-0.5px",
            }}
          >
            Communication Skills
          </motion.h1>

          {/* Subtitle with letter spacing */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            style={{
              fontSize: 20,
              color: "#d1fae5",
              margin: "0 0 18px 0",
              fontWeight: 700,
              letterSpacing: 4,
              textShadow: "0 1px 4px rgba(0,0,0,0.1)",
            }}
          >
            Learn • Speak • Listen • Express
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            style={{
              fontSize: 16,
              color: "rgba(255,255,255,0.9)",
              maxWidth: 560,
              lineHeight: 1.7,
              margin: 0,
              textShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            Communication is not only speaking — it is listening carefully,
            understanding others, and expressing your ideas politely and
            confidently. Let's become a Communication Hero! 🚀
          </motion.p>
        </div>

        {/* Right: Floating emoji illustration area */}
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            flex: "0 0 260px",
            height: 260,
            position: "relative",
            borderRadius: 28,
            background:
              "linear-gradient(160deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          }}
        >
          {floatingEmojis.map((item, i) => (
            <motion.span
              key={`emoji-${i}`}
              animate={{ y: [0, -12, 0] }}
              transition={{
                duration: 2.8 + i * 0.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: item.delay,
              }}
              style={{
                position: "absolute",
                top: item.top,
                bottom: item.bottom,
                right: item.right,
                fontSize: item.size,
                transform: `rotate(${item.rotate}deg)`,
                pointerEvents: "none",
                userSelect: "none",
                filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
              }}
            >
              {item.emoji}
            </motion.span>
          ))}

          {/* Center large speech emoji */}
          <span
            style={{
              fontSize: 72,
              filter: "drop-shadow(0 6px 16px rgba(0,0,0,0.15))",
              opacity: 0.9,
            }}
          >
            📣
          </span>
        </motion.div>
      </div>

      {/* Bottom decorative wave SVG */}
      <div
        style={{
          position: "absolute",
          bottom: -1,
          left: 0,
          width: "100%",
          lineHeight: 0,
          pointerEvents: "none",
        }}
      >
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: 60, display: "block" }}
          preserveAspectRatio="none"
        >
          <path
            d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
            fill="white"
            fillOpacity="0.12"
          />
          <path
            d="M0,55 C360,20 720,70 1080,35 C1260,20 1380,45 1440,55 L1440,80 L0,80 Z"
            fill="white"
            fillOpacity="0.08"
          />
        </svg>
      </div>

      {/* Inline keyframes for pulse glow */}
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(255,255,255,0.15), 0 0 60px rgba(52,211,153,0.3); }
          50% { box-shadow: 0 0 28px rgba(255,255,255,0.25), 0 0 80px rgba(52,211,153,0.5); }
        }
      `}</style>
    </motion.div>
  );
}
