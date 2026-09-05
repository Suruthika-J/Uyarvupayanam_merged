import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMic } from "react-icons/fi";

const SoundWaveBars = ({ color = "#ef4444", barCount = 5 }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, height: 48 }}>
    {Array.from({ length: barCount }).map((_, i) => (
      <motion.div
        key={i}
        style={{
          width: 6,
          borderRadius: 3,
          background: color,
          originY: 1,
        }}
        animate={{ height: [12, 40, 12] }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          delay: i * 0.12,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

const FloatingNotes = () => {
  const notes = ["🎵", "🎶", "🎵"];
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {notes.map((note, i) => (
        <motion.span
          key={i}
          style={{
            position: "absolute",
            fontSize: 22,
            left: `${20 + i * 30}%`,
            top: "50%",
          }}
          animate={{
            y: [-10, -40, -10],
            x: [0, (i % 2 === 0 ? 10 : -10), 0],
            opacity: [0.3, 1, 0.3],
            rotate: [0, 15, -15, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut",
          }}
        >
          {note}
        </motion.span>
      ))}
    </div>
  );
};

const PulseRings = ({ color = "#ef4444" }) => (
  <>
    {[1, 2, 3].map((ring) => (
      <motion.div
        key={ring}
        style={{
          position: "absolute",
          width: 160 + ring * 32,
          height: 160 + ring * 32,
          borderRadius: "50%",
          border: `2px solid ${color}`,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.08, 0.3],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          delay: ring * 0.35,
          ease: "easeInOut",
        }}
      />
    ))}
  </>
);

const ThinkingCountdown = ({ time, total = 10 }) => {
  const progress = time / total;
  return (
    <div
      style={{
        position: "relative",
        width: 140,
        height: 140,
        margin: "0 auto 24px",
      }}
    >
      <svg
        width="140"
        height="140"
        viewBox="0 0 140 140"
        style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}
      >
        <circle
          cx="70"
          cy="70"
          r="60"
          fill="none"
          stroke="#fef3c7"
          strokeWidth="8"
        />
        <motion.circle
          cx="70"
          cy="70"
          r="60"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 60}
          animate={{ strokeDashoffset: 2 * Math.PI * 60 * (1 - progress) }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </svg>
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 48,
          fontWeight: 900,
          color: "#d97706",
          fontFamily: "'Nunito', sans-serif",
        }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        {time}
      </motion.div>
    </div>
  );
};

const CheckmarkAnimation = () => (
  <motion.div
    style={{
      width: 140,
      height: 140,
      borderRadius: "50%",
      background: "linear-gradient(135deg, #dcfce7, #bbf7d0)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 24px",
    }}
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ type: "spring", stiffness: 260, damping: 18 }}
  >
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <motion.circle
        cx="32"
        cy="32"
        r="28"
        stroke="#16a34a"
        strokeWidth="4"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      />
      <motion.path
        d="M20 33 L28 41 L44 23"
        stroke="#16a34a"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      />
    </svg>
  </motion.div>
);

