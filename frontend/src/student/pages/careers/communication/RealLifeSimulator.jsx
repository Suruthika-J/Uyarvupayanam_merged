import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMapPin, FiArrowLeft, FiCheck } from "react-icons/fi";

const LOCATIONS = [
  { key: "Classroom", emoji: "🏫", gradient: "linear-gradient(135deg, #dbeafe, #bfdbfe)", accent: "#3b82f6" },
  { key: "Library", emoji: "📚", gradient: "linear-gradient(135deg, #ede9fe, #ddd6fe)", accent: "#8b5cf6" },
  { key: "Playground", emoji: "⚽", gradient: "linear-gradient(135deg, #ffedd5, #fed7aa)", accent: "#f97316" },
  { key: "School Bus", emoji: "🚌", gradient: "linear-gradient(135deg, #fef3c7, #fde68a)", accent: "#eab308" },
  { key: "Lunch Hall", emoji: "🍱", gradient: "linear-gradient(135deg, #fce7f3, #fbcfe8)", accent: "#ec4899" },
  { key: "Home", emoji: "🏡", gradient: "linear-gradient(135deg, #dcfce7, #bbf7d0)", accent: "#22c55e" },
];

const PASS_THRESHOLD = 6;

const locationAccentColors = {
  Classroom: "#3b82f6",
  Library: "#8b5cf6",
  Playground: "#f97316",
  "School Bus": "#eab308",
  "Lunch Hall": "#ec4899",
  Home: "#22c55e",
};

