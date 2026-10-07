import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '../../context/StudentAuthContext';
import onboardingService from '../../../services/onboardingService';
import activityService from '../../services/activityService';
import { SBtn, SCard, SLoader } from '../../components/ui';
import { FiTrendingUp, FiTarget, FiZap, FiCheck, FiArrowRight, FiBook, FiAward, FiStar, FiLock, FiUnlock, FiMap, FiActivity, FiSmile } from 'react-icons/fi';

const skillColor = (p) => (p >= 80 ? '#10b981' : p >= 60 ? '#f59e0b' : '#ef4444');

const DIM_LABELS = {
    accuracy: 'Accuracy', understanding: 'Understanding', application: 'Application',
    reasoning: 'Reasoning', problemSolving: 'Problem Solving', patternRecognition: 'Pattern Recognition',
    comprehension: 'Comprehension', communication: 'Communication', consistency: 'Consistency'
};

const DIM_COLORS = {
    accuracy: '#3b82f6', understanding: '#6366f1', application: '#8b5cf6',
    reasoning: '#0ea5e9', problemSolving: '#14b8a6', patternRecognition: '#f59e0b',
    comprehension: '#ec4899', communication: '#f97316', consistency: '#10b981'
};

const STATUS_META = {
    advanced: { label: 'Advanced', bg: '#dcfce7', fg: '#166534' },
    ready: { label: 'Ready', bg: '#d1fae5', fg: '#065f46' },
    developing: { label: 'Developing', bg: '#fef9c3', fg: '#854d0e' },
    foundation: { label: 'Foundation', bg: '#fee2e2', fg: '#991b1b' },
    insufficient_evidence: { label: 'Not Enough Evidence', bg: '#f1f5f9', fg: '#475569' }
};

const COG_LABEL = {
    recall: 'Recall', understanding: 'Understanding', application: 'Application',
    reasoning: 'Reasoning', problem_solving: 'Problem Solving',
    pattern_recognition: 'Pattern Recognition', interpretation: 'Interpretation',
    communication: 'Communication'
};

export default function RecommendationResultPage() {
    const { student } = useStudentAuth();
    const navigate = useNavigate();
    const [ld, setLd] = useState(null);       // LD-NBSE payload
    const [result, setResult] = useState(null); // legacy payload (fallback)
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const studentId = student?._id || student?.id;
                const [ldRes, recRes, respRes] = await Promise.allSettled([
                    onboardingService.ldGetResult(studentId),
                    onboardingService.getRecommendations(studentId),
                    onboardingService.getLatestResponse(studentId)
                ]);
                if (ldRes.status === 'fulfilled' && ldRes.value.success) {
                    setLd(ldRes.value);
                }
                if (recRes.status === 'fulfilled' && recRes.value.success) {
                    setResult(recRes.value.result);
                }
                if (respRes.status === 'fulfilled' && respRes.value.success) {
                    setResponse(respRes.value.response);
                }
            } catch (err) {
                console.error("Fetch result error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (student) fetchResult();
    }, [student]);

    useEffect(() => {
        if (student?.userType === 'college_student') {
            navigate('/student/advisor', { replace: true });
            return;
        }
    }, [student, navigate]);

    // Recent Activity — a completed career assessment (fire-and-forget; the
    // server dedupes so revisiting this page won't stack duplicate entries).
    useEffect(() => {
        if (loading || (!ld && !result)) return;
        activityService.record({
            type: 'career_assessment_completed',
            title: 'Completed Career Assessment',
            description: 'Your personalized career recommendations are ready',
            metadata: { entityId: 'career-assessment', link: '/student/onboarding/result' },
        });
    }, [loading, ld, result]);

    if (student?.userType === 'college_student') return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><SLoader /></div>;
    if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><SLoader /></div>;

    // LD-NBSE dashboard is the primary view; legacy data renders the old layout.
    if (ld) return <LdDashboard ld={ld} student={student} navigate={navigate} />;

    if (!result) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SCard style={{ textAlign: 'center', padding: 32 }}>
                <h2>No results found</h2>
                <SBtn variant="primary" onClick={() => navigate('/student/onboarding')}>Take Assessment</SBtn>
            </SCard>
        </div>
    );

    return <LegacyDashboard result={result} response={response} navigate={navigate} />;
}

