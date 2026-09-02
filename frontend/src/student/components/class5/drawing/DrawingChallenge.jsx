import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTrash2, FiRotateCcw, FiCheckCircle } from 'react-icons/fi';
import confetti from 'canvas-confetti';

import { useStudentAuth } from '../../../context/StudentAuthContext';
import class5CommunicationService from '../../../../services/class5CommunicationService';

import ActivityLayout from '../activities/ActivityLayout';
import ActivityCompletion from '../activities/ActivityCompletion';
import DrawingCanvas from './DrawingCanvas';

const ACTIVITY_ID = 'drawing_challenge';
const BACK_ROUTE = '/student/class5?section=Fun';

const PALETTE = [
  { color: '#4f46e5', label: 'Purple' },
  { color: '#3b82f6', label: 'Blue' },
  { color: '#10b981', label: 'Green' },
  { color: '#eab308', label: 'Yellow' },
  { color: '#f97316', label: 'Orange' },
  { color: '#ef4444', label: 'Red' },
  { color: '#ec4899', label: 'Pink' },
  { color: '#111827', label: 'Black' },
];

const CHALLENGES = [
  'Draw your dream pet!',
  'Draw a magical tree house!',
  'Draw a day at the beach!',
  'Draw your favourite cartoon.',
  'Draw a spaceship exploring space!',
  'Draw a happy rainbow!',
  'Draw a castle in the sky!',
  'Draw something that makes you smile!',
];

function fireConfetti() {
  confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 } });
  setTimeout(() => {
    confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0 } });
    confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1 } });
  }, 250);
}

export default function DrawingChallenge() {
  const navigate = useNavigate();
  const { isAuthenticated } = useStudentAuth();

  const canvasRef = useRef(null);
  const [prompt, setPrompt] = useState(() => CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)]);
  const [color, setColor] = useState('#4f46e5');
  const [lineWidth, setLineWidth] = useState(6);
  const [drawn, setDrawn] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const goBack = useCallback(() => {
    navigate(BACK_ROUTE);
  }, [navigate]);

  const reset = useCallback(() => {
    if (canvasRef.current) canvasRef.current.clear();
    setDrawn(false);
    setCompleted(false);
    setSaving(false);
    setSaveError(false);
    setPrompt(CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)]);
  }, []);

  const handleComplete = useCallback(async () => {
    if (!drawn || completed) return;
    setCompleted(true);
    fireConfetti();

    if (isAuthenticated) {
      setSaving(true);
      try {
        await class5CommunicationService.submitActivityResult({
          activityId: ACTIVITY_ID,
          score: 100,
          total: 100,
          correct: 100,
          incorrect: 0,
          percentage: 100,
        });
        setSaveError(false);
      } catch {
        setSaveError(true);
      } finally {
        setSaving(false);
      }
    }
  }, [drawn, completed, isAuthenticated]);

  if (completed) {
    return (
      <ActivityLayout title="Drawing Challenge" subtitle="Fun · Class 5" emoji="🎨" backTo={BACK_ROUTE} onBack={goBack} backLabel="Back to Fun">
        <ActivityCompletion
          emoji="🎉"
          title="Great Job!"
          message="You completed today's Drawing Challenge!"
          points={[{ label: 'Creativity', points: 10, emoji: '🎨', color: '#ec4899' }]}
          onTryAgain={reset}
          onBack={goBack}
          backLabel="Back to Fun"
        />
        {saving && (
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: 14, marginTop: 16 }}>
            Saving your progress…
          </p>
        )}
        {saveError && (
          <p style={{ textAlign: 'center', color: '#dc2626', fontSize: 14, marginTop: 16 }}>
            Could not save your result. You can still draw again — progress will sync when you're signed in.
          </p>
        )}
      </ActivityLayout>
    );
  }

  return (
    <ActivityLayout
      title="Drawing Challenge"
      subtitle={prompt}
      emoji="🎨"
      backTo={BACK_ROUTE}
      onBack={goBack}
      backLabel="Back to Fun"
    >
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Prompt card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)',
            color: '#fff',
            borderRadius: 24,
            padding: '22px 26px',
            marginBottom: 24,
            textAlign: 'center',
            boxShadow: '0 10px 24px -8px rgba(236,72,153,0.45)',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 800, opacity: 0.9, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            🖌️ Today's challenge
          </div>
          <div style={{ fontSize: 'clamp(18px, 3.5vw, 24px)', fontWeight: 900, margin: 0 }}>{prompt}</div>
        </div>

        {/* Toolbar: colors + width */}
        <div
          style={{
            background: '#fff',
            borderRadius: 20,
            border: '1px solid #f1f5f9',
            padding: '18px 20px',
            marginBottom: 20,
            boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {PALETTE.map((p) => (
              <button
                key={p.color}
                title={p.label}
                onClick={() => setColor(p.color)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: p.color,
                  border: color === p.color ? '3px solid #1e293b' : '3px solid transparent',
                  cursor: 'pointer',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>Size</span>
            <button
              onClick={() => setLineWidth(5)}
              style={{
                width: 24, height: 24, borderRadius: '50%', background: '#1e293b',
                border: lineWidth === 5 ? '3px solid #ec4899' : 'none', cursor: 'pointer',
              }}
            />
            <button
              onClick={() => setLineWidth(10)}
              style={{
                width: 30, height: 30, borderRadius: '50%', background: '#1e293b',
                border: lineWidth === 10 ? '3px solid #ec4899' : 'none', cursor: 'pointer',
              }}
            />
          </div>
        </div>

        {/* Canvas */}
        <DrawingCanvas ref={canvasRef} color={color} lineWidth={lineWidth} onChange={setDrawn} />

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
          <button
            onClick={() => canvasRef.current?.undo()}
            disabled={!drawn}
            style={{
              flex: 1, minWidth: 120, padding: '14px 0', borderRadius: 14,
              background: '#fff', color: '#475569', border: '2px solid #e2e8f0',
              fontWeight: 800, fontSize: 15, cursor: drawn ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <FiRotateCcw /> Undo
          </button>
          <button
            onClick={() => canvasRef.current?.clear()}
            disabled={!drawn}
            style={{
              flex: 1, minWidth: 120, padding: '14px 0', borderRadius: 14,
              background: '#fff', color: '#dc2626', border: '2px solid #fecaca',
              fontWeight: 800, fontSize: 15, cursor: drawn ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <FiTrash2 /> Clear
          </button>
          <button
            onClick={handleComplete}
            disabled={!drawn}
            style={{
              flex: 2, minWidth: 200, padding: '14px 0', borderRadius: 14, border: 'none',
              background: drawn ? 'linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)' : '#e2e8f0',
              color: drawn ? '#fff' : '#94a3b8', fontWeight: 800, fontSize: 15,
              cursor: drawn ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: drawn ? '0 10px 20px -6px rgba(236,72,153,0.5)' : 'none',
            }}
          >
            <FiCheckCircle /> Complete Drawing
          </button>
        </div>

        <div style={{ marginTop: 18, textAlign: 'center', color: '#94a3b8', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          🎨 Complete your drawing to earn <strong style={{ color: '#ec4899' }}>+10 Creativity Points</strong>
        </div>
      </div>
    </ActivityLayout>
  );
}
