import React from "react";
import { motion } from "framer-motion";
import { FiStar, FiLock } from "react-icons/fi";

const SKILLS = [
  { key: "speakingConfidence", name: "Speaking Confidence", gradient: "linear-gradient(135deg, #10b981, #059669)" },
  { key: "listening", name: "Listening", gradient: "linear-gradient(135deg, #3b82f6, #2563eb)" },
  { key: "empathy", name: "Empathy", gradient: "linear-gradient(135deg, #ec4899, #db2777)" },
  { key: "observation", name: "Observation", gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)" },
  { key: "confidence", name: "Confidence", gradient: "linear-gradient(135deg, #f59e0b, #d97706)" },
  { key: "respect", name: "Respect", gradient: "linear-gradient(135deg, #f43f5e, #e11d48)" },
  { key: "leadership", name: "Leadership", gradient: "linear-gradient(135deg, #14b8a6, #0d9488)" },
];

function MilestoneDot({ position }) {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: `${position}%`,
        transform: "translate(-50%, -50%)",
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: "#e2e8f0",
        border: "1.5px solid #cbd5e1",
      }}
    />
  );
}

export default function SkillProgressSidebar({ student, progress, badges }) {
  const initial = student?.name?.[0]?.toUpperCase() || "S";

  return (
    <div style={{ position: "sticky", top: 40, display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Student Profile Card */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)",
          color: "#fff",
          padding: 28,
          borderRadius: 28,
          boxShadow: "0 12px 24px -6px rgba(37,99,235,0.25)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative floating circles */}
        <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <div style={{ position: "absolute", bottom: -30, left: -10, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", top: "40%", right: "15%", width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

        {/* Avatar & Name */}
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20, position: "relative" }}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "grid",
              placeItems: "center",
              fontSize: 28,
              fontWeight: 900,
              border: "2px solid rgba(255,255,255,0.3)",
              flexShrink: 0,
            }}
          >
            {initial}
          </motion.div>
          <div>
            <h4 style={{ fontSize: 18, fontWeight: 800, margin: 0, lineHeight: 1.3 }}>
              {student?.name || "Student"}
            </h4>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                marginTop: 6,
                background: "rgba(255,255,255,0.15)",
                borderRadius: 20,
                padding: "3px 10px",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              🔥 {progress?.streak || 0} Days
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.15)",
            paddingTop: 16,
            position: "relative",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.6)",
                textTransform: "uppercase",
                fontWeight: 800,
                letterSpacing: 0.5,
              }}
            >
              Level
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.2 }}>
              {progress?.level || 1}
            </div>
          </div>
          <div
            style={{
              width: 1,
              background: "rgba(255,255,255,0.15)",
            }}
          />
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.6)",
                textTransform: "uppercase",
                fontWeight: 800,
                letterSpacing: 0.5,
              }}
            >
              Total XP
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.2 }}>
              {progress?.xp || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Badges Card */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #f1f5f9",
          padding: 24,
          borderRadius: 28,
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <h5
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: "#1e293b",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            🏆 Badges
          </h5>
          {badges && badges.length > 0 && (
            <span
              style={{
                background: "#f5f3ff",
                color: "#7c3aed",
                borderRadius: 12,
                padding: "2px 10px",
                fontSize: 12,
                fontWeight: 800,
                border: "1px solid #ddd6fe",
              }}
            >
              {badges.length}
            </span>
          )}
        </div>

        {(!badges || badges.length === 0) ? (
          <div
            style={{
              textAlign: "center",
              padding: "20px 0",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "#f8fafc",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
                border: "2px dashed #e2e8f0",
              }}
            >
              <FiLock size={20} style={{ color: "#94a3b8" }} />
            </div>
            <p
              style={{
                fontSize: 13,
                color: "#94a3b8",
                margin: 0,
                fontWeight: 600,
              }}
            >
              Start your journey!
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {badges.map((b, index) => (
              <motion.div
                key={b}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 300, damping: 20 }}
                whileHover={{ scale: 1.08, boxShadow: "0 4px 12px rgba(139,92,246,0.2)" }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "6px 12px",
                  background: "linear-gradient(135deg, #f5f3ff, #ede9fe)",
                  color: "#6d28d9",
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 800,
                  border: "1px solid #ddd6fe",
                  cursor: "default",
                }}
              >
                <FiStar size={12} style={{ color: "#7c3aed" }} />
                {b}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Skill Progression Card */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #f1f5f9",
          padding: 24,
          borderRadius: 28,
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}
      >
        <h5
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: "#1e293b",
            margin: "0 0 20px 0",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          📊 Skill Progression
        </h5>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {SKILLS.map((skill, index) => {
            const pct = progress?.[skill.key] || 10;
            return (
              <motion.div
                key={skill.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#475569",
                    marginBottom: 6,
                  }}
                >
                  <span>{skill.name}</span>
                  <span style={{ fontWeight: 900 }}>{pct}%</span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: 10,
                    borderRadius: 99,
                    background: "#f1f5f9",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  {/* Milestone markers */}
                  <MilestoneDot position={25} />
                  <MilestoneDot position={50} />
                  <MilestoneDot position={75} />

                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{
                      duration: 1,
                      delay: 0.2 + index * 0.08,
                      ease: "easeOut",
                    }}
                    style={{
                      height: "100%",
                      background: skill.gradient,
                      borderRadius: 99,
                      position: "relative",
                      zIndex: 1,
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