// ═══════════════════════════════════════════════════════════════════════
// LD-NBSE dashboard
// ═══════════════════════════════════════════════════════════════════════
function LdDashboard({ ld, student, navigate }) {
    const {
        grade, studentProfile, learningDNA, skillDiagnosis = [], interestProfile = {},
        detectedGaps = [], primaryFocus, secondaryFocus = [], strengthsToMaintain = [],
        lockedSkills = [], unlockedSkills = [], learningPath = [], progress = [],
        areasToExplore = [], explanation, recommendationType, confidence, cycle
    } = ld;

    const dims = learningDNA?.dimensions || {};
    const interests = interestProfile.interests || {};
    const dnaDims = Object.keys(DIM_LABELS).filter((d) => dims[d] && typeof dims[d].score === 'number');
    const maxGap = [...detectedGaps].sort((a, b) => (a.severity === 'high' ? -1 : 0) - (b.severity === 'high' ? -1 : 0))[0];
    const developing = skillDiagnosis
        .filter((p) => p.status === 'foundation' || p.status === 'developing' || (p.status === 'insufficient_evidence' && p.attemptedCount > 0))
        .sort((a, b) => (a.weightedScore || 0) - (b.weightedScore || 0));

    return (
        <div className="student-root" style={{ minHeight: '100vh', background: '#f6f8fb', padding: '48px 20px 110px' }}>
            <div style={{ width: '100%', maxWidth: 1080, margin: '0 auto' }}>
                {/* Hero */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{
                        width: 84, height: 84, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: '#fff',
                        borderRadius: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px', fontSize: 40, boxShadow: '0 12px 30px rgba(59,130,246,0.35)'
                    }}>
                        <FiActivity />
                    </div>
                    <h1 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 34, color: 'var(--s-text)', marginBottom: 8 }}>
                        {studentProfile?.name ? `${studentProfile.name.split(' ')[0]}'s Learning DNA` : 'My Learning DNA'}
                    </h1>
                    <p style={{ color: 'var(--s-text3)', fontSize: 16, maxWidth: 640, margin: '0 auto' }}>
                        {grade || ''} · Assessment cycle {cycle || 1} · Confidence: <b>{confidence || 'medium'}</b>
                    </p>
                    {explanation?.summary && (
                        <div style={{
                            marginTop: 20, display: 'inline-block', maxWidth: 720, textAlign: 'left',
                            background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e3a8a',
                            borderRadius: 16, padding: '16px 24px', fontSize: 15, fontWeight: 600, lineHeight: 1.6
                        }}>
                            {explanation.summary}
                        </div>
                    )}
                </div>

                {/* My Learning DNA */}
                <SCard style={{ padding: 32, borderRadius: 24, marginBottom: 28 }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
                        <FiActivity color="#3b82f6" /> My Learning DNA
                    </h3>
                    <p style={{ color: 'var(--s-text3)', fontSize: 13, marginBottom: 24 }}>
                        How you performed across cognitive dimensions — numbers are evidence-based, not personality labels.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="s-grid-1col">
                        {dnaDims.map((d) => {
                            const dim = dims[d];
                            const pct = Math.round(Number(dim.score) || 0);
                            return (
                                <div key={d} style={{ padding: '16px 18px', background: '#f8fafc', borderRadius: 16 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                                        <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--s-text)' }}>{DIM_LABELS[d]}</span>
                                        <span style={{ fontWeight: 800, fontSize: 13, color: DIM_COLORS[d] }}>{pct}%</span>
                                    </div>
                                    <div style={{ height: 8, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
                                        <div style={{ width: `${pct}%`, height: '100%', background: DIM_COLORS[d], borderRadius: 99, transition: 'width 0.6s ease-out' }} />
                                    </div>
                                    <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700, color: 'var(--s-text3)' }}>
                                        {dim.evidenceCount} evidence points · {dim.confidence} confidence
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SCard>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="s-grid-1col">
                    {/* Strengths */}
                    <SCard style={{ padding: 26, borderRadius: 20 }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 800, marginBottom: 18 }}>
                            <FiAward style={{ color: '#f59e0b' }} /> Strengths to Maintain
                        </h3>
                        {strengthsToMaintain.length ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                {strengthsToMaintain.map((s, i) => (
                                    <div key={i} style={{ padding: '9px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 99, fontWeight: 700, fontSize: 13, color: '#166534' }}>
                                        {s.subskill} · {s.currentScore}%
                                    </div>
                                ))}
                            </div>
                        ) : <p style={{ color: 'var(--s-text3)', fontSize: 14 }}>Being confirmed with more assessment data.</p>}
                    </SCard>

                    {/* Biggest gap */}
                    <SCard style={{ padding: 26, borderRadius: 20, background: maxGap ? '#fffbeb' : '#f8fafc' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 800, marginBottom: 14 }}>
                            <FiZap style={{ color: '#f59e0b' }} /> Biggest Gap{maxGap ? ` — ${maxGap.label}` : ''}
                        </h3>
                        {maxGap ? (
                            <>
                                <div style={{ marginBottom: 10 }}>
                                    <span style={{
                                        display: 'inline-block', padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 800,
                                        background: maxGap.severity === 'high' ? '#fee2e2' : maxGap.severity === 'medium' ? '#fef9c3' : '#e0f2fe',
                                        color: maxGap.severity === 'high' ? '#991b1b' : maxGap.severity === 'medium' ? '#854d0e' : '#075985'
                                    }}>{maxGap.severity} severity</span>
                                    {maxGap.relatedSkills?.length > 0 && (
                                        <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 700, color: 'var(--s-text3)' }}>
                                            affects: {maxGap.relatedSkills.slice(0, 2).join(', ')}
                                        </span>
                                    )}
                                </div>
                                <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--s-text2)', margin: 0 }}>{maxGap.description}</p>
                            </>
                        ) : <p style={{ color: 'var(--s-text3)', fontSize: 14 }}>No major cognitive gaps detected yet.</p>}
                    </SCard>
                </div>

                {/* Next Best Skill */}
                {primaryFocus && (
                    <SCard style={{ padding: 34, borderRadius: 24, margin: '28px 0', background: 'linear-gradient(to right,#1e293b,#0f172a)', color: '#fff', overflow: 'hidden', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(59,130,246,0.18)' }} />
                        <div style={{ position: 'relative' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99,
                                    background: '#3b82f6', color: '#fff', fontWeight: 800, fontSize: 13
                                }}>
                                    <FiTarget size={14} /> NEXT BEST SKILL
                                </span>
                                <span style={{ padding: '6px 16px', borderRadius: 99, background: 'rgba(255,255,255,0.12)', fontWeight: 800, fontSize: 13, color: '#93c5fd' }}>
                                    {recommendationType}
                                </span>
                            </div>
                            <h2 style={{ fontFamily: 'var(--s-font-display)', fontSize: 30, fontWeight: 900, margin: 0 }}>
                                {primaryFocus.subskill}{' '}
                                <span style={{ color: '#94a3b8', fontWeight: 700, fontSize: 18 }}>in {primaryFocus.skill}</span>
                            </h2>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 24 }} className="s-grid-1col">
                                <MiniRow label="WHY" text={primaryFocus.reason} />
                                <MiniRow label="CURRENT" text={`${primaryFocus.currentScore}% · ${STATUS_META[primaryFocus.currentStatus]?.label || primaryFocus.currentStatus}`} />
                                <MiniRow label="NEXT" text={`Target: ${primaryFocus.targetStatus}`} />
                                <MiniRow label="SUCCESS CONDITION" text={primaryFocus.successCondition} />
                                <MiniRow label="DIFFICULTY" text={`${primaryFocus.recommendedDifficulty} · ${primaryFocus.estimatedEffort}`} />
                                <MiniRow label="PREREQUISITE" text={primaryFocus.prerequisite || 'None required'} />
                            </div>
                            {secondaryFocus?.length > 0 && (
                                <div style={{ marginTop: 18, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                    {secondaryFocus.map((s, i) => (
                                        <div key={i} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 14, padding: '10px 16px', fontSize: 13, fontWeight: 700 }}>
                                            Also: {s.subskill} ({s.currentScore}%)
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </SCard>
                )}

                {/* Developing skills + Learning path */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="s-grid-1col">
                    <SCard style={{ padding: 26, borderRadius: 20 }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 800, marginBottom: 18 }}>
                            <FiTrendingUp style={{ color: '#f97316' }} /> Developing Skills
                        </h3>
                        {developing.length ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {developing.slice(0, 6).map((p, i) => {
                                    const meta = STATUS_META[p.status] || STATUS_META.insufficient_evidence;
                                    return (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--s-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.subskill}</div>
                                                <div style={{ fontSize: 12, color: 'var(--s-text3)', fontWeight: 600 }}>{p.skill}</div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <span style={{ fontWeight: 800, fontSize: 13, color: skillColor(p.weightedScore) }}>{p.weightedScore}%</span>
                                                <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 800, background: meta.bg, color: meta.fg }}>{meta.label}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : <p style={{ color: 'var(--s-text3)', fontSize: 14 }}>No developing skills — you're in great shape.</p>}
                    </SCard>

                    <SCard style={{ padding: 26, borderRadius: 20 }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 800, marginBottom: 18 }}>
                            <FiMap style={{ color: '#8b5cf6' }} /> Learning Path
                        </h3>
                        {learningPath.length ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                {learningPath.map((step, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 14 }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <div style={{
                                                width: 30, height: 30, borderRadius: '50%', background: i === learningPath.length - 1 ? '#8b5cf6' : '#e2e8f0',
                                                color: i === learningPath.length - 1 ? '#fff' : '#64748b',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13
                                            }}>{step.step}</div>
                                            {i < learningPath.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 22, background: '#e2e8f0' }} />}
                                        </div>
                                        <div style={{ paddingBottom: i === learningPath.length - 1 ? 0 : 18 }}>
                                            <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--s-text)' }}>{step.subskill}<span style={{ color: 'var(--s-text3)', fontWeight: 600, fontSize: 12 }}> · {step.skill}</span></div>
                                            <div style={{ fontSize: 12, color: 'var(--s-text3)', fontWeight: 600, marginTop: 2 }}>{step.milestone}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : <p style={{ color: 'var(--s-text3)', fontSize: 14 }}>Computed after your next assessment cycle.</p>}
                    </SCard>
                </div>

                {/* Locked / Unlocked */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }} className="s-grid-1col">
                    <SCard style={{ padding: 26, borderRadius: 20 }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 800, marginBottom: 14 }}>
                            <FiLock style={{ color: '#64748b' }} /> Skills to Unlock
                        </h3>
                        {lockedSkills.length ? lockedSkills.map((l, i) => (
                            <div key={i} style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 12, marginBottom: 10, fontSize: 13, fontWeight: 600 }}>
                                <span style={{ fontWeight: 800, color: 'var(--s-text)' }}>{l.subskill}</span>
                                <span style={{ color: 'var(--s-text3)' }}> — {l.reason}</span>
                            </div>
                        )) : <p style={{ color: 'var(--s-text3)', fontSize: 14 }}>Nothing blocked — prerequisites are in place.</p>}
                    </SCard>
                    <SCard style={{ padding: 26, borderRadius: 20 }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 800, marginBottom: 14 }}>
                            <FiUnlock style={{ color: '#10b981' }} /> Now Available
                        </h3>
                        {unlockedSkills.length ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                {unlockedSkills.map((u, i) => (
                                    <div key={i} style={{ padding: '8px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 99, fontWeight: 700, fontSize: 13, color: '#166534' }}>
                                        {u.subskill}
                                    </div>
                                ))}
                            </div>
                        ) : <p style={{ color: 'var(--s-text3)', fontSize: 14 }}>Complete a prerequisite build to unlock the next level.</p>}
                    </SCard>
                </div>

                {/* Progress */}
                {progress.length > 0 && (
                    <SCard style={{ padding: 26, borderRadius: 20, marginTop: 24 }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 800, marginBottom: 18 }}>
                            <FiTrendingUp style={{ color: '#14b8a6' }} /> My Progress
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {progress.map((p, i) => {
                                const cls = p.classification;
                                const color = cls === 'improving' ? '#059669' : cls === 'declining' ? '#dc2626' : cls === 'mastered' ? '#7c3aed' : '#64748b';
                                return (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, fontSize: 13, fontWeight: 700 }}>
                                        <span style={{ color: 'var(--s-text)' }}>{p.subskill}</span>
                                        <span style={{ color }}>
                                            {cls === 'insufficient_data' ? 'baseline set' : `${p.previousScore ?? '—'} → ${p.currentScore}${p.change !== null ? ` (${p.change > 0 ? '+' : ''}${p.change})` : ''} · ${cls}`}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </SCard>
                )}

                {/* Interests + explore */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }} className="s-grid-1col">
                    <SCard style={{ padding: 26, borderRadius: 20 }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 800, marginBottom: 18 }}>
                            <FiSmile style={{ color: '#f97316' }} /> My Interests
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {Object.entries(interests).filter(([, v]) => typeof v === 'number').sort((a, b) => b[1] - a[1]).slice(0, 6).map(([cat, val]) => (
                                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ width: 110, fontSize: 13, fontWeight: 700, color: 'var(--s-text2)', textTransform: 'capitalize' }}>{cat}</span>
                                    <div style={{ flex: 1, height: 8, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
                                        <div style={{ width: `${val}%`, height: '100%', background: '#f97316', borderRadius: 99 }} />
                                    </div>
                                    <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text3)' }}>{val}%</span>
                                </div>
                            ))}
                        </div>
                        <p style={{ marginTop: 16, fontSize: 12, color: 'var(--s-text3)', fontWeight: 600 }}>
                            Interests are exploratory only — they never decide your skill level.
                        </p>
                    </SCard>

                    <SCard style={{ padding: 26, borderRadius: 20 }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 800, marginBottom: 18 }}>
                            <FiBook style={{ color: '#10b981' }} /> Areas to Explore
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {areasToExplore.map((a, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#f8fafc', borderRadius: 14, padding: '12px 16px', fontSize: 14, fontWeight: 600, color: 'var(--s-text2)', lineHeight: 1.5 }}>
                                    <FiStar style={{ color: '#f59e0b', marginTop: 2 }} /> {a}
                                </div>
                            ))}
                        </div>
                    </SCard>
                </div>

                <div style={{ marginTop: 52, textAlign: 'center' }}>
                    <SBtn variant="primary" onClick={() => navigate('/student/dashboard')} style={{ padding: '18px 60px', fontSize: 17, borderRadius: 18 }}>
                        Continue to Dashboard <FiArrowRight style={{ marginLeft: 10 }} />
                    </SBtn>
                </div>
            </div>
        </div>
    );
}

