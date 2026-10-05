import React, { useState, useEffect } from 'react';
import { FiX, FiCheckCircle, FiXCircle, FiHelpCircle, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { SBtn, SInput, SSelect, SLoader } from '../ui';
import axios from '../../../config/axios';

/**
 * "Check My Eligibility" for a single course.
 *
 * This component holds no eligibility rules of its own. The questions it asks
 * and the verdict it shows both come from the server, which derives them from
 * the `eligibility` text stored on THIS course. Two different courses therefore
 * produce different questions and different checks without anything here
 * changing.
 */

const VERDICT_STYLE = {
  eligible: {
    icon: FiCheckCircle,
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#bbf7d0',
  },
  'not-eligible': {
    icon: FiXCircle,
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
  },
  'unable-to-determine': {
    icon: FiHelpCircle,
    color: '#b45309',
    bg: '#fffbeb',
    border: '#fde68a',
  },
};

const CHECK_STYLE = {
  met: { icon: FiCheckCircle, color: '#16a34a', bg: '#f0fdf4', word: 'Satisfied' },
  'not-met': { icon: FiXCircle, color: '#dc2626', bg: '#fef2f2', word: 'Not satisfied' },
  unknown: { icon: FiHelpCircle, color: '#b45309', bg: '#fffbeb', word: 'Not checked' },
};

export default function EligibilityCheckerModal({ isOpen, onClose, course }) {
  // The questions to ask. Seeded from the course details payload so the modal
  // can open instantly; the server re-derives them on submit.
  const [criteria, setCriteria] = useState(course?.eligibilityCriteria || null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCriteria, setLoadingCriteria] = useState(false);
  const [error, setError] = useState('');

  // Reset whenever the modal is opened for a course.
  useEffect(() => {
    if (!isOpen) return;
    setAnswers({});
    setResult(null);
    setNotice('');
    setError('');
    setCriteria(course?.eligibilityCriteria || null);

    // If the course payload did not carry criteria, fetch them.
    if (!course?.eligibilityCriteria && course?._id) {
      setLoadingCriteria(true);
      axios.get(`/student/courses/${course._id}`)
        .then((res) => setCriteria(res.data?.eligibilityCriteria || null))
        .catch(() => setError('Could not load the eligibility criteria for this course.'))
        .finally(() => setLoadingCriteria(false));
    }
  }, [isOpen, course]);

  // Lock background scroll while open.
  useEffect(() => {
    if (!isOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [isOpen]);

  // Escape to close.
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const questions = criteria?.questions || [];

  const toggleMulti = (questionId, value) => {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [questionId]: next };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');
    try {
      const res = await axios.post(`/student/courses/${course._id}/eligibility-check`, answers);
      if (res.data?.result) {
        setResult(res.data.result);
      } else {
        setResult(null);
        setNotice(res.data?.message || 'Eligibility cannot be determined for this course.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startAgain = () => {
    setAnswers({});
    setResult(null);
    setNotice('');
    setError('');
  };

  /* ── Nothing checkable stored for this course ─────────────── */
  if (loadingCriteria) {
    return (
      <Overlay>
        <Panel>
          <div style={{ padding: 48, display: 'grid', placeItems: 'center' }}>
            <SLoader />
          </div>
        </Panel>
      </Overlay>
    );
  }

  if (criteria && !criteria.determinable) {
    return (
      <Overlay>
        <Panel>
          <CloseButton onClose={onClose} />
          <Body>
            <Banner
              icon={<FiAlertCircle size={26} color="#b45309" style={{ flexShrink: 0, marginTop: 2 }} />}
              color="#b45309"
              bg="#fffbeb"
              border="#fde68a"
              title="Eligibility cannot be determined"
              text={criteria.reason}
            />
            {criteria.source ? (
              <StoredCriteria source={criteria.source} />
            ) : null}
            <SBtn variant="secondary" fullWidth onClick={onClose} style={{ borderRadius: 14, marginTop: 24 }}>
              Close
            </SBtn>
          </Body>
        </Panel>
      </Overlay>
    );
  }

  /* ── Result ─────────────────────────────────────────────── */
  if (result) {
    const v = VERDICT_STYLE[result.verdict] || VERDICT_STYLE['unable-to-determine'];
    const Icon = v.icon;

    return (
      <Overlay>
        <Panel wide>
          <CloseButton onClose={onClose} />
          <Body>
            <Banner
              icon={<Icon size={26} color={v.color} style={{ flexShrink: 0, marginTop: 2 }} />}
              color={v.color}
              bg={v.bg}
              border={v.border}
              title={result.headline}
              text={result.summary}
            />

            <SectionTitle>Requirement by requirement</SectionTitle>
            <div style={{ display: 'grid', gap: 10 }}>
              {result.checks.map((check) => {
                const s = CHECK_STYLE[check.status] || CHECK_STYLE.unknown;
                const CIcon = s.icon;
                return (
                  <div
                    key={check.id}
                    style={{
                      display: 'flex', gap: 12, padding: '14px 16px',
                      borderRadius: 14, background: s.bg, border: `1px solid ${v.border}33`,
                    }}
                  >
                    <CIcon size={20} color={s.color} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--s-text)' }}>{check.label}</div>
                      <div style={{ fontSize: 13, color: 'var(--s-text2)', marginTop: 3 }}>{check.detail}</div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: s.color, textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 6 }}>
                        {s.word}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {result.caveats?.length > 0 && (
              <div style={{ marginTop: 20, display: 'grid', gap: 8 }}>
                {result.caveats.map((c) => (
                  <div key={c} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#b45309', background: '#fffbeb', padding: '12px 14px', borderRadius: 12, border: '1px solid #fde68a' }}>
                    <FiAlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 20, display: 'flex', gap: 8, fontSize: 13, color: 'var(--s-text2)', background: '#f8fafc', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--s-border)', lineHeight: 1.6 }}>
              <FiInfoDot />
              <span>{result.disclaimer}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 24 }}>
              <SBtn variant="secondary" fullWidth onClick={startAgain} style={{ borderRadius: 14 }} icon={<FiRefreshCw size={16} />}>
                Edit answers
              </SBtn>
              <SBtn variant="primary" fullWidth onClick={onClose} style={{ borderRadius: 14 }}>
                Close
              </SBtn>
            </div>
          </Body>
        </Panel>
      </Overlay>
    );
  }

  /* ── Form ───────────────────────────────────────────────── */
  return (
    <Overlay>
      <Panel wide>
        <CloseButton onClose={onClose} />
        <Body>
          <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 6 }}>Check My Eligibility</h2>
          <p style={{ color: 'var(--s-text2)', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
            These are the questions for <strong>{course?.courseName}</strong>, based only on the eligibility
            criteria stored for this course.
          </p>

          {criteria?.source ? <StoredCriteria source={criteria.source} /> : null}

          {notice && (
            <div style={{ marginTop: 18 }}>
              <Banner
                icon={<FiAlertCircle size={26} color="#b45309" style={{ flexShrink: 0, marginTop: 2 }} />}
                color="#b45309"
                bg="#fffbeb"
                border="#fde68a"
                title="Eligibility cannot be determined"
                text={notice}
              />
            </div>
          )}

          {questions.length === 0 ? (
            <Banner
              icon={<FiAlertCircle size={26} color="#b45309" style={{ flexShrink: 0, marginTop: 2 }} />}
              color="#b45309"
              bg="#fffbeb"
              border="#fde68a"
              title="Nothing to check"
              text="This course has no eligibility criteria stored, so eligibility cannot be determined."
            />
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 20, marginTop: 22 }}>
              {questions.map((q) => (
                <Question key={q.id} question={q} answers={answers} setAnswers={setAnswers} onToggle={toggleMulti} />
              ))}

              {criteria?.caveats?.map((c) => (
                <div key={c} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#b45309', background: '#fffbeb', padding: '12px 14px', borderRadius: 12, border: '1px solid #fde68a' }}>
                  <FiAlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{c}</span>
                </div>
              ))}

              {error && (
                <div style={{ fontSize: 13, color: '#dc2626', background: '#fef2f2', padding: '12px 14px', borderRadius: 12, border: '1px solid #fecaca' }}>
                  {error}
                </div>
              )}

              <div style={{ fontSize: 12, color: 'var(--s-text3)', lineHeight: 1.6 }}>
                Your answers are compared with the stored criteria only. This is not a prediction of admission
                and does not consider cut-offs, ranking, reservation or seat availability.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <SBtn variant="secondary" fullWidth type="button" onClick={onClose} style={{ borderRadius: 14 }}>
                  Cancel
                </SBtn>
                <SBtn variant="primary" fullWidth type="submit" loading={loading} style={{ borderRadius: 14 }}>
                  {loading ? 'Checking…' : 'Check eligibility'}
                </SBtn>
              </div>
            </form>
          )}
        </Body>
      </Panel>
    </Overlay>
  );
}

/* ── One question, rendered from whatever the server described ── */

function Question({ question, answers, setAnswers, onToggle }) {
  if (question.type === 'select') {
    return (
      <SSelect
        label={question.label}
        value={answers[question.id] ?? ''}
        onChange={(e) => setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))}
        options={[
          { value: '', label: 'Select an answer' },
          ...question.options,
        ]}
      />
    );
  }

  if (question.type === 'number') {
    return (
      <div>
        <SInput
          label={`${question.label} (%)`}
          type="number"
          inputMode="decimal"
          min={question.min}
          max={question.max}
          placeholder="e.g. 72"
          value={answers[question.id] ?? ''}
          onChange={(e) => setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))}
        />
        {question.help && <Help>{question.help}</Help>}
      </div>
    );
  }

  if (question.type === 'multi') {
    const selected = answers[question.id] || [];
    return (
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--s-text2)', marginBottom: 8 }}>{question.label}</div>
        {question.help && <Help>{question.help}</Help>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: question.help ? 10 : 0 }}>
          {question.options.map((opt) => {
            const on = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onToggle(question.id, opt.value)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '9px 14px', borderRadius: 99, cursor: 'pointer',
                  fontSize: 13.5, fontWeight: 700, fontFamily: 'var(--s-font-body)',
                  background: on ? 'var(--s-primary)' : '#fff',
                  color: on ? '#fff' : 'var(--s-text2)',
                  border: `1.5px solid ${on ? 'var(--s-primary)' : 'var(--s-border)'}`,
                  transition: 'all 0.15s ease',
                }}
              >
                {on && <FiCheckCircle size={14} />}
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}

/* ── Small presentational pieces ──────────────────────────── */

const Help = ({ children }) => (
  <div style={{ fontSize: 12, color: 'var(--s-text3)', marginTop: 5 }}>{children}</div>
);

const SectionTitle = ({ children }) => (
  <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--s-text)', margin: '24px 0 12px' }}>{children}</h3>
);

const FiInfoDot = () => (
  <span style={{ flexShrink: 0, marginTop: 2, color: 'var(--s-text3)', fontWeight: 800 }}>i</span>
);

// `icon` is a rendered node rather than a component reference: this project's
// eslint config has no react plugin, so a component passed in as a destructured
// parameter would be reported as an unused variable.
function Banner({ icon, color, bg, border, title, text }) {
  return (
    <div style={{ display: 'flex', gap: 14, padding: 20, borderRadius: 18, background: bg, border: `1px solid ${border}` }}>
      {icon}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 900, color }}>{title}</div>
        {text && <div style={{ fontSize: 14, color: 'var(--s-text2)', marginTop: 6, lineHeight: 1.6 }}>{text}</div>}
      </div>
    </div>
  );
}