export default function RealLifeSimulator({ scenarios = {}, onComplete }) {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [completedScenarios, setCompletedScenarios] = useState({});

  const totalCompleted = useMemo(
    () =>
      Object.values(completedScenarios).reduce((sum, count) => sum + count, 0),
    [completedScenarios]
  );

  const locationScenarios = selectedLocation
    ? scenarios[selectedLocation] || []
    : [];

  const currentScenario = locationScenarios[scenarioIndex] || null;

  const remainingCount = selectedLocation
    ? locationScenarios.length - (completedScenarios[selectedLocation] || 0)
    : 0;

  const handleSelectLocation = useCallback(
    (locKey) => {
      setSelectedLocation(locKey);
      setScenarioIndex(0);
      setAnswered(false);
      setSelectedOption(null);
    },
    []
  );

  const handleExitLocation = useCallback(() => {
    setSelectedLocation(null);
    setScenarioIndex(0);
    setAnswered(false);
    setSelectedOption(null);
  }, []);

  const handleAnswer = useCallback((option) => {
    setAnswered(true);
    setSelectedOption(option);
  }, []);

  const handleTryAgain = useCallback(() => {
    setAnswered(false);
    setSelectedOption(null);
  }, []);

  const handleNextScenario = useCallback(() => {
    setCompletedScenarios((prev) => ({
      ...prev,
      [selectedLocation]: (prev[selectedLocation] || 0) + 1,
    }));

    const newTotal =
      totalCompleted + 1;

    if (newTotal >= PASS_THRESHOLD) {
      if (onComplete) onComplete();
    }

    setScenarioIndex((prev) => prev + 1);
    setAnswered(false);
    setSelectedOption(null);
  }, [selectedLocation, totalCompleted, onComplete]);

  const handleReturnToMap = useCallback(() => {
    if (onComplete && totalCompleted >= PASS_THRESHOLD) {
      onComplete();
    }
    handleExitLocation();
  }, [onComplete, totalCompleted, handleExitLocation]);

  const currentLocData = LOCATIONS.find((l) => l.key === selectedLocation) || LOCATIONS[0];

  const progressPercent = Math.min((totalCompleted / PASS_THRESHOLD) * 100, 100);
  const isComplete = totalCompleted >= PASS_THRESHOLD;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{ maxWidth: 820, margin: "0 auto", fontFamily: "'Segoe UI', system-ui, sans-serif" }}
    >
      {/* Header Section */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: "linear-gradient(135deg, #3b82f6, #2563eb)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 18,
              fontWeight: 900,
              boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
              flexShrink: 0,
            }}
          >
            05
          </motion.div>
          <div>
            <h2
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: "#0f172a",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Real Life School Simulator
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "#64748b",
                margin: "2px 0 0 0",
                lineHeight: 1.5,
              }}
            >
              Pick a school spot and explore real-life conversations!
            </p>
          </div>
        </div>

        {/* Instruction pill */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "#f1f5f9",
            borderRadius: 12,
            padding: "10px 16px",
            fontSize: 13.5,
            color: "#475569",
            marginBottom: 16,
          }}
        >
          <span style={{ fontSize: 22 }}>🏫</span>
          <span>Select a location on the school map to experience a communication scenario. Complete at least <strong style={{ color: "#2563eb" }}>{PASS_THRESHOLD} scenarios</strong> to pass!</span>
        </motion.div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: isComplete ? "#166534" : "#64748b" }}>
            {totalCompleted}/{PASS_THRESHOLD} scenarios completed
          </span>
          {isComplete && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: "#166534",
                background: "#dcfce7",
                padding: "4px 12px",
                borderRadius: 999,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <FiCheck size={12} /> Passed!
            </motion.span>
          )}
        </div>
        <div
          style={{
            width: "100%",
            height: 10,
            background: "#e2e8f0",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              height: "100%",
              background: isComplete
                ? "linear-gradient(90deg, #22c55e, #16a34a)"
                : "linear-gradient(90deg, #3b82f6, #60a5fa)",
              borderRadius: 999,
              boxShadow: isComplete
                ? "0 0 12px rgba(34,197,94,0.4)"
                : "0 0 12px rgba(59,130,246,0.3)",
            }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!selectedLocation ? (
          /* ── Location Selection Grid ── */
          <motion.div
            key="map"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 18,
            }}
          >
            {LOCATIONS.map((loc, i) => {
              const count = completedScenarios[loc.key] || 0;
              const isFullyDone = count > 0;
              return (
                <motion.button
                  key={loc.key}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08, ease: "easeOut" }}
                  whileHover={{ y: -8, boxShadow: "0 16px 32px -6px rgba(0,0,0,0.12)" }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleSelectLocation(loc.key)}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    padding: "32px 20px 24px",
                    borderRadius: 22,
                    border: "1px solid #e2e8f0",
                    background: "#fff",
                    textAlign: "center",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  {/* Top accent line */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: loc.gradient,
                      borderRadius: "22px 22px 0 0",
                    }}
                  />

                  {/* Completed checkmark overlay */}
                  {isFullyDone && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      style={{
                        position: "absolute",
                        top: 14,
                        right: 14,
                        width: 26,
                        height: 26,
                        borderRadius: 999,
                        background: "#22c55e",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 8px rgba(34,197,94,0.4)",
                      }}
                    >
                      <FiCheck size={14} color="#fff" strokeWidth={3} />
                    </motion.div>
                  )}

                  {/* Emoji in gradient circle */}
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 999,
                      background: loc.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 44,
                      boxShadow: `0 6px 16px -2px ${loc.accent}33`,
                    }}
                  >
                    {loc.emoji}
                  </div>

                  {/* Location name */}
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 800,
                      color: "#0f172a",
                    }}
                  >
                    {loc.key}
                  </div>

                  {/* Counter */}
                  <div
                    style={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: count > 0 ? "#166534" : "#94a3b8",
                      background: count > 0 ? "#dcfce7" : "#f1f5f9",
                      padding: "5px 14px",
                      borderRadius: 999,
                    }}
                  >
                    {count > 0 ? `${count} completed` : "Tap to start"}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        ) : (
          /* ── Scenario View ── */
          <motion.div
            key={`scenario-${selectedLocation}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Location header bar with gradient */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                position: "relative",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: currentLocData.gradient,
                borderRadius: 20,
                padding: "18px 24px",
                marginBottom: 22,
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              {/* Subtle background circles */}
              <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: 999, background: "rgba(255,255,255,0.2)" }} />
              <div style={{ position: "absolute", bottom: -15, left: 30, width: 50, height: 50, borderRadius: 999, background: "rgba(255,255,255,0.15)" }} />

              <div style={{ display: "flex", alignItems: "center", gap: 10, zIndex: 1 }}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleExitLocation}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    border: "none",
                    background: "rgba(255,255,255,0.5)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <FiArrowLeft size={18} color="#1e293b" />
                </motion.button>
                <div>
                  <div style={{ fontSize: 12, color: "#475569", fontWeight: 600, lineHeight: 1 }}>
                    📍 Location
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", lineHeight: 1.3 }}>
                    {currentLocData.emoji} {selectedLocation}
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExitLocation}
                style={{
                  background: "rgba(255,255,255,0.55)",
                  backdropFilter: "blur(4px)",
                  border: "1.5px solid rgba(0,0,0,0.08)",
                  color: "#475569",
                  borderRadius: 12,
                  padding: "8px 18px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  zIndex: 1,
                }}
              >
                Exit Location
              </motion.button>
            </motion.div>

            {/* No more scenarios in this location */}
            {!currentScenario ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                style={{
                  background: "#fff",
                  borderRadius: 24,
                  padding: "48px 32px",
                  textAlign: "center",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 20px -4px rgba(0,0,0,0.06)",
                }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                  style={{ fontSize: 56, marginBottom: 16 }}
                >
                  🎉
                </motion.div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 8px 0" }}>
                  All scenarios here are done!
                </h3>
                <p style={{ fontSize: 15, color: "#64748b", margin: "0 0 28px 0" }}>
                  Great work exploring <strong>{selectedLocation}</strong>! Try another location to keep going.
                </p>
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: "0 8px 24px -4px rgba(37,99,235,0.4)" }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleReturnToMap}
                  style={{
                    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 14,
                    padding: "14px 32px",
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(37,99,235,0.3)",
                  }}
                >
                  Return to Map
                </motion.button>
              </motion.div>
            ) : (
              /* Scenario card */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                style={{
                  background: "#fff",
                  borderRadius: 24,
                  padding: "32px 28px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 20px -4px rgba(0,0,0,0.06)",
                  borderLeft: `5px solid ${locationAccentColors[selectedLocation] || "#3b82f6"}`,
                }}
              >
                {/* Title */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: currentLocData.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    {currentLocData.emoji}
                  </div>
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: "#0f172a",
                      margin: 0,
                    }}
                  >
                    {currentScenario.title}
                  </h3>
                </div>

                {/* Question */}
                <p
                  style={{
                    fontSize: 16,
                    color: "#334155",
                    lineHeight: 1.7,
                    margin: "10px 0 24px 0",
                    padding: "12px 16px",
                    background: "#f8fafc",
                    borderRadius: 14,
                    borderLeft: `3px solid ${locationAccentColors[selectedLocation] || "#3b82f6"}44`,
                  }}
                >
                  {currentScenario.question}
                </p>

                {/* Options */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {currentScenario.options.map((option, idx) => {
                    const isSelected = answered && selectedOption === option;
                    const isCorrectOption = answered && option.correct;
                    const isWrongSelected = isSelected && !option.correct;
                    const isCorrectSelected = isSelected && option.correct;

                    let optionBg = "#fff";
                    let optionBorder = "1.5px solid #e2e8f0";
                    let optionColor = "#1e293b";

                    if (isCorrectSelected) {
                      optionBg = "linear-gradient(135deg, #dcfce7, #bbf7d0)";
                      optionBorder = "2px solid #22c55e";
                      optionColor = "#166534";
                    } else if (isWrongSelected) {
                      optionBg = "linear-gradient(135deg, #fee2e2, #fecaca)";
                      optionBorder = "2px solid #ef4444";
                      optionColor = "#991b1b";
                    } else if (isCorrectOption) {
                      optionBg = "#f0fdf4";
                      optionBorder = "2px solid #86efac";
                    }

                    return (
                      <motion.button
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        whileHover={
                          !answered ? { y: -3, boxShadow: "0 8px 20px -4px rgba(0,0,0,0.08)" } : {}
                        }
                        whileTap={!answered ? { scale: 0.98 } : {}}
                        onClick={() => !answered && handleAnswer(option)}
                        disabled={answered}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          padding: "16px 18px",
                          borderRadius: 16,
                          border: optionBorder,
                          background: optionBg,
                          textAlign: "left",
                          fontSize: 15,
                          color: optionColor,
                          fontWeight: 600,
                          cursor: answered ? "default" : "pointer",
                          transition: "all 0.25s ease",
                          opacity: answered && !isSelected && !isCorrectOption ? 0.5 : 1,
                        }}
                      >
                        {/* Number badge */}
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 999,
                            background: isCorrectSelected
                              ? "#22c55e"
                              : isWrongSelected
                              ? "#ef4444"
                              : `${locationAccentColors[selectedLocation] || "#3b82f6"}18`,
                            color: isCorrectSelected || isWrongSelected
                              ? "#fff"
                              : locationAccentColors[selectedLocation] || "#3b82f6",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 13,
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          {isCorrectSelected ? (
                            <FiCheck size={16} strokeWidth={3} />
                          ) : isWrongSelected ? (
                            "✕"
                          ) : (
                            idx + 1
                          )}
                        </div>
                        <span style={{ flex: 1 }}>{option.text}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Feedback */}
                <AnimatePresence>
                  {answered && selectedOption && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      style={{
                        marginTop: 22,
                        padding: "20px 24px",
                        borderRadius: 18,
                        background: selectedOption.correct
                          ? "linear-gradient(135deg, #ecfdf5, #d1fae5)"
                          : "linear-gradient(135deg, #fef2f2, #fee2e2)",
                        border: selectedOption.correct
                          ? "1.5px solid #a7f3d0"
                          : "1.5px solid #fecaca",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 17,
                          fontWeight: 800,
                          color: selectedOption.correct ? "#065f46" : "#991b1b",
                          marginBottom: 6,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        {selectedOption.correct ? (
                          <>
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, delay: 0.1 }}
                            >
                              🌟
                            </motion.span>
                            Great job!
                          </>
                        ) : (
                          <>
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, delay: 0.1 }}
                            >
                              ❌
                            </motion.span>
                            Not quite
                          </>
                        )}
                      </div>
                      <p
                        style={{
                          fontSize: 14.5,
                          color: selectedOption.correct ? "#047857" : "#b91c1c",
                          margin: 0,
                          lineHeight: 1.65,
                        }}
                      >
                        {selectedOption.feedback}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action buttons */}
                <div
                  style={{
                    marginTop: 22,
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  {answered && !selectedOption?.correct && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.04, boxShadow: "0 6px 16px -2px rgba(0,0,0,0.08)" }}
                      whileTap={{ scale: 0.96 }}
                      onClick={handleTryAgain}
                      style={{
                        background: "#fff",
                        border: "2px solid #e2e8f0",
                        borderRadius: 14,
                        padding: "12px 26px",
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#64748b",
                        cursor: "pointer",
                      }}
                    >
                      Try Another Choice
                    </motion.button>
                  )}

                  {answered && selectedOption?.correct && (
                    <>
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.04, boxShadow: "0 8px 24px -4px rgba(16,185,129,0.4)" }}
                        whileTap={{ scale: 0.96 }}
                        onClick={handleNextScenario}
                        style={{
                          background: "linear-gradient(135deg, #22c55e, #16a34a)",
                          border: "none",
                          borderRadius: 14,
                          padding: "12px 28px",
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#fff",
                          cursor: "pointer",
                          boxShadow: "0 4px 16px rgba(34,197,94,0.3)",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        Next Scenario
                        <span style={{ fontSize: 16 }}>→</span>
                      </motion.button>
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 }}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={handleReturnToMap}
                        style={{
                          background: "#fff",
                          border: "2px solid #e2e8f0",
                          borderRadius: 14,
                          padding: "12px 26px",
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#64748b",
                          cursor: "pointer",
                        }}
                      >
                        Return to Map
                      </motion.button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
