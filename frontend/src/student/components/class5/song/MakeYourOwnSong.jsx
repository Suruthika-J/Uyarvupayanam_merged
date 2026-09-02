import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiCheckCircle, FiEdit3, FiMusic } from 'react-icons/fi';
import confetti from 'canvas-confetti';

import { useStudentAuth } from '../../../context/StudentAuthContext';
import class5CommunicationService from '../../../../services/class5CommunicationService';

import ActivityLayout from '../activities/ActivityLayout';
import ActivityCompletion from '../activities/ActivityCompletion';
import ActivityStepProgress from '../activities/ActivityStepProgress';
import SelectionCard from '../activities/SelectionCard';
import {
  SONG_THEMES,
  SONG_MOODS,
  SONG_WORDS_BY_THEME,
  SONG_STEPS,
  SONG_STARTER_IDEAS,
  LYRICS_GUIDES,
  RHYME_HELPER,
  MIN_LYRICS_WORDS,
  MAX_WORDS,
  MIN_WORDS,
} from './MakeYourOwnSongOptions';

const ACTIVITY_ID = 'make_your_own_song';
const BACK_ROUTE = '/student/class5?section=Fun';
const GRADIENT = 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)';
const ACCENT = '#ec4899';
const REVIEW_STEP = SONG_STEPS.length;

function fireConfetti() {
  confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 } });
  setTimeout(() => {
    confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0 } });
    confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1 } });
  }, 250);
}

const emojiFor = (options, value) => {
  const found = options.find((o) => o.value === value);
  return found ? found.emoji : '✨';
};

