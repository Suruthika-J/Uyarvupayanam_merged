import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '../../context/StudentAuthContext';
import onboardingService from '../../../services/onboardingService';
import { SBtn, SCard, SLoader } from '../../components/ui';
import { FiTrendingUp, FiTarget, FiZap, FiCheck, FiArrowRight, FiBook, FiAward, FiStar } from 'react-icons/fi';

export default function RecommendationResultPage() {
    const { student } = useStudentAuth();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const res = await onboardingService.getRecommendations(student?._id || student?.id);
                if (res.success) {
                    setResult(res.result);
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

    if (student?.userType === 'college_student') return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><SLoader /></div>;

    if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><SLoader /></div>;

    if (!result) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SCard style={{ textAlign: 'center', padding: 32 }}>
                <h2>No results found</h2>
                <SBtn variant="primary" onClick={() => navigate('/student/onboarding')}>Take Assessment</SBtn>
            </SCard>
        </div>
    );

    return (
        <div className="student-root" style={{ 
            minHeight: '100vh', 
            background: '#f8fafc',
            padding: '60px 20px 100px'
        }}>
            <div style={{ width: '100%', maxWidth: 1000, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <div style={{ 
                        width: 80, height: 80, background: '#eff6ff', 
                        color: '#3b82f6', borderRadius: 24, 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 24px', fontSize: 40
                    }}>
                        <FiAward />
                    </div>
                    <h1 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 36, color: 'var(--s-text)', marginBottom: 12 }}>
                        Assessment Complete!
                    </h1>
                    <p style={{ color: 'var(--s-text3)', fontSize: 18, maxWidth: 600, margin: '0 auto' }}>
                        Great job finishing the assessment. Here is your personalized skill report and learning plan.
                    </p>
                </div>

                {/* Score Summary Card */}
                <SCard style={{ padding: 40, marginBottom: 32, borderRadius: 28, background: 'linear-gradient(to right, #ffffff, #f0f9ff)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 200 }}>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--s-text)', marginBottom: 16 }}>Overall Performance</h2>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                                <span style={{ fontSize: 48, fontWeight: 900, color: '#3b82f6' }}>{result.scorePercentage}%</span>
                                <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--s-text3)' }}>Score</span>
                            </div>
                            <div style={{ 
                                display: 'inline-block', padding: '6px 16px', borderRadius: 99, 
                                background: '#dcfce7', color: '#166534', fontWeight: 800, fontSize: 14 
                            }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 32 }} className="s-grid-1col">
                    {/* Recommendations */}
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

                    {/* Side Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                        <SCard style={{ padding: 28, borderRadius: 24, background: '#1e293b', color: '#fff' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 800, marginBottom: 20, color: '#fff' }}>
                                <FiZap style={{ color: '#f59e0b' }} /> Quick Guidelines
                            </h3>
                            <p style={{ fontSize: 15, lineHeight: 1.6, color: '#cbd5e1', marginBottom: 0 }}>
                                {result.learningGuidelines}
                            </p>
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
                        Go to My Dashboard <FiArrowRight style={{ marginLeft: 10 }} />
                    </SBtn>
                </div>
            </div>
        </div>
    );
}
