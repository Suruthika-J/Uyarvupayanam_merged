import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiStar, FiCheckCircle, FiRefreshCcw } from 'react-icons/fi';
import confetti from 'canvas-confetti';

import { useStudentAuth } from '../../../context/StudentAuthContext';
import class5CommunicationService from '../../../../services/class5CommunicationService';

import ActivityLayout from '../activities/ActivityLayout';
import ActivityCompletion from '../activities/ActivityCompletion';
import {
  STORY_STEPS,
  STORY_START,
  STORY_GUIDES,
  MIN_STORY_WORDS,
} from './StoryBuilderOptions';

const ACTIVITY_ID = 'story_builder';
const BACK_ROUTE = '/student/class5?section=Fun';
const INGREDIENT_LABELS = {
  character: 'Character',
  place: 'Place',
  object: 'Special Object',
  theme: 'Story Theme',
};

const GRADIENT = 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)';
const ACCENT = '#8b5cf6';
const ACCENT2 = '#ec4899';

function fireConfetti() {
  confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 } });
  setTimeout(() => {
    confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0 } });
    confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1 } });
  }, 250);
}

const byId = (arr, id) => arr.find((o) => o.id === id);

function ChoiceOption({ option, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.value)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '18px 20px',
        borderRadius: 20,
        border: selected ? `3px solid ${ACCENT}` : '2px solid #e2e8f0',
        background: selected ? '#f5f3ff' : '#fff',
        color: selected ? '#1e293b' : '#475569',
        cursor: 'pointer',
        fontWeight: 800,
        fontSize: 16,
        textAlign: 'left',
        width: '100%',
        transition: 'all 0.15s ease',
        boxShadow: selected ? '0 8px 20px -6px rgba(139,92,246,0.35)' : 'none',
      }}
    >
      <span style={{ fontSize: 30, lineHeight: 1 }}>{option.emoji}</span>
      <span style={{ flex: 1 }}>{option.label}</span>
      {selected && (
        <FiCheckCircle size={22} color={ACCENT} />
      )}
    </button>
  );
}