function MiniRow({ label, text }) {
    return (
        <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '12px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: '#93c5fd', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', lineHeight: 1.5 }}>{text}</div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════
// Legacy dashboard (kept for students diagnosed before LD-NBSE went live)
// ═══════════════════════════════════════════════════════════════════════
function LegacyDashboard({ result, response, navigate }) {
    const skillWise = response?.skillWiseScore || [];
    return (
        <div className="student-root" style={{ minHeight: '100vh', background: '#f8fafc', padding: '60px 20px 100px' }}>
            <div style={{ width: '100%', maxWidth: 1000, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <div style={{ width: 80, height: 80, background: '#eff6ff', color: '#3b82f6', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 40 }}>
                        <FiAward />
                    </div>
                    <h1 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 36, color: 'var(--s-text)', marginBottom: 12 }}>
                        Assessment Complete!
                    </h1>
                    <p style={{ color: 'var(--s-text3)', fontSize: 18, maxWidth: 600, margin: '0 auto' }}>
                        Great job finishing the assessment. Here is your personalized skill report and learning plan.
                    </p>
                </div>

                <SCard style={{ padding: 40, marginBottom: 32, borderRadius: 28, background: 'linear-gradient(to right, #ffffff, #f0f9ff)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 200 }}>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--s-text)', marginBottom: 16 }}>Overall Performance</h2>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                                <span style={{ fontSize: 48, fontWeight: 900, color: '#3b82f6' }}>{result.scorePercentage}%</span>
                                <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--s-text3)' }}>Score</span>
                            </div>
                            <div style={{ height: 10, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden', marginBottom: 12, maxWidth: 320 }}>
                                <div style={{ width: `${result.scorePercentage}%`, height: '100%', background: '#3b82f6', borderRadius: 99, transition: 'width 0.6s ease-out' }} />
                            </div>
                            <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 99, background: '#dcfce7', color: '#166534', fontWeight: 800, fontSize: 14 }}>
                                Level: {result.performanceLevel}
                            </div>
                        </div>

                        <div style={{ flex: 2, minWidth: 300 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--s-text2)', marginBottom: 12 }}>Skill Analysis</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div style={{ padding: 16, background: '#f0fdf4', borderRadius: 16, border: '1px solid #bbf7d0' }}>
                                    <div style={{ color: '#166534', fontWeight: 800, fontSize: 13, marginBottom: 4 }}>STRONG SKILLS</div>
                                    <div style={{ color: '#16a34a', fontWeight: 700, fontSize: 14 }}>{result.strongSkills.join(', ') || 'N/A'}</div>
                                </div>
                                <div style={{ padding: 16, background: '#fef2f2', borderRadius: 16, border: '1px solid #fecaca' }}>
                                    <div style={{ color: '#991b1b', fontWeight: 800, fontSize: 13, marginBottom: 4 }}>NEED IMPROVEMENT</div>
                                    <div style={{ color: '#dc2626', fontWeight: 700, fontSize: 14 }}>{result.weakSkills.join(', ') || 'None'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </SCard>

                {skillWise.length > 0 && (
                    <SCard style={{ padding: 36, borderRadius: 24, marginBottom: 32 }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 20, fontWeight: 800, marginBottom: 24 }}>
                            <FiTrendingUp color="#3b82f6" /> Per-Skill Breakdown
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {skillWise.map(s => (
                                <div key={s.skillTag}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                                        <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--s-text)' }}>{s.skillTag}</span>
                                        <span style={{ fontWeight: 800, fontSize: 14, color: skillColor(s.percentage) }}>
                                            {s.score}/{s.total} · {s.percentage}%
                                        </span>
                                    </div>
                                    <div style={{ height: 12, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
                                        <div style={{ width: `${s.percentage}%`, height: '100%', background: skillColor(s.percentage), borderRadius: 99, transition: 'width 0.5s ease-out' }} />
                                    </div>
                                    <div style={{ marginTop: 4, fontSize: 12, fontWeight: 700, color: skillColor(s.percentage) }}>{s.status}</div>
                                </div>
                            ))}
                        </div>
                    </SCard>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 32 }} className="s-grid-1col">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                        <SCard style={{ padding: 32, borderRadius: 24 }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 20, fontWeight: 800, marginBottom: 24 }}>
                                <FiTarget color="#3b82f6" /> Recommended Skills to Focus
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
                                {result.recommendedSkills.map(s => (
                                    <div key={s} style={{ padding: '10px 20px', background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: 14, fontWeight: 700, color: '#1d4ed8' }}>
                                        {s}
                                    </div>
                                ))}
                            </div>

                            <h3 style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 20, fontWeight: 800, marginBottom: 24 }}>
                                <FiStar color="#f59e0b" /> Suggested Activities
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                                {result.suggestedActivities.map((act, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: '#f8fafc', borderRadius: 16 }}>
                                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>{i + 1}</div>
                                        <div style={{ fontSize: 15, color: 'var(--s-text)', fontWeight: 600 }}>{act}</div>
                                    </div>
                                ))}
                            </div>
                        </SCard>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                        <SCard style={{ padding: 28, borderRadius: 24, background: '#1e293b', color: '#fff' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 800, marginBottom: 20, color: '#fff' }}>
                                <FiZap style={{ color: '#f59e0b' }} /> Quick Guidelines
                            </h3>
                            <p style={{ fontSize: 15, lineHeight: 1.6, color: '#cbd5e1', marginBottom: 0 }}>{result.learningGuidelines}</p>
                        </SCard>

                        <SCard style={{ padding: 28, borderRadius: 24 }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 800, marginBottom: 20 }}>
                                <FiBook style={{ color: '#10b981' }} /> Recommended Exams
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {result.recommendedExams.length > 0 ? result.recommendedExams.map(e => (
                                    <div key={e} style={{ padding: '14px 18px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, fontWeight: 700, color: '#166534' }}>
                                        {e}
                                    </div>
                                )) : <p style={{ color: 'var(--s-text3)' }}>No specific exams recommended at this stage.</p>}
                            </div>
                        </SCard>
                    </div>
                </div>

                <div style={{ marginTop: 56, textAlign: 'center' }}>
                    <SBtn variant="primary" onClick={() => navigate('/student/dashboard')} style={{ padding: '18px 60px', fontSize: 17, borderRadius: 18 }}>
                        Continue to Dashboard <FiArrowRight style={{ marginLeft: 10 }} />
                    </SBtn>
                </div>
            </div>
        </div>
    );
}