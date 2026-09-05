import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck } from "react-icons/fi";

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const cardColors = ["#6366f1", "#8b5cf6", "#a855f7", "#ec4899", "#f43f5e", "#f97316"];

const ConversationBuilder = ({ conversationSets, onComplete }) => {
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [availableCards, setAvailableCards] = useState([]);
  const [placedCards, setPlacedCards] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const feedbackTimer = useRef(null);

  const currentSet = conversationSets[currentSetIndex];

  useEffect(() => {
    if (currentSet) {
      setAvailableCards(shuffleArray(currentSet.cards));
      setPlacedCards([]);
      setFeedback(null);
      setIsSuccess(false);
    }
  }, [currentSetIndex, currentSet]);

  useEffect(() => {
    return () => clearTimeout(feedbackTimer.current);
  }, []);

  const handleDragStart = useCallback((e, cardId) => {
    e.dataTransfer.setData("text/plain", cardId);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDropOnZone = useCallback(
    (e) => {
      e.preventDefault();
      const cardId = e.dataTransfer.getData("text/plain");
      if (!cardId) return;

      const card = availableCards.find((c) => c.id === cardId);
      if (!card) return;

      setAvailableCards((prev) => prev.filter((c) => c.id !== cardId));
      setPlacedCards((prev) => [...prev, card]);
      setFeedback(null);
    },
    [availableCards]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleRemoveFromPlaced = useCallback(
    (cardId) => {
      if (isSuccess) return;
      const card = placedCards.find((c) => c.id === cardId);
      if (!card) return;
      setPlacedCards((prev) => prev.filter((c) => c.id !== cardId));
      setAvailableCards((prev) => [...prev, card]);
      setFeedback(null);
    },
    [placedCards, isSuccess]
  );

  const checkOrder = useCallback(() => {
    if (placedCards.length !== currentSet.correctOrder.length) return;

    const isCorrect =
      placedCards.every((c, i) => c.id === currentSet.correctOrder[i]);

    if (isCorrect) {
      setFeedback({ type: "success", text: "🎉 Conversation Expert! +15 XP" });
      setIsSuccess(true);
      if (onComplete) onComplete(currentSetIndex);
    } else {
      setFeedback({ type: "error", text: "Not quite right. Try again!" });
      feedbackTimer.current = setTimeout(() => {
        setPlacedCards([]);
        setAvailableCards(shuffleArray(currentSet.cards));
        setFeedback(null);
      }, 2000);
    }
  }, [placedCards, currentSet, currentSetIndex, onComplete]);

  const handleNext = () => {
    if (currentSetIndex < conversationSets.length - 1) {
      setCurrentSetIndex((prev) => prev + 1);
    } else {
      if (onComplete) onComplete(-1);
    }
  };

  if (!currentSet) return null;

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "40px auto",
        padding: "36px 32px",
        background: "#ffffff",
        borderRadius: 32,
        boxShadow: "0 12px 48px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)",
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 8 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: 12,
              background: "linear-gradient(135deg, #e0e7ff, #c7d2fe)",
              color: "#4f46e5",
              fontSize: 14,
              fontWeight: 900,
            }}
          >
            04
          </span>
          <span style={{ fontSize: 26, fontWeight: 800, color: "#1e293b" }}>
            Conversation Builder
          </span>
          <span style={{ fontSize: 28 }}>💬</span>
        </div>
      </div>

      {/* Scenario pill */}
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          key={currentSetIndex}
          style={{
            display: "inline-block",
            background: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
            color: "#6d28d9",
            padding: "6px 20px",
            borderRadius: 20,
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: 0.2,
          }}
        >
          {currentSet.name}
        </motion.span>
      </div>

      <p
        style={{
          fontSize: 15,
          color: "#64748b",
          textAlign: "center",
          marginBottom: 28,
          lineHeight: 1.6,
        }}
      >
        Drag the dialogue cards into the correct order!
      </p>

      {/* ─── DROP ZONE ─── */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDropOnZone}
        style={{
          minHeight: 200,
          borderRadius: 24,
          padding: 20,
          marginBottom: 28,
          backgroundImage: `radial-gradient(circle, #c7d2fe 1px, transparent 1px)`,
          backgroundSize: "16px 16px",
          backgroundColor: "#f8fafc",
          border: "3px dashed transparent",
          backgroundClip: "padding-box",
          position: "relative",
          outline: "3px dashed #a5b4fc",
          outlineOffset: "-3px",
          transition: "background-color 0.2s",
        }}
      >
        <AnimatePresence mode="popLayout">
          {placedCards.length === 0 && (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "48px 16px",
                gap: 10,
              }}
            >
              <motion.span
                style={{ fontSize: 44 }}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                👆
              </motion.span>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#94a3b8" }}>
                Drag cards here
              </span>
              <span style={{ fontSize: 13, color: "#cbd5e1" }}>
                Arrange the conversation in order
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          {placedCards.map((card, index) => (
            <motion.div
              key={card.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, x: -20 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              whileHover={!isSuccess ? { scale: 1.02, x: 4 } : {}}
              onClick={() => handleRemoveFromPlaced(card.id)}
              title={isSuccess ? "" : "Click to remove"}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 18px",
                marginBottom: 10,
                background: "#ffffff",
                borderRadius: 16,
                border: "1px solid #e2e8f0",
                borderLeft: `4px solid ${cardColors[index % cardColors.length]}`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                cursor: isSuccess ? "default" : "pointer",
                userSelect: "none",
              }}
            >
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, #6366f1, #4f46e5)`,
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 900,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 2px 8px rgba(99, 102, 241, 0.3)",
                }}
              >
                {index + 1}
              </span>
              <span style={{ fontSize: 15, fontWeight: 600, color: "#334155" }}>
                {card.text}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ─── AVAILABLE CARDS ─── */}
      {availableCards.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 10, paddingLeft: 4 }}>
            Available dialogue cards
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
            {availableCards.map((card, idx) => (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 28, delay: idx * 0.05 }}
                whileHover={{ scale: 1.05, boxShadow: "0 6px 20px rgba(0,0,0,0.1)" }}
                whileTap={{ scale: 0.97 }}
                draggable
                onDragStart={(e) => handleDragStart(e, card.id)}
                style={{
                  padding: "12px 18px",
                  borderRadius: 16,
                  border: "1px solid #e2e8f0",
                  background: "#ffffff",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#334155",
                  cursor: "grab",
                  userSelect: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  transition: "box-shadow 0.2s",
                }}
              >
                {card.text}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ─── FEEDBACK ─── */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              x: feedback.type === "error" ? [0, -8, 8, -6, 6, -2, 2, 0] : 0,
            }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
              duration: feedback.type === "error" ? 0.5 : 0.3,
              ease: "easeOut",
            }}
            style={{
              padding: "16px 24px",
              borderRadius: 18,
              marginBottom: 20,
              fontWeight: 700,
              fontSize: 16,
              textAlign: "center",
              background:
                feedback.type === "success"
                  ? "linear-gradient(135deg, #dcfce7, #bbf7d0)"
                  : "linear-gradient(135deg, #fef2f2, #fecaca)",
              color: feedback.type === "success" ? "#166534" : "#991b1b",
              boxShadow:
                feedback.type === "success"
                  ? "0 4px 16px rgba(22, 163, 74, 0.15)"
                  : "0 4px 16px rgba(239, 68, 68, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {feedback.type === "success" && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.15 }}
              >
                <FiCheck size={22} strokeWidth={3} />
              </motion.span>
            )}
            {feedback.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── ACTIONS ─── */}
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        {!isSuccess && (
          <motion.button
            whileHover={
              placedCards.length === currentSet.correctOrder.length
                ? { scale: 1.04, boxShadow: "0 8px 28px rgba(99, 102, 241, 0.35)" }
                : {}
            }
            whileTap={
              placedCards.length === currentSet.correctOrder.length ? { scale: 0.97 } : {}
            }
            onClick={checkOrder}
            disabled={placedCards.length !== currentSet.correctOrder.length}
            style={{
              padding: "14px 32px",
              borderRadius: 16,
              border: "none",
              background:
                placedCards.length === currentSet.correctOrder.length
                  ? "linear-gradient(135deg, #6366f1, #4f46e5)"
                  : "#c7d2fe",
              color: "#fff",
              fontSize: 16,
              fontWeight: 800,
              cursor:
                placedCards.length === currentSet.correctOrder.length
                  ? "pointer"
                  : "not-allowed",
              fontFamily: "'Nunito', sans-serif",
              boxShadow:
                placedCards.length === currentSet.correctOrder.length
                  ? "0 4px 16px rgba(99, 102, 241, 0.25)"
                  : "none",
              transition: "all 0.2s",
              opacity: placedCards.length === currentSet.correctOrder.length ? 1 : 0.6,
            }}
          >
            Check Order
          </motion.button>
        )}

        {isSuccess && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.04, boxShadow: "0 8px 28px rgba(22, 163, 74, 0.35)" }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: "14px 32px",
              borderRadius: 16,
              border: "none",
              background: "linear-gradient(135deg, #16a34a, #15803d)",
              color: "#fff",
              fontSize: 16,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "'Nunito', sans-serif",
              boxShadow: "0 4px 16px rgba(22, 163, 74, 0.25)",
            }}
            onClick={handleNext}
          >
            {currentSetIndex < conversationSets.length - 1
              ? "Next Scenario →"
              : "Continue →"}
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default ConversationBuilder;