export default function MakeYourOwnSong() {
  const navigate = useNavigate();
  const { isAuthenticated } = useStudentAuth();

  const [step, setStep] = useState(0);
  const [theme, setTheme] = useState(null);
  const [mood, setMood] = useState(null);
  const [words, setWords] = useState([]);
  const [lyrics, setLyrics] = useState('');
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const goBack = useCallback(() => {
    navigate(BACK_ROUTE);
  }, [navigate]);

  const reset = useCallback(() => {
    setStep(0);
    setTheme(null);
    setMood(null);
    setWords([]);
    setLyrics('');
    setCompleted(false);
    setSaving(false);
    setSaveError(false);
  }, []);

  const nextStep = useCallback(() => {
    setStep((s) => Math.min(s + 1, REVIEW_STEP));
  }, []);

  const prevStep = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const wordOptions = useMemo(() => SONG_WORDS_BY_THEME[theme] || SONG_WORDS_BY_THEME.Nature, [theme]);

  const toggleWord = (val) => {
    setWords((prev) => {
      if (prev.includes(val)) return prev.filter((w) => w !== val);
      if (prev.length >= MAX_WORDS) return prev;
      return [...prev, val];
    });
  };

  const lyricWordCount = useMemo(
    () => (lyrics.trim() ? lyrics.trim().split(/\s+/).filter(Boolean).length : 0),
    [lyrics]
  );
  const canReviewLyrics = lyricWordCount >= MIN_LYRICS_WORDS;

  const canAdvance = useMemo(() => {
    if (step === 0) return Boolean(theme);
    if (step === 1) return Boolean(mood);
    if (step === 2) return words.length >= MIN_WORDS;
    if (step === 3) return canReviewLyrics;
    return true;
  }, [step, theme, mood, words, canReviewLyrics]);

  const rhymeBank = useMemo(() => {
    const bank = {};
    words.forEach((w) => {
      if (RHYME_HELPER[w]) bank[w] = RHYME_HELPER[w];
    });
    return bank;
  }, [words]);

  const selectedWordsText = words.map((w) => `${emojiFor(wordOptions, w)} ${w}`).join('  •  ');

  const handleComplete = useCallback(async () => {
    if (!canReviewLyrics || completed) return;
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
          detail: { theme, mood, words, lyrics },
        });
        setSaveError(false);
      } catch {
        setSaveError(true);
      } finally {
        setSaving(false);
      }
    }
  }, [canReviewLyrics, completed, isAuthenticated, theme, mood, words, lyrics]);

  if (completed) {
    return (
      <ActivityLayout
        title="Make Your Own Song"
        subtitle="Fun · Class 5"
        emoji="🎵"
        backTo={BACK_ROUTE}
        onBack={goBack}
        backLabel="Back to Fun"
      >
        <ActivityCompletion
          emoji="🎉"
          title="Amazing!"
          message="You created your own song!"
          points={[{ label: 'Creativity Points', points: 10, emoji: '⭐', color: ACCENT }]}
          skillChips={[
            { emoji: '🎨', label: 'Creativity', color: '#ec4899' },
            { emoji: '🎤', label: 'Expression', color: '#8b5cf6' },
            { emoji: '📖', label: 'Vocabulary', color: '#3b82f6' },
          ]}
          tryAgainLabel="Create Another Song"
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
            🎵 Your Song
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Theme', value: `${emojiFor(SONG_THEMES, theme)} ${theme}` },
              { label: 'Mood', value: `${emojiFor(SONG_MOODS, mood)} ${mood}` },
              { label: 'Words', value: selectedWordsText },
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
                }}
              >
                <span style={{ fontWeight: 700, color: '#94a3b8', fontSize: 13, width: 70, flexShrink: 0 }}>
                  {row.label}
                </span>
                <span style={{ fontWeight: 800, color: '#1e293b', lineHeight: 1.4 }}>{row.value}</span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 15, fontWeight: 900, color: '#1e293b', marginBottom: 10 }}>
            🎤 My Lyrics
          </div>
          <div
            style={{
              background: '#fff0f7',
              border: '1px solid #fbcfe8',
              borderRadius: 20,
              padding: '18px 20px',
              lineHeight: 1.8,
              color: '#334155',
              fontSize: 16,
              whiteSpace: 'pre-wrap',
              minHeight: 90,
            }}
          >
            {lyrics.trim()}
          </div>

          <div style={{ marginTop: 18, textAlign: 'center', color: '#64748b', fontSize: 14, fontWeight: 700 }}>
            🌟 Your ideas can become amazing creations!
          </div>
        </div>

        {saving && (
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: 14, marginTop: 16 }}>
            Saving your progress…
          </p>
        )}
        {saveError && (
          <p style={{ textAlign: 'center', color: '#dc2626', fontSize: 14, marginTop: 16 }}>
            Could not save your result. You can still make another song — progress will sync when you're signed in.
          </p>
        )}
      </ActivityLayout>
    );
  }

  const isReview = step === REVIEW_STEP;
  const current = SONG_STEPS[step];
  const stepTitle = isReview ? 'Review Your Song' : current.title;

  return (
    <ActivityLayout
      title="Make Your Own Song"
      subtitle="Pick your ideas, then write your very own song!"
      emoji="🎵"
      backTo={BACK_ROUTE}
      onBack={goBack}
      backLabel="Back to Fun"
    >
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <ActivityStepProgress
          steps={SONG_STEPS}
          current={Math.min(step, SONG_STEPS.length - 1)}
          accent={ACCENT}
          gradient={GRADIENT}
          onStepClick={(i) => step < SONG_STEPS.length && setStep(i)}
          rightLabel={isReview ? 'Review your song' : `Step ${step + 1} of ${SONG_STEPS.length}`}
        />

        {!isReview ? (
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 30 }}>
                {step === 0 ? '🎶' : step === 1 ? '🎭' : step === 2 ? '🔤' : '✍️'}
              </span>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#1e293b' }}>{stepTitle}</h2>
            </div>

            {step === 0 && (
              <>
                <p style={{ color: '#64748b', fontSize: 15, margin: '6px 0 20px' }}>
                  Pick the topic your song will be about!
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {SONG_THEMES.map((t) => (
                    <SelectionCard
                      key={t.value}
                      option={t}
                      selected={theme === t.value}
                      onSelect={setTheme}
                      accent={ACCENT}
                    />
                  ))}
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <p style={{ color: '#64748b', fontSize: 15, margin: '6px 0 20px' }}>
                  Choose the feeling your song should give!
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {SONG_MOODS.map((m) => (
                    <SelectionCard
                      key={m.value}
                      option={m}
                      selected={mood === m.value}
                      onSelect={setMood}
                      accent={ACCENT}
                    />
                  ))}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <p style={{ color: '#64748b', fontSize: 15, margin: '6px 0 4px' }}>
                  Tap <strong>{MIN_WORDS}–{MAX_WORDS}</strong> words that fit your song!
                </p>
                <div style={{ fontSize: 14, fontWeight: 800, color: ACCENT, marginBottom: 20 }}>
                  Selected Words: {words.length}/{MAX_WORDS}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {wordOptions.map((w) => {
                    const isSelected = words.includes(w.value);
                    const isFull = words.length >= MAX_WORDS;
                    return (
                      <SelectionCard
                        key={w.value}
                        option={w}
                        selected={isSelected}
                        disabled={isFull && !isSelected}
                        onSelect={toggleWord}
                        accent={ACCENT}
                      />
                    );
                  })}
                </div>
                {words.length < MIN_WORDS && (
                  <div style={{ marginTop: 16, fontSize: 13, fontWeight: 700, color: '#94a3b8', textAlign: 'right' }}>
                    Pick at least {MIN_WORDS} words to continue.
                  </div>
                )}
              </>
            )}

            {step === 3 && (
              <>
                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: 18,
                    padding: '16px 18px',
                    margin: '6px 0 20px',
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                    🎵 Your Song Ingredients
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 15, fontWeight: 700, color: '#334155' }}>
                    <div>Theme: <span style={{ fontWeight: 900, color: '#1e293b' }}>{emojiFor(SONG_THEMES, theme)} {theme}</span></div>
                    <div>Mood: <span style={{ fontWeight: 900, color: '#1e293b' }}>{emojiFor(SONG_MOODS, mood)} {mood}</span></div>
                    {words.length > 0 && (
                      <div style={{ lineHeight: 1.5 }}>
                        Words: <span style={{ fontWeight: 900, color: '#1e293b' }}>{selectedWordsText}</span>
                      </div>
                    )}
                  </div>
                </div>

                <label style={{ fontSize: 15, fontWeight: 900, color: '#1e293b', display: 'block', marginBottom: 8 }}>
                  🎤 My Song
                </label>
                <textarea
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder="Start with your first line..."
                  rows={8}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '16px 18px',
                    borderRadius: 20,
                    border: '2px solid #e2e8f0',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    fontSize: 16,
                    lineHeight: 1.7,
                    color: '#1e293b',
                    outline: 'none',
                    background: '#fff',
                  }}
                />
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 13,
                    color: canReviewLyrics ? '#10b981' : '#ef4444',
                    fontWeight: 700,
                    textAlign: 'right',
                  }}
                >
                  {canReviewLyrics
                    ? 'Nice lyrics! You can review your song now. 🎵'
                    : 'Add a few lines to complete your song! 🎵'}
                </div>

                {Object.keys(rhymeBank).length > 0 && (
                  <div style={{ marginTop: 20, background: '#fffbeb', borderRadius: 16, padding: '14px 16px' }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                      🎵 Rhyme Helper (optional)
                    </div>
                    {Object.entries(rhymeBank).map(([word, rhymes]) => (
                      <div key={word} style={{ marginBottom: 6, fontSize: 14, fontWeight: 700, color: '#78350f' }}>
                        {word}: <span style={{ fontWeight: 700, color: '#b45309' }}>{rhymes.join(' · ')}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  style={{
                    marginTop: 20,
                    background: '#f8fafc',
                    borderRadius: 16,
                    padding: '14px 16px',
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                    💡 Song helpers (use if you like)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, color: '#475569', fontWeight: 600 }}>
                    {LYRICS_GUIDES.map((g) => (
                      <span key={g}>{g}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 10, fontWeight: 600, lineHeight: 1.6 }}>
                    Try a starter like: “{SONG_STARTER_IDEAS[0]}” or “{SONG_STARTER_IDEAS[2].replace('{theme}', theme || 'my favourite')}” and keep writing your own lines!
                  </div>
                </div>
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 0}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '13px 22px',
                  borderRadius: 14,
                  background: '#fff',
                  color: '#475569',
                  border: '2px solid #e2e8f0',
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: step === 0 ? 'not-allowed' : 'pointer',
                  opacity: step === 0 ? 0.5 : 1,
                }}
              >
                <FiArrowLeft /> Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                disabled={!canAdvance}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '13px 24px',
                  borderRadius: 14,
                  border: 'none',
                  background: canAdvance ? GRADIENT : '#e2e8f0',
                  color: canAdvance ? '#fff' : '#94a3b8',
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: canAdvance ? 'pointer' : 'not-allowed',
                  boxShadow: canAdvance ? '0 10px 20px -6px rgba(236,72,153,0.4)' : 'none',
                }}
              >
                {step === SONG_STEPS.length - 1 ? 'Review My Song' : 'Next'} <FiArrowRight />
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <FiMusic size={26} color={ACCENT} />
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#1e293b' }}>🎵 Your Song</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                { label: 'Theme', value: `${emojiFor(SONG_THEMES, theme)} ${theme}` },
                { label: 'Mood', value: `${emojiFor(SONG_MOODS, mood)} ${mood}` },
                { label: 'Words', value: selectedWordsText },
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
                  }}
                >
                  <span style={{ fontWeight: 700, color: '#94a3b8', fontSize: 13, width: 70, flexShrink: 0 }}>
                    {row.label}
                  </span>
                  <span style={{ fontWeight: 800, color: '#1e293b', lineHeight: 1.4 }}>{row.value}</span>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 15, fontWeight: 900, color: '#1e293b', marginBottom: 10 }}>🎤 My Lyrics</div>
            <div
              style={{
                background: '#fff0f7',
                border: '1px solid #fbcfe8',
                borderRadius: 20,
                padding: '18px 20px',
                lineHeight: 1.8,
                color: '#334155',
                fontSize: 16,
                whiteSpace: 'pre-wrap',
                minHeight: 100,
                marginBottom: 24,
              }}
            >
              {lyrics.trim()}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setStep(SONG_STEPS.length - 1)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '13px 22px',
                  borderRadius: 14,
                  background: '#fff',
                  color: '#475569',
                  border: '2px solid #e2e8f0',
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: 'pointer',
                }}
              >
                <FiEdit3 /> Edit Song
              </button>
              <button
                type="button"
                onClick={handleComplete}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '13px 26px',
                  borderRadius: 14,
                  border: 'none',
                  background: GRADIENT,
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: 'pointer',
                  boxShadow: '0 10px 20px -6px rgba(236,72,153,0.4)',
                }}
              >
                <FiCheckCircle /> Complete Song
              </button>
            </div>
          </div>
        )}

        {!isReview && (
          <div style={{ marginTop: 18, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
            ⭐ Finish your song to earn <strong style={{ color: ACCENT }}>+10 Creativity Points</strong>
          </div>
        )}
      </div>
    </ActivityLayout>
  );
}