import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const VIDEO_THUMBNAIL =
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=1200";

const VIDEO_URL = "https://www.youtube.com/embed/Z8QxVUGCsoc?autoplay=1";

const takeaways = [
  "Communication helps us make friends and build trust",
  "Listening is just as important as speaking",
  "We can communicate with words, gestures, and expressions",
  "Good communicators are confident and kind",
  "Practice makes our communication skills stronger",
];

const sparklePositions = [
  { top: "8%", left: "10%", delay: 0 },
  { top: "5%", right: "15%", delay: 0.3 },
  { bottom: "12%", left: "20%", delay: 0.6 },
  { bottom: "8%", right: "10%", delay: 0.9 },
  { top: "40%", left: "5%", delay: 1.2 },
  { top: "35%", right: "8%", delay: 0.45 },
];

export default function LearningVideo({ videoWatched, onComplete, isCompleted }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div style={{ maxWidth: 780, margin: "0 auto" }}>
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 28,
        }}
      >
        {/* Step number badge */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            background: "linear-gradient(135deg, #059669, #10b981)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            fontWeight: 900,
            color: "#fff",
            boxShadow: "0 4px 16px rgba(5,150,105,0.35)",
            flexShrink: 0,
          }}
        >
          01
        </div>
        <div>
          <h2
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: "#065f46",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Watch & Learn
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "#6b7280",
              margin: "2px 0 0 0",
              fontWeight: 500,
            }}
          >
            Watch the video and discover how communication works
          </p>
        </div>
      </motion.div>

      {/* Video card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 9",
          borderRadius: 28,
          overflow: "hidden",
          background: "#111827",
          boxShadow:
            "0 16px 48px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        {playing ? (
          <iframe
            title="Learning Video"
            src={VIDEO_URL}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              display: "block",
            }}
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : (
          <>
            {/* Thumbnail image */}
            <img
              src={VIDEO_THUMBNAIL}
              alt="Students learning in classroom"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />

            {/* Gradient overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.65) 100%)",
              }}
            />

            {/* Play button area */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Animated pulse ring */}
              <motion.div
                animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: "absolute",
                  width: 90,
                  height: 90,
                  borderRadius: "50%",
                  border: "3px solid rgba(255,255,255,0.4)",
                  pointerEvents: "none",
                }}
              />

              {/* Second pulse ring with offset */}
              <motion.div
                animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.6,
                }}
                style={{
                  position: "absolute",
                  width: 90,
                  height: 90,
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.25)",
                  pointerEvents: "none",
                }}
              />

              {/* Play button */}
              <motion.button
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPlaying(true)}
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow:
                    "0 8px 32px rgba(239,68,68,0.55), 0 0 60px rgba(239,68,68,0.2)",
                  position: "relative",
                  zIndex: 2,
                }}
                aria-label="Play video"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="#fff"
                  width={36}
                  height={36}
                  style={{ marginLeft: 5 }}
                >
                  <polygon points="6,3 20,12 6,21" />
                </svg>
              </motion.button>
            </div>

            {/* Video title overlay at bottom */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "20px 28px",
                background:
                  "linear-gradient(180deg, transparent, rgba(0,0,0,0.7))",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  borderRadius: 14,
                  padding: "10px 20px",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <span style={{ fontSize: 20 }}>▶</span>
                <span
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "#fff",
                    textShadow: "0 1px 4px rgba(0,0,0,0.3)",
                  }}
                >
                  What is Communication?
                </span>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Key Takeaways card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        style={{
          marginTop: 24,
          background:
            "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #d1fae5 100%)",
          borderRadius: 22,
          padding: "24px 28px 24px 32px",
          borderLeft: "4px solid transparent",
          borderImage:
            "linear-gradient(180deg, #10b981, #059669) 1",
          borderImageSlice: 1,
          boxShadow:
            "0 4px 20px rgba(16,185,129,0.1), 0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <span style={{ fontSize: 24 }}>📖</span>
          <h3
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "#065f46",
              margin: 0,
            }}
          >
            Today&apos;s Learning
          </h3>
        </div>

        {/* Learning points */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {takeaways.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.08 }}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 8,
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  width={14}
                  height={14}
                >
                  <path
                    d="M3.5 8.5L6.5 11.5L12.5 4.5"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span
                style={{
                  fontSize: 15,
                  color: "#047857",
                  lineHeight: 1.55,
                  fontWeight: 500,
                }}
              >
                {point}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Completion state */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        style={{
          marginTop: 24,
          textAlign: "center",
          position: "relative",
        }}
      >
        <AnimatePresence mode="wait">
          {isCompleted ? (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                background:
                  "linear-gradient(135deg, #d1fae5, #a7f3d0)",
                color: "#065f46",
                fontWeight: 800,
                fontSize: 17,
                padding: "16px 32px",
                borderRadius: 20,
                boxShadow:
                  "0 6px 24px rgba(16,185,129,0.25), 0 0 48px rgba(52,211,153,0.15)",
                position: "relative",
                border: "2px solid rgba(16,185,129,0.3)",
              }}
            >
              {/* Animated checkmark */}
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.2,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  background:
                    "linear-gradient(135deg, #10b981, #059669)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  width={20}
                  height={20}
                >
                  <path
                    d="M4 10.5L8.5 15L16 5"
                    stroke="#fff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.div>
              Section Complete!

              {/* Sparkle decorations */}
              {sparklePositions.map((pos, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1.2, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: 0.4 + pos.delay,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                  style={{
                    position: "absolute",
                    top: pos.top,
                    bottom: pos.bottom,
                    left: pos.left,
                    right: pos.right,
                    fontSize: 16,
                    pointerEvents: "none",
                  }}
                >
                  ✨
                </motion.span>
              ))}
            </motion.div>
          ) : (
            <motion.button
              key="incomplete"
              whileHover={{
                scale: 1.04,
                boxShadow:
                  "0 8px 32px rgba(16,185,129,0.45), 0 0 48px rgba(52,211,153,0.2)",
              }}
              whileTap={{ scale: 0.97 }}
              onClick={onComplete}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                background: videoWatched
                  ? "linear-gradient(135deg, #10b981, #059669)"
                  : "linear-gradient(135deg, #d1d5db, #9ca3af)",
                color: "#fff",
                border: "none",
                borderRadius: 18,
                padding: "16px 36px",
                fontSize: 17,
                fontWeight: 800,
                cursor: videoWatched ? "pointer" : "not-allowed",
                boxShadow: videoWatched
                  ? "0 6px 24px rgba(16,185,129,0.35)"
                  : "0 2px 8px rgba(0,0,0,0.08)",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                letterSpacing: 0.3,
                transition: "background 0.3s ease",
              }}
              disabled={!videoWatched}
            >
              <svg
                viewBox="0 0 20 20"
                fill="none"
                width={20}
                height={20}
              >
                <path
                  d="M4 10.5L8.5 15L16 5"
                  stroke="#fff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Mark as Complete
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
