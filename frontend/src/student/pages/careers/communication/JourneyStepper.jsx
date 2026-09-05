import React from "react";
import { motion } from "framer-motion";
import { FiCheck, FiLock, FiMap } from "react-icons/fi";

const completedGradient = "linear-gradient(135deg, #10b981, #059669)";
const activeGradient = "linear-gradient(135deg, #3b82f6, #2563eb)";
const lockedBg = "#e2e8f0";

export default function JourneyStepper({
  steps,
  completedSteps,
  activeStep,
  onStepClick,
}) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: 28,
        padding: 3,
        marginBottom: 40,
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: 25,
          padding: "28px 32px",
          boxShadow:
            "0 20px 60px -12px rgba(102, 126, 234, 0.25), 0 0 0 1px rgba(255,255,255,0.1) inset",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* subtle decorative circles */}
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, rgba(102,126,234,0.08), rgba(118,75,162,0.08))",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -30,
            left: -30,
            width: 90,
            height: 90,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, rgba(16,185,129,0.06), rgba(5,150,105,0.06))",
            pointerEvents: "none",
          }}
        />

        {/* Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 28,
          }}
        >
          <span style={{ fontSize: 26 }}>🗺️</span>
          <h4
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: "#8b5cf6",
              textTransform: "uppercase",
              letterSpacing: 2,
              margin: 0,
            }}
          >
            Your Communication Journey
          </h4>
          <div
            style={{
              marginLeft: "auto",
              background:
                "linear-gradient(135deg, #f0fdf4, #dcfce7)",
              color: "#16a34a",
              padding: "5px 14px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 0.5,
            }}
          >
            {completedSteps.length} / {steps.length} Done
          </div>
        </div>

        {/* Scrollable timeline */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 0,
            overflowX: "auto",
            paddingBottom: 12,
            scrollSnapType: "x mandatory",
            scrollbarWidth: "none",
          }}
        >
          {steps.map((step, idx) => {
            const isCompleted = completedSteps.includes(step.id);
            const isUnlocked =
              idx === 0 || completedSteps.includes(steps[idx - 1].id);
            const isActive = activeStep === step.id;
            const isLast = idx === steps.length - 1;

            const circleBg = isCompleted
              ? completedGradient
              : isActive
                ? activeGradient
                : lockedBg;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1, type: "spring", stiffness: 200 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  minWidth: 130,
                  flex: isLast ? "none" : "1",
                  scrollSnapAlign: "center",
                  position: "relative",
                  cursor: isUnlocked ? "pointer" : "not-allowed",
                }}
                onClick={() => isUnlocked && onStepClick(step.id)}
              >
                {/* connecting line before */}
                {idx > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: 30,
                      right: "50%",
                      width: "100%",
                      height: 4,
                      borderRadius: 2,
                      background: isCompleted
                        ? completedGradient
                        : isActive
                          ? "linear-gradient(90deg, #10b981, #3b82f6)"
                          : "#e2e8f0",
                      zIndex: 0,
                      transform: "translateX(50%)",
                      marginLeft: "-50%",
                      transition: "background 0.5s ease",
                    }}
                  />
                )}

                {/* circle node */}
                <motion.div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    background: circleBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    zIndex: 2,
                    boxShadow: isCompleted
                      ? "0 0 20px rgba(16,185,129,0.4), 0 4px 12px rgba(16,185,129,0.3)"
                      : isActive
                        ? "0 0 24px rgba(59,130,246,0.4), 0 4px 12px rgba(59,130,246,0.3)"
                        : "0 2px 8px rgba(0,0,0,0.08)",
                    opacity: isUnlocked ? 1 : 0.5,
                    transition: "all 0.3s ease",
                  }}
                  whileHover={
                    isUnlocked
                      ? { scale: 1.15, boxShadow: "0 6px 24px rgba(0,0,0,0.15)" }
                      : {}
                  }
                  animate={
                    isActive
                      ? {
                          boxShadow: [
                            "0 0 0 0 rgba(59,130,246,0.4)",
                            "0 0 0 12px rgba(59,130,246,0)",
                            "0 0 24px rgba(59,130,246,0.4)",
                          ],
                        }
                      : {}
                  }
                  transition={
                    isActive
                      ? { boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" } }
                      : {}
                  }
                >
                  {isCompleted ? (
                    <FiCheck size={24} color="#fff" strokeWidth={3} />
                  ) : isActive ? (
                    <FiMap size={22} color="#fff" strokeWidth={2.5} />
                  ) : (
                    <FiLock size={18} color="#94a3b8" strokeWidth={2.5} />
                  )}

                  {/* active ring */}
                  {isActive && (
                    <motion.div
                      style={{
                        position: "absolute",
                        inset: -6,
                        borderRadius: "50%",
                        border: "3px solid rgba(59,130,246,0.3)",
                        pointerEvents: "none",
                      }}
                      animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                </motion.div>

                {/* step emoji */}
                <motion.div
                  style={{
                    fontSize: 22,
                    marginTop: 10,
                    opacity: isUnlocked ? 1 : 0.4,
                  }}
                  animate={isCompleted ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  {isCompleted ? "✅" : step.emoji}
                </motion.div>

                {/* label */}
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: isActive ? "#1e293b" : isCompleted ? "#059669" : "#94a3b8",
                    marginTop: 6,
                    textAlign: "center",
                    lineHeight: 1.3,
                  }}
                >
                  {step.label}
                </div>

                {/* desc */}
                <div
                  style={{
                    fontSize: 11,
                    color: "#94a3b8",
                    marginTop: 3,
                    textAlign: "center",
                    lineHeight: 1.3,
                    maxWidth: 110,
                    opacity: isUnlocked ? 1 : 0.5,
                  }}
                >
                  {step.desc}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
