import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import confetti from 'canvas-confetti';

import { useStudentAuth } from '../../../context/StudentAuthContext';
import class5CommunicationService from '../../../../services/class5CommunicationService';

import ActivityLayout from '../activities/ActivityLayout';
import ActivityCompletion from '../activities/ActivityCompletion';
import ActivityStepProgress from '../activities/ActivityStepProgress';
import {
  TREASURE_LEVELS,
  MAX_ATTEMPTS,
  TOTAL_CLUES,
  POINTS_FIRST_TRY,
  POINTS_AFTER,
  MAX_POINTS,
} from './TreasureHuntOptions';

const ACTIVITY_ID = 'treasure_hunt';
const BACK_ROUTE = '/student/class5?section=Fun';
const ACCENT = '#d97706';
const GRADIENT = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
const CLUE_STEPS = Array.from({ length: TOTAL_CLUES }, (_, i) => `Clue ${i + 1}`);

function fireConfetti() {
  confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 } });
  setTimeout(() => {
    confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0 } });
    confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1 } });
  }, 250);
}

export default function TreasureHunt() {
  const navigate = useNavigate();
  const { isAuthenticated } = useStudentAuth();

  const level = TREASURE_LEVELS[0];

  const [stage, setStage] = useState('intro');
  const [clueIdx, setClueIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [wrongCount, setWrongCount] = useState(0);
  const [totalWrong, setTotalWrong] = useState(0);
  const [status, setStatus] = useState('answering');
  const [clueResults, setClueResults] = useState(Array(TOTAL_CLUES).fill(0));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const completeRef = useRef(false);

  const pointsTotal = clueResults.reduce((a, b) => a + b, 0);
  const cluesSolved = clueResults.filter((p) => p > 0).length;
  const firstTryClues = clueResults.filter((p) => p >= POINTS_FIRST_TRY).length;
  const percentage = Math.round((pointsTotal / MAX_POINTS) * 100);

  const currentClue = level.clues[clueIdx];
  const isLastClue = clueIdx === TOTAL_CLUES - 1;
  const answerLabel = currentClue.options.find((o) => o.value === currentClue.answer).label;

  const goBack = useCallback(() => {
    navigate(BACK_ROUTE);
  }, [navigate]);

  const reset = useCallback(() => {
    completeRef.current = false;
    setStage('intro');
    setClueIdx(0);
    setSelected(null);
    setAttemptsLeft(MAX_ATTEMPTS);
    setWrongCount(0);
    setTotalWrong(0);
    setStatus('answering');
    setClueResults(Array(TOTAL_CLUES).fill(0));
    setSaving(false);
    setSaveError(false);
  }, []);

  const startHunt = useCallback(() => {
    setStage('hunt');
  }, []);

  const handleSubmit = useCallback(() => {
    if (!selected || status !== 'answering') return;

    if (selected === currentClue.answer) {
      const pts = wrongCount === 0 ? POINTS_FIRST_TRY : POINTS_AFTER;
      setClueResults((prev) => prev.map((v, i) => (i === clueIdx ? pts : v)));
      setStatus('correct');
    } else {
      const left = attemptsLeft - 1;
      setAttemptsLeft(left);
      setWrongCount((w) => w + 1);
      setTotalWrong((t) => t + 1);
      if (left <= 0) {
        setStatus('revealed');
      }
    }
  }, [selected, status, currentClue.answer, wrongCount, clueIdx, attemptsLeft]);

  const completeHunt = useCallback(() => {
    if (completeRef.current) return;
    completeRef.current = true;
    setStage('reveal');
    fireConfetti();

    if (isAuthenticated) {
      setSaving(true);
      (async () => {
        try {
          await class5CommunicationService.submitActivityResult({
            activityId: ACTIVITY_ID,
            score: pointsTotal,
            total: MAX_POINTS,
            correct: cluesSolved,
            incorrect: totalWrong,
            percentage,
            detail: {
              level: level.id,
              cluesSolved,
              attemptsUsed: totalWrong,
              firstTryClues,
              results: clueResults,
            },
          });
          setSaveError(false);
        } catch {
          setSaveError(true);
        } finally {
          setSaving(false);
        }
      })();
    }
  }, [isAuthenticated, pointsTotal, cluesSolved, totalWrong, percentage, level.id, firstTryClues, clueResults]);

  const handleNext = () => {
    if (isLastClue) {
      completeHunt();
    } else {
      setClueIdx((i) => i + 1);
      setSelected(null);
      setAttemptsLeft(MAX_ATTEMPTS);
      setWrongCount(0);
      setStatus('answering');
    }
  };

  if (stage === 'intro') {
    return (
      <ActivityLayout
        title="Treasure Hunt"
        subtitle="Fun · Class 5"
        emoji="🗺️"
        backTo={BACK_ROUTE}
        onBack={goBack}
        backLabel="Back to Fun"
      >
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 32,
              border: '1px solid #f1f5f9',
              padding: '40px 30px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 64, marginBottom: 10 }}>🗺️</div>
            <h2 style={{ margin: 0, fontSize: 'clamp(26px, 5vw, 34px)', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>
              TREASURE HUNT
            </h2>
            <p style={{ margin: '8px 0 24px', fontWeight: 800, color: ACCENT, fontSize: 17 }}>
              Welcome, Young Explorer!
            </p>
            <p style={{ color: '#64748b', fontSize: 16, lineHeight: 1.6, margin: '0 auto 28px', maxWidth: 480 }}>
              {level.story}
            </p>

            <div
              style={{
                display: 'flex',
                gap: 14,
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginBottom: 32,
              }}
            >
              {[
                { emoji: '🔎', text: `${TOTAL_CLUES} Clues` },
                { emoji: '❤️', text: `${MAX_ATTEMPTS} Attempts` },
                { emoji: '⭐', text: `Up to ${MAX_POINTS} Treasure Points` },
              ].map((item) => (
                <div
                  key={item.text}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 16,
                    padding: '12px 20px',
                    fontSize: 15,
                    fontWeight: 800,
                    color: '#334155',
                  }}
                >
                  <span style={{ marginRight: 8 }}>{item.emoji}</span>
                  {item.text}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={startHunt}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 32px',
                borderRadius: 14,
                border: 'none',
                background: GRADIENT,
                color: '#fff',
                fontWeight: 800,
                fontSize: 16,
                cursor: 'pointer',
                boxShadow: '0 12px 24px -8px rgba(217,119,6,0.5)',
              }}
            >
              <FiCheckCircle /> START HUNT
            </button>
            <p style={{ marginTop: 18, color: '#94a3b8', fontSize: 13 }}>
              You can try each clue up to {MAX_ATTEMPTS} times. Keep exploring!
            </p>
          </div>
        </div>
      </ActivityLayout>
    );
  }

  if (stage === 'reveal') {
    return (
      <ActivityLayout
        title="Treasure Hunt"
        subtitle="Fun · Class 5"
        emoji="🗺️"
        backTo={BACK_ROUTE}
        onBack={goBack}
        backLabel="Back to Fun"
      >
        <ActivityCompletion
          emoji="🏆"
          title="TREASURE DISCOVERED!"
          message="You followed all the clues and found the hidden treasure!"
          points={[{ label: 'Treasure Points', points: pointsTotal, emoji: '⭐', color: ACCENT }]}
          skillChips={[
            { emoji: '🔎', label: 'Observation', color: '#8b5cf6' },
            { emoji: '🧩', label: 'Problem Solving', color: '#3b82f6' },
            { emoji: '🧠', label: 'Logical Thinking', color: '#10b981' },
            { emoji: '🎯', label: 'Attention', color: '#f59e0b' },
          ]}
          tryAgainLabel="Play Again"
          onTryAgain={reset}
          onBack={goBack}
          backLabel="Back to Fun"
        />

        <div
          style={{
            background: '#fff',
            borderRadius: 32,
            border: '1px solid #f1f5f9',
            padding: '28px 26px',
            marginTop: 24,
            maxWidth: 640,
            marginLeft: 'auto',
            marginRight: 'auto',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          }}
        >
          {[
            { emoji: '🔎', label: 'Clues Solved', value: `${cluesSolved}/${TOTAL_CLUES}` },
            { emoji: '🎯', label: 'Solved on First Try', value: `${firstTryClues}/${TOTAL_CLUES}` },
            { emoji: '❤️', label: 'Attempts Used', value: `${totalWrong} ${totalWrong === 1 ? 'try' : 'tries'}` },
            { emoji: '⭐', label: 'Total Treasure Points', value: `${pointsTotal}/${MAX_POINTS}` },
          ].map((row) => (
            <div
              key={row.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: '#f8fafc',
                borderRadius: 16,
                padding: '12px 16px',
                marginBottom: 10,
              }}
            >
              <span style={{ fontSize: 22 }}>{row.emoji}</span>
              <span style={{ fontWeight: 700, color: '#94a3b8', fontSize: 14, flex: 1 }}>{row.label}</span>
              <span style={{ fontWeight: 900, color: '#1e293b', fontSize: 16 }}>{row.value}</span>
            </div>
          ))}
          <div style={{ marginTop: 14, textAlign: 'center', color: '#64748b', fontSize: 15, fontWeight: 700, lineHeight: 1.5 }}>
            🌟 {level.finalMessage}
          </div>
        </div>

        {saving && (
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: 14, marginTop: 16 }}>
            Saving your progress…
          </p>
        )}
        {saveError && (
          <p style={{ textAlign: 'center', color: '#dc2626', fontSize: 14, marginTop: 16 }}>
            Could not save your result. You can still play again — progress will sync when you're signed in.
          </p>
        )}
      </ActivityLayout>
    );
  }

  return (
    <ActivityLayout
      title="Treasure Hunt"
      subtitle="Follow the clues and find the hidden treasure!"
      emoji="🗺️"
      backTo={BACK_ROUTE}
      onBack={goBack}
      backLabel="Back to Fun"
    >
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <ActivityStepProgress
          steps={CLUE_STEPS}
          current={clueIdx}
          accent={ACCENT}
          gradient={GRADIENT}
          rightLabel={`Clue ${clueIdx + 1} of ${TOTAL_CLUES}`}
        />

        {status === 'answering' && (
          <div style={{ textAlign: 'center', marginBottom: 16, fontSize: 22 }}>
            {'❤️'.repeat(attemptsLeft)}
            {'🤍'.repeat(MAX_ATTEMPTS - attemptsLeft)}
          </div>
        )}

        <div
          style={{
            background: '#fff',
            borderRadius: 28,
            border: '1px solid #f1f5f9',
            padding: '28px 26px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            animation: 'fadeUp 0.3s ease-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <span style={{ fontSize: 32 }}>{currentClue.emoji}</span>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#1e293b' }}>
              CLUE {clueIdx + 1}
            </h2>
            <span
              style={{
                marginLeft: 'auto',
                background: '#fef3c7',
                color: '#b45309',
                fontSize: 12,
                fontWeight: 800,
                padding: '4px 12px',
                borderRadius: 99,
              }}
            >
              {currentClue.type}
            </span>
          </div>

          <p style={{ color: '#64748b', fontSize: 15, margin: '10px 0 6px' }}>
            {currentClue.intro}
          </p>
          <p style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 900, color: '#1e293b', lineHeight: 1.5 }}>
            {currentClue.question}
          </p>

          {currentClue.visual && (
            <div
              style={{
                background: '#fdf9ef',
                border: '1px dashed #fcd34d',
                borderRadius: 18,
                padding: '20px 18px',
                textAlign: 'center',
                fontSize: 34,
                letterSpacing: 6,
                marginBottom: 18,
              }}
            >
              {currentClue.visual}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {currentClue.options.map((opt) => {
              const isSel = selected === opt.value;
              const locked = status !== 'answering';
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={locked}
                  onClick={() => setSelected(opt.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '16px 18px',
                    borderRadius: 18,
                    border: isSel ? `3px solid ${ACCENT}` : '2px solid #e2e8f0',
                    background: isSel ? '#fffaf0' : '#fff',
                    color: '#1e293b',
                    cursor: locked ? 'default' : 'pointer',
                    fontWeight: 800,
                    fontSize: 16,
                    textAlign: 'left',
                    width: '100%',
                    boxShadow: isSel ? `0 8px 20px -6px ${ACCENT}59` : 'none',
                    opacity: locked ? 0.85 : 1,
                  }}
                >
                  <span
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      background: isSel ? ACCENT : '#f1f5f9',
                      color: isSel ? '#fff' : '#64748b',
                      fontWeight: 900,
                      fontSize: 15,
                      flexShrink: 0,
                    }}
                  >
                    {opt.value}
                  </span>
                  <span style={{ flex: 1 }}>{opt.label}</span>
                  {isSel && <FiCheckCircle size={22} color={ACCENT} />}
                </button>
              );
            })}
          </div>

          {status === 'answering' && wrongCount > 0 && (
            <div
              style={{
                marginTop: 18,
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: 16,
                padding: '14px 16px',
                fontSize: 14,
                fontWeight: 700,
                color: '#b45309',
              }}
            >
              💡 {currentClue.incorrectMessage}
            </div>
          )}

          {status === 'correct' && (
            <div
              style={{
                marginTop: 18,
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: 16,
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <span style={{ fontSize: 26 }}>🎉</span>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#047857' }}>Correct!</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#065f46' }}>{currentClue.correctMessage}</div>
              </div>
              <span
                style={{
                  background: '#d1fae5',
                  color: '#065f46',
                  padding: '5px 14px',
                  borderRadius: 99,
                  fontWeight: 900,
                  fontSize: 14,
                }}
              >
                +{clueResults[clueIdx]} ⭐
              </span>
            </div>
          )}

          {status === 'revealed' && (
            <div
              style={{
                marginTop: 18,
                background: '#fef3c7',
                border: '1px solid #fcd34d',
                borderRadius: 16,
                padding: '16px 18px',
                fontSize: 14,
                fontWeight: 700,
                color: '#78350f',
                lineHeight: 1.6,
              }}
            >
              🧭 The correct answer is <strong>{answerLabel}</strong>. {currentClue.hint}
              <div style={{ marginTop: 6, color: '#b45309' }}>
                Don&apos;t worry — every clue teaches you something new!
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            {status === 'answering' ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!selected}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  marginLeft: 'auto',
                  padding: '13px 26px',
                  borderRadius: 14,
                  border: 'none',
                  background: selected ? GRADIENT : '#e2e8f0',
                  color: selected ? '#fff' : '#94a3b8',
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: selected ? 'pointer' : 'not-allowed',
                  boxShadow: selected ? '0 10px 20px -6px rgba(217,119,6,0.4)' : 'none',
                }}
              >
                SUBMIT CLUE <FiArrowRight />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  marginLeft: 'auto',
                  padding: '13px 26px',
                  borderRadius: 14,
                  border: 'none',
                  background: GRADIENT,
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: 'pointer',
                  boxShadow: '0 10px 20px -6px rgba(217,119,6,0.4)',
                }}
              >
                {isLastClue ? 'FIND THE TREASURE' : 'NEXT CLUE'} <FiArrowRight />
              </button>
            )}
          </div>
        </div>

        {stage === 'hunt' && (
          <div style={{ marginTop: 18, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
            ⭐ Solve each clue on the first try to earn <strong style={{ color: ACCENT }}>{POINTS_FIRST_TRY} Treasure Points</strong>
          </div>
        )}
      </div>
    </ActivityLayout>
  );
}