function StoredCriteria({ source }) {
  return (
    <div style={{ background: '#f8fafc', border: '1px solid var(--s-border)', borderRadius: 14, padding: '14px 16px' }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--s-text3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 }}>
        Stored eligibility for this course
      </div>
      <div style={{ fontSize: 14, color: 'var(--s-text)', fontWeight: 600, lineHeight: 1.5 }}>{source}</div>
    </div>
  );
}

const CloseButton = ({ onClose }) => (
  <button
    type="button"
    onClick={onClose}
    aria-label="Close"
    style={{
      position: 'absolute', top: 22, right: 22, background: '#f1f5f9', border: 'none',
      width: 38, height: 38, borderRadius: 12, cursor: 'pointer', display: 'grid',
      placeItems: 'center', color: '#64748b',
    }}
  >
    <FiX size={19} />
  </button>
);

const Overlay = ({ children }) => (
  <div
    style={{
      position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)',
      zIndex: 1000, display: 'grid', placeItems: 'center', padding: 20, overflowY: 'auto',
    }}
  >
    {children}
  </div>
);

const Body = ({ children }) => (
  <div style={{ padding: '36px 36px 32px' }}>{children}</div>
);

const Panel = ({ children, wide }) => (
  <div
    style={{
      background: '#fff', borderRadius: 28, maxWidth: wide ? 620 : 520, width: '100%',
      position: 'relative', overflow: 'hidden', margin: 'auto',
    }}
    className="s-anim-up"
  >
    {children}
  </div>
);