const WaveformViz = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 3,
      height: 40,
      padding: "8px 16px",
      background: "rgba(22, 163, 74, 0.06)",
      borderRadius: 12,
      marginBottom: 20,
    }}
  >
    {Array.from({ length: 20 }).map((_, i) => (
      <motion.div
        key={i}
        style={{
          width: 4,
          borderRadius: 2,
          background: "linear-gradient(to top, #16a34a, #4ade80)",
        }}
        animate={{ height: [6, 12 + Math.random() * 24, 6] }}
        transition={{
          duration: 0.8 + Math.random() * 0.6,
          repeat: Infinity,
          delay: i * 0.06,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

const OneMinuteTalk = ({ topics, onComplete }) => {
  const [phase, setPhase] = useState("idle");
  const [topic, setTopic] = useState("");
  const [thinkingTime, setThinkingTime] = useState(10);
  const [recordingTime, setRecordingTime] = useState(60);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [hasSaved, setHasSaved] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const thinkingIntervalRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      clearInterval(thinkingIntervalRef.current);
      clearInterval(recordingIntervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(url);
        setAudioBlob(blob);
        setPhase("finished");
      };

      mediaRecorder.start();
    } catch {
      alert("Microphone access is required for this activity.");
    }
  }, [audioUrl]);

  const stopRecording = useCallback(() => {
    clearInterval(recordingIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const handleStart = () => {
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    setTopic(randomTopic);
    setThinkingTime(10);
    setRecordingTime(60);
    setPhase("thinking");
    setHasSaved(false);

    thinkingIntervalRef.current = setInterval(() => {
      setThinkingTime((prev) => {
        if (prev <= 1) {
          clearInterval(thinkingIntervalRef.current);
          setPhase("recording");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (phase === "recording") {
      startRecording();
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev <= 1) {
            clearInterval(recordingIntervalRef.current);
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [phase, startRecording, stopRecording]);

  const handleRecordAgain = () => {
    clearInterval(thinkingIntervalRef.current);
    clearInterval(recordingIntervalRef.current);
    setPhase("idle");
    setAudioUrl(null);
  };

  const handleSave = () => {
    if (hasSaved) return;
    setHasSaved(true);
    if (onComplete) onComplete({ topic, blob: audioBlob });
  };

  return (
    <div
      style={{
        maxWidth: 560,
        margin: "40px auto",
        padding: "36px 32px",
        background: "#ffffff",
        borderRadius: 32,
        boxShadow: "0 12px 48px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)",
        fontFamily: "'Nunito', sans-serif",
        textAlign: "center",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 8 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: 12,
            background: "linear-gradient(135deg, #fee2e2, #fecaca)",
            color: "#ef4444",
            fontSize: 14,
            fontWeight: 900,
          }}
        >
          03
        </span>
        <span style={{ fontSize: 26, fontWeight: 800, color: "#1e293b" }}>
          One Minute Talk Challenge
        </span>
        <span style={{ fontSize: 28 }}>🎤</span>
      </div>
      <p
        style={{
          fontSize: 15,
          color: "#64748b",
          lineHeight: 1.6,
          marginBottom: 32,
          maxWidth: 440,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        Speak with confidence! Get a topic, think for 10 seconds, then record for 60 seconds.
      </p>

      <AnimatePresence mode="wait">
        {/* ─── IDLE ─── */}
        {phase === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.4 }}
          >
            <div style={{ position: "relative", width: 160, height: 160, margin: "0 auto 32px" }}>
              <PulseRings color="rgba(239, 68, 68, 0.2)" />
              <FloatingNotes />
              <motion.div
                style={{
                  position: "relative",
                  width: 160,
                  height: 160,
                  borderRadius: "50%",
                  background: "linear-gradient(145deg, #fee2e2, #fecaca)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1,
                  boxShadow: "0 8px 32px rgba(239, 68, 68, 0.15)",
                }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <FiMic size={60} color="#ef4444" />
              </motion.div>
            </div>
            <p style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", marginBottom: 6 }}>
              Ready to speak?
            </p>
            <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 28 }}>
              Click the microphone to begin your challenge!
            </p>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: "0 8px 28px rgba(239, 68, 68, 0.35)" }}
              whileTap={{ scale: 0.97 }}
              onClick={handleStart}
              style={{
                padding: "14px 36px",
                borderRadius: 16,
                border: "none",
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                color: "#fff",
                fontSize: 16,
                fontWeight: 800,
                cursor: "pointer",
                fontFamily: "'Nunito', sans-serif",
                boxShadow: "0 4px 16px rgba(239, 68, 68, 0.25)",
                letterSpacing: 0.3,
              }}
            >
              Generate Topic &amp; Start
            </motion.button>
          </motion.div>
        )}

        {/* ─── THINKING ─── */}
        {phase === "thinking" && (
          <motion.div
            key="thinking"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.35 }}
          >
            <ThinkingCountdown time={thinkingTime} total={10} />
            <p style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>
              Thinking Time
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                {" "}...
              </motion.span>
            </p>
            <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 20 }}>
              Organize your thoughts before speaking!
            </p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                padding: "16px 24px",
                borderRadius: 18,
                background: "linear-gradient(135deg, #fef3c7, #fde68a)",
                color: "#92400e",
                fontSize: 16,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 16px rgba(245, 158, 11, 0.15)",
                border: "2px solid rgba(245, 158, 11, 0.2)",
              }}
            >
              <span style={{ fontSize: 20 }}>✨</span>
              {topic}
            </motion.div>
          </motion.div>
        )}

        {/* ─── RECORDING ─── */}
        {phase === "recording" && (
          <motion.div
            key="recording"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.35 }}
          >
            {/* REC indicator */}
            <motion.div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 16px",
                borderRadius: 20,
                background: "#fef2f2",
                marginBottom: 20,
              }}
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              <motion.div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#ef4444",
                }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span style={{ fontSize: 13, fontWeight: 800, color: "#ef4444", letterSpacing: 1.5 }}>REC</span>
            </motion.div>

            <div style={{ position: "relative", width: 140, height: 140, margin: "0 auto 20px" }}>
              <motion.div
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: "50%",
                  background: "linear-gradient(145deg, #fee2e2, #fecaca)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 32px rgba(239, 68, 68, 0.2)",
                }}
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              >
                <FiMic size={52} color="#ef4444" />
              </motion.div>
            </div>

            <SoundWaveBars />

            <div
              style={{
                fontSize: 42,
                fontWeight: 900,
                color: "#ef4444",
                margin: "8px 0 4px",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {recordingTime}s
            </div>
            <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 16 }}>
              seconds remaining
            </p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: "14px 22px",
                borderRadius: 16,
                background: "linear-gradient(135deg, #fef2f2, #fee2e2)",
                color: "#991b1b",
                fontSize: 15,
                fontWeight: 700,
                display: "inline-block",
                marginBottom: 20,
                border: "2px solid rgba(239, 68, 68, 0.15)",
              }}
            >
              🎤 {topic}
            </motion.div>
            <div>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={stopRecording}
                style={{
                  padding: "14px 36px",
                  borderRadius: 16,
                  border: "none",
                  background: "#475569",
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: "pointer",
                  fontFamily: "'Nunito', sans-serif",
                  boxShadow: "0 4px 16px rgba(71, 85, 105, 0.25)",
                }}
              >
                Stop Recording
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ─── FINISHED ─── */}
        {phase === "finished" && (
          <motion.div
            key="finished"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.35 }}
          >
            <CheckmarkAnimation />
            <p style={{ fontSize: 20, fontWeight: 800, color: "#16a34a", marginBottom: 4 }}>
              Great job! 🎉
            </p>
            <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 20 }}>
              Here is your recording:
            </p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: "14px 22px",
                borderRadius: 16,
                background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                color: "#166534",
                fontSize: 15,
                fontWeight: 700,
                display: "inline-block",
                marginBottom: 20,
                border: "2px solid rgba(22, 163, 74, 0.15)",
              }}
            >
              ✨ {topic}
            </motion.div>

            {audioUrl && (
              <div style={{ marginBottom: 16 }}>
                <audio
                  controls
                  src={audioUrl}
                  style={{
                    width: "100%",
                    borderRadius: 14,
                    height: 44,
                    outline: "none",
                  }}
                />
                <WaveformViz />
              </div>
            )}

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleRecordAgain}
                style={{
                  padding: "14px 28px",
                  borderRadius: 16,
                  border: "2px solid #e2e8f0",
                  background: "#ffffff",
                  color: "#475569",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'Nunito', sans-serif",
                }}
              >
                Record Again
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: "0 8px 28px rgba(22, 163, 74, 0.35)" }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={hasSaved}
                style={{
                  padding: "14px 28px",
                  borderRadius: 16,
                  border: "none",
                  background: hasSaved ? "#86efac" : "linear-gradient(135deg, #16a34a, #15803d)",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: hasSaved ? "default" : "pointer",
                  fontFamily: "'Nunito', sans-serif",
                  boxShadow: hasSaved ? "none" : "0 4px 16px rgba(22, 163, 74, 0.25)",
                  opacity: hasSaved ? 0.7 : 1,
                }}
              >
                {hasSaved ? "Saved!" : "Save & Continue"}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OneMinuteTalk;