export default function StoryBuilder() {
  const navigate = useNavigate();
  const { isAuthenticated } = useStudentAuth();

  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState({
    character: null,
    place: null,
    object: null,
    theme: null,
  });
  const [story, setStory] = useState(STORY_START);
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const goBack = useCallback(() => {
    navigate(BACK_ROUTE);
  }, [navigate]);

  const reset = useCallback(() => {
    setStep(0);
    setSelections({ character: null, place: null, object: null, theme: null });
    setStory(STORY_START);
    setCompleted(false);
    setSaving(false);
    setSaveError(false);
  }, []);

  const nextStep = useCallback(() => {
    setStep((s) => Math.min(s + 1, STORY_STEPS.length));
  }, []);

  const prevStep = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const storyWordCount = useMemo(() => {
    const body = story.replace(STORY_START, '').trim();
    return body ? body.split(/\s+/).filter(Boolean).length : 0;
  }, [story]);

  const canCompleteStory = storyWordCount >= MIN_STORY_WORDS;

  const handleComplete = useCallback(async () => {
    if (!canCompleteStory || completed) return;
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
          detail: {
            character: selections.character,
            place: selections.place,
            object: selections.object,
            theme: selections.theme,
            story,
          },
        });
        setSaveError(false);
      } catch {
        setSaveError(true);
      } finally {
        setSaving(false);
      }
    }
  }, [canCompleteStory, completed, isAuthenticated, selections, story]);

  if (completed) {
    const optionEmoji = (key) => {
      const step = STORY_STEPS.find((s) => s.id === key);
      const opt = step.options.find((o) => o.value === selections[key]);
      return opt ? opt.emoji : '✨';
    };
    const ingredients = [
      { label: INGREDIENT_LABELS.character, value: selections.character, emoji: optionEmoji('character') },
      { label: INGREDIENT_LABELS.place, value: selections.place, emoji: optionEmoji('place') },
      { label: INGREDIENT_LABELS.object, value: selections.object, emoji: optionEmoji('object') },
      { label: INGREDIENT_LABELS.theme, value: selections.theme, emoji: optionEmoji('theme') },
    ];
    return (
      <ActivityLayout
        title="Story Builder"
        subtitle="Fun · Class 5"
        emoji="📝"
        backTo={BACK_ROUTE}
        onBack={goBack}
        backLabel="Back to Fun"
      >
        <ActivityCompletion
          emoji="🎉"
          title="Great Story!"
          message="You created your own story!"
          points={[{ label: 'Creativity', points: 10, emoji: '⭐', color: ACCENT }]}
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
            maxWidth: 720,
            marginLeft: 'auto',
            marginRight: 'auto',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 900, color: '#1e293b', marginBottom: 16 }}>
            📚 Your Story Ingredients
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {ingredients.map((ing) => (
              <div
                key={ing.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: '#f8fafc',
                  borderRadius: 16,
                  padding: '12px 16px',
                }}
              >
                <span style={{ fontSize: 22 }}>{ing.emoji}</span>
                <span style={{ fontWeight: 700, color: '#94a3b8', fontSize: 13, width: 110, flexShrink: 0 }}>
                  {ing.label}
                </span>
                <span style={{ fontWeight: 800, color: '#1e293b' }}>{ing.value}</span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 15, fontWeight: 900, color: '#1e293b', marginBottom: 10 }}>
            ✨ Your Story
          </div>
          <div
            style={{
              background: '#fffdf5',
              border: '1px solid #fde68a',
              borderRadius: 20,
              padding: '18px 20px',
              lineHeight: 1.8,
              color: '#334155',
              fontSize: 16,
              fontStyle: 'italic',
              minHeight: 90,
            }}
          >
            {story}
          </div>
        </div>

        {saving && (
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: 14, marginTop: 16 }}>
            Saving your progress…
          </p>
        )}
        {saveError && (
          <p style={{ textAlign: 'center', color: '#dc2626', fontSize: 14, marginTop: 16 }}>
            Could not save your result. You can still create another story — progress will sync when you're signed in.
          </p>
        )}
      </ActivityLayout>
    );
  }

  const isWriting = step === STORY_STEPS.length;

  return (
    <ActivityLayout
      title="Story Builder"
      subtitle="Choose the pieces of your story, then write it yourself!"
      emoji="📝"
      backTo={BACK_ROUTE}
      onBack={goBack}
      backLabel="Back to Fun"
    >
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Step progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          {STORY_STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <button
                type="button"
                onClick={() => setStep(i)}
                style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: i < step ? '#10b981' : i === step ? GRADIENT : '#e2e8f0',
                  color: i <= step ? '#fff' : '#94a3b8',
                  border: 'none', fontWeight: 900, fontSize: 14, cursor: 'pointer',
                  display: 'grid', placeItems: 'center',
                }}
              >
                {i < step ? <FiCheckCircle size={18} /> : i + 1}
              </button>
              <span style={{ fontSize: 12, fontWeight: 700, color: i === step ? ACCENT : '#94a3b8' }}>
                {s.title.replace('Choose Your ', '')}
              </span>
              {i < STORY_STEPS.length - 1 && <span style={{ color: '#cbd5e1', fontSize: 14 }}>→</span>}
            </React.Fragment>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 800, color: '#64748b' }}>
            {isWriting ? 'Write your story' : `Step ${step + 1} of ${STORY_STEPS.length}`}
          </span>
        </div>

        {!isWriting ? (
          <div
            style={{
              background: '#fff',
              borderRadius: 28,
              border: '1px solid #f1f5f9',
              padding: '28px 26px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span style={{ fontSize: 30 }}>{byId(STORY_STEPS, STORY_STEPS[step].id).options[0].emoji}</span>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#1e293b' }}>
                {STORY_STEPS[step].title}
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {STORY_STEPS[step].options.map((opt) => (
                <ChoiceOption
                  key={opt.value}
                  option={opt}
                  selected={selections[STORY_STEPS[step].id] === opt.value}
                  onSelect={(val) =>
                    setSelections((s) => ({ ...s, [STORY_STEPS[step].id]: val }))
                  }
                />
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 0}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '13px 22px', borderRadius: 14,
                  background: '#fff', color: '#475569', border: '2px solid #e2e8f0',
                  fontWeight: 800, fontSize: 15, cursor: step === 0 ? 'not-allowed' : 'pointer',
                  opacity: step === 0 ? 0.5 : 1,
                }}
              >
                <FiArrowLeft /> Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                disabled={!selections[STORY_STEPS[step].id]}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '13px 24px', borderRadius: 14, border: 'none',
                  background: selections[STORY_STEPS[step].id] ? GRADIENT : '#e2e8f0',
                  color: selections[STORY_STEPS[step].id] ? '#fff' : '#94a3b8',
                  fontWeight: 800, fontSize: 15,
                  cursor: selections[STORY_STEPS[step].id] ? 'pointer' : 'not-allowed',
                  boxShadow: selections[STORY_STEPS[step].id] ? '0 10px 20px -6px rgba(139,92,246,0.4)' : 'none',
                }}
              >
                {step === STORY_STEPS.length - 1 ? 'Write My Story' : 'Next'} <FiArrowRight />
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              background: '#fff',
              borderRadius: 28,
              border: '1px solid #f1f5f9',
              padding: '28px 26px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 900, color: '#1e293b', marginBottom: 16 }}>
              📚 Your Story Ingredients
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
              {(['character', 'place', 'object', 'theme']).map((key) => {
                const opt = STORY_STEPS.find((s) => s.id === key).options.find((o) => o.value === selections[key]);
                return (
                  <span
                    key={key}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      background: '#f5f3ff', border: `1.5px solid ${ACCENT}33`,
                      color: ACCENT, padding: '8px 14px', borderRadius: 14,
                      fontWeight: 800, fontSize: 14,
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{opt?.emoji}</span> {selections[key]}
                  </span>
                );
              })}
            </div>

            <label style={{ fontSize: 15, fontWeight: 900, color: '#1e293b', display: 'block', marginBottom: 8 }}>
              ✍️ Write Your Story
            </label>
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Write what happens next..."
              rows={8}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '16px 18px', borderRadius: 20,
                border: '2px solid #e2e8f0', resize: 'vertical',
                fontFamily: 'inherit', fontSize: 16, lineHeight: 1.7,
                color: '#1e293b', outline: 'none', background: '#fff',
              }}
            />
            <div
              style={{
                marginTop: 8, fontSize: 13, color: canCompleteStory ? '#10b981' : '#94a3b8',
                fontWeight: 700, textAlign: 'right',
              }}
            >
              {canCompleteStory
                ? 'Nice story! You can complete it now.'
                : `Write a little more — you need at least ${MIN_STORY_WORDS} extra words.`}
            </div>

            <div
              style={{
                marginTop: 20, background: '#f8fafc', borderRadius: 16, padding: '14px 16px',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                💡 Story helpers (use if you like)
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {STORY_GUIDES.map((g) => (
                  <span
                    key={g}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      background: '#fff', border: '1px solid #e2e8f0',
                      color: '#64748b', padding: '6px 12px', borderRadius: 99,
                      fontSize: 13, fontWeight: 600,
                    }}
                  >
                    <FiStar size={12} color="#f59e0b" /> {g}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={prevStep}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '13px 22px', borderRadius: 14,
                  background: '#fff', color: '#475569', border: '2px solid #e2e8f0',
                  fontWeight: 800, fontSize: 15, cursor: 'pointer',
                }}
              >
                <FiArrowLeft /> Back
              </button>
              <button
                type="button"
                onClick={handleComplete}
                disabled={!canCompleteStory}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '13px 26px', borderRadius: 14, border: 'none',
                  background: canCompleteStory ? GRADIENT : '#e2e8f0',
                  color: canCompleteStory ? '#fff' : '#94a3b8',
                  fontWeight: 800, fontSize: 15,
                  cursor: canCompleteStory ? 'pointer' : 'not-allowed',
                  boxShadow: canCompleteStory ? '0 10px 20px -6px rgba(236,72,153,0.4)' : 'none',
                }}
              >
                <FiCheckCircle /> Complete Story
              </button>
            </div>

            <div style={{ marginTop: 18, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
              ⭐ Complete your story to earn <strong style={{ color: ACCENT2 }}>+10 Creativity Points</strong>
            </div>
          </div>
        )}

        {STORY_STEPS.some((s) => selections[s.id]) && !isWriting && (
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => setStep(STORY_STEPS.length)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 20px', borderRadius: 14,
                background: '#fff', color: ACCENT, border: `2px solid ${ACCENT}55`,
                fontWeight: 800, fontSize: 14, cursor: 'pointer',
              }}
            >
              <FiRefreshCcw /> Skip ahead to writing (you can still change choices)
            </button>
          </div>
        )}
      </div>
    </ActivityLayout>
  );
}