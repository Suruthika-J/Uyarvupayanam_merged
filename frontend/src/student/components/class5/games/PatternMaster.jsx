import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiPlay, FiArrowRight, FiSend } from 'react-icons/fi';
import confetti from 'canvas-confetti';

import { useStudentAuth } from '../../../context/StudentAuthContext';
import class5CommunicationService from '../../../../services/class5CommunicationService';

import ActivityHeader from '../activities/ActivityHeader';
import QuestionProgress from './QuestionProgress';
import OptionButton from './OptionButton';
import ResultScreen from './ResultScreen';
import { PATTERN_MASTER_QUESTIONS } from './PatternMasterQuestions';
import { computeResult, encouragingMessage, GAME_LEVEL, POINTS_PER_QUESTION } from './scoreUtils';

const ACTIVITY_ID = 'pattern_master';
const QUESTION_COUNT = PATTERN_MASTER_QUESTIONS.length;

function fireConfetti() {
  confetti({ particleCount: 140, spread: 75, origin: { y: 0.6 } });
  setTimeout(() => {
    confetti({ particleCount: 70, angle: 60, spread: 55, origin: { x: 0 } });
    confetti({ particleCount: 70, angle: 120, spread: 55, origin: { x: 1 } });
  }, 250);
}

export default function PatternMaster() {
  const navigate = useNavigate();
  const { isAuthenticated } = useStudentAuth();

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [result, setResult] = useState(null);

  const question = PATTERN_MASTER_QUESTIONS[current];
  const isCorrect = selected === question.answer;

  const handleSubmit = useCallback(() => {
    if (!selected || submitted) return;
    setSubmitted(true);
    if (selected === question.answer) {
      setCorrectCount((c) => c + 1);
    }
  }, [selected, submitted, question]);

  const finishGame = useCallback(async () => {
    const res = computeResult(correctCount, QUESTION_COUNT);
    setFinished(true);
    setResult(res);

    if (res.percentage >= 80) fireConfetti();

    if (isAuthenticated) {
      setSaving(true);
      try {
        await class5CommunicationService.submitActivityResult({
          activityId: ACTIVITY_ID,
          score: res.score,
          total: QUESTION_COUNT,
          correct: res.correct,
          incorrect: res.incorrect,
          percentage: res.percentage,
        });
        setSaveError(false);
      } catch {
        setSaveError(true);
      } finally {
        setSaving(false);
      }
    }
  }, [correctCount, isAuthenticated]);

  const handleNext = useCallback(() => {
    if (current < QUESTION_COUNT - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setSubmitted(false);
    } else {
      finishGame();
    }
  }, [current, finishGame]);

  const reset = useCallback(() => {
    setCurrent(0);
    setSelected(null);
    setSubmitted(false);
    setCorrectCount(0);
    setFinished(false);
    setSaving(false);
    setSaveError(false);
    setResult(null);
  }, []);

  const goBack = useCallback(() => {
    navigate('/student/class5?section=Games');
  }, [navigate]);

  if (finished && result) {
    const skills = [
      { name: 'logicalThinking', label: 'Logical Thinking', percentage: result.percentage },
      { name: 'problemSolving', label: 'Problem Solving', percentage: result.percentage },
    ];
    return (
      <div className="student-root" style={{ background: '#f8fafc', minHeight: '100vh', padding: '40px 24px 100px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <ActivityHeader
            title="Pattern Master"
            subtitle="Games · Class 5"
            onBack={goBack}
            emoji="🔍"
          />
          <ResultScreen
            result={result}
            skills={skills}
            message={encouragingMessage(result.percentage)}
            onPlayAgain={reset}
            onBack={goBack}
          />
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
        </div>
      </div>
    );
  }

  return (
    <div className="student-root" style={{ background: '#f8fafc', minHeight: '100vh', padding: '40px 24px 100px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <ActivityHeader
          title="Pattern Master"
          subtitle="Find the pattern and discover what comes next!"
          onBack={goBack}
          emoji="🔍"
        />

        <div
          style={{
            background: '#fff',
            borderRadius: 28,
            border: '1px solid #f1f5f9',
            padding: '28px 26px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          }}
        >
          <QuestionProgress current={current} total={QUESTION_COUNT} color="#8b5cf6" />

          {/* Level badge */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: '#8b5cf6',
                background: '#f5f3ff',
                padding: '6px 14px',
                borderRadius: 12,
              }}
            >
              Level {GAME_LEVEL}
            </span>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#64748b' }}>
              Score: {correctCount * POINTS_PER_QUESTION}
            </span>
          </div>

          {/* Question */}
          <p style={{ fontSize: 16, fontWeight: 600, color: '#475569', margin: '0 0 8px' }}>
            {question.prompt}
          </p>
          <div
            style={{
              fontSize: 30,
              fontWeight: 900,
              color: '#1e293b',
              letterSpacing: '0.02em',
              textAlign: 'center',
              background: '#f8fafc',
              borderRadius: 18,
              padding: '24px 16px',
              marginBottom: 24,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {question.pattern}
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 22 }}>
            {question.options.map((opt, idx) => (
              <OptionButton
                key={opt}
                option={opt}
                index={idx}
                selected={selected === opt}
                revealed={submitted}
                isCorrectOption={submitted && opt === question.answer}
                disabled={submitted}
                onSelect={setSelected}
              />
            ))}
          </div>

          {/* Feedback */}
          {submitted && (
            <div
              style={{
                padding: 16,
                borderRadius: 16,
                background: isCorrect ? '#ecfdf5' : '#fef2f2',
                color: isCorrect ? '#065f46' : '#991b1b',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 22,
                animation: 'fadeUp 0.3s ease-out',
              }}
            >
              {isCorrect ? <FiCheckCircle size={22} /> : <FiXCircle size={22} />}
              <span style={{ fontWeight: 700 }}>
                {isCorrect
                  ? "Awesome! That's the right pattern!"
                  : `Oops! The correct answer is "${question.answer}". ${question.hint}`}
              </span>
            </div>
          )}

          {/* Actions */}
          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={!selected}
              style={{
                width: '100%',
                padding: '16px 0',
                borderRadius: 16,
                border: 'none',
                background: selected
                  ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                  : '#e2e8f0',
                color: selected ? '#fff' : '#94a3b8',
                fontWeight: 800,
                fontSize: 16,
                cursor: selected ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: selected ? '0 10px 20px -6px rgba(99,102,241,0.4)' : 'none',
              }}
            >
              <FiSend /> Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              style={{
                width: '100%',
                padding: '16px 0',
                borderRadius: 16,
                border: 'none',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                fontWeight: 800,
                fontSize: 16,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 10px 20px -6px rgba(16,185,129,0.4)',
              }}
            >
              {current < QUESTION_COUNT - 1 ? (
                <>
                  <FiArrowRight /> Next Question
                </>
              ) : (
                <>
                  <FiPlay /> See My Result
                </>
              )}
            </button>
          )}
        </div>

        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, marginTop: 20 }}>
          Score: correct answer = {POINTS_PER_QUESTION} points · Maximum = {QUESTION_COUNT * POINTS_PER_QUESTION} points
        </p>
      </div>
    </div>
  );
}
