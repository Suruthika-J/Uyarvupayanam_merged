import React, { useState } from 'react';
import { SCard, SBtn, SBadge } from '../../components/ui';
import { FiActivity, FiMonitor, FiTrendingUp, FiTool, FiBookOpen, FiAlertTriangle, FiInfo } from 'react-icons/fi';

const COURSES_AFTER_10TH = [
    {
        category: "🔬 SCIENCE GROUP COURSES",
        color: "blue",
        courses: [
            {
                title: "1️⃣ Maths + Biology (PCMB)",
                subjects: ["Physics", "Chemistry", "Maths", "Biology"],
                bestFor: "Students who want both Engineering + Medical options",
                warning: "Heavy workload"
            },
            {
                title: "2️⃣ Maths + Computer Science (PCM + CS)",
                subjects: ["Physics", "Chemistry", "Maths", "Computer Science"],
                bestFor: "Engineering, IT / Software, Coding careers"
            },
            {
                title: "3️⃣ Biology + Nursing Track (PCB)",
                subjects: ["Physics", "Chemistry", "Biology"],
                bestFor: "Nursing, Medical field, Paramedical courses",
                note: "“Nursing” is not always a subject in school, but a career path after PCB"
            },
            {
                title: "4️⃣ Maths + Business Maths",
                subjects: ["Maths / Applied Maths", "Commerce-related subjects OR Science mix"],
                bestFor: "Data analysis, Finance + Tech careers"
            }
        ]
    },
    {
        category: "💼 COMMERCE GROUP COURSES",
        color: "green",
        courses: [
            {
                title: "5️⃣ Accountancy + Business Studies + Economics",
                subjects: ["Accountancy", "Business Studies", "Economics", "Maths (optional)"],
                bestFor: "CA / CMA / CS, Business, Banking"
            },
            {
                title: "6️⃣ Commerce + Computer Science",
                subjects: ["Accountancy", "Business Studies", "Computer Science", "Economics"],
                bestFor: "FinTech, Business + IT combination"
            },
            {
                title: "7️⃣ Commerce + Business Maths",
                subjects: ["Accountancy", "Economics", "Business Maths"],
                bestFor: "Finance, Analytics, Banking exams"
            }
        ]
    },
    {
        category: "🎨 ARTS / HUMANITIES COURSES",
        color: "purple",
        courses: [
            {
                title: "8️⃣ History + Political Science + Geography",
                subjects: [],
                bestFor: "Government exams, UPSC / TNPSC, Teaching"
            },
            {
                title: "9️⃣ Psychology + Sociology + English",
                subjects: [],
                bestFor: "Psychology, HR, Social work"
            },
            {
                title: "🔟 Arts + Computer Applications",
                subjects: [],
                bestFor: "Media, Digital careers, Design"
            }
        ]
    },
    {
        category: "🔧 VOCATIONAL / DIPLOMA COURSES",
        color: "orange",
        courses: [
            {
                title: "1️⃣1️⃣ Polytechnic Diploma",
                subjects: ["Mechanical", "Civil", "Computer", "Auto", "etc."],
                bestFor: "Direct technical jobs, lateral entry to 2nd year B.E/B.Tech",
                note: "3-year practical engineering course right after 10th."
            },
            {
                title: "1️⃣2️⃣ ITI / Skill Certification",
                subjects: ["Fitter", "Electrician", "Mechanic"],
                bestFor: "Quick employment, skilled trades, railway jobs",
                note: "1 to 2-year certification for core industrial skills."
            }
        ]
    }
];

export default function Class10Section() {
    const [quizStarted, setQuizStarted] = useState(false);

    return (
        <div id="class-10" style={{ scrollMarginTop: '100px', marginBottom: '60px' }}>
            <div className="s-anim-up" style={{ textAlign: 'center', marginBottom: 40 }}>
                <h2 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 32, color: 'var(--s-text)', marginBottom: 12 }}>Courses Available After 10th</h2>
                <p style={{ fontSize: 16, color: 'var(--s-text3)' }}>Specific 11th & 12th Subject Combinations to choose from</p>
            </div>

            <div className="s-anim-up s-d1" style={{ display: 'flex', flexDirection: 'column', gap: 40, marginBottom: 50 }}>
                {COURSES_AFTER_10TH.map((group, gIdx) => (
                    <div key={gIdx}>
                        <h3 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 22, color: `var(--s-${group.color})`, marginBottom: 20, borderBottom: `2px solid var(--s-${group.color}-l)`, paddingBottom: 10 }}>
                            {group.category}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                            {group.courses.map((course, cIdx) => (
                                <SCard key={cIdx} hover style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16, borderTop: `4px solid var(--s-${group.color})` }}>
                                    <h4 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 18, margin: 0 }}>{course.title}</h4>
                                    
                                    {course.subjects.length > 0 && (
                                        <div>
                                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--s-text3)', textTransform: 'uppercase', letterSpacing: 1 }}>👉 Subjects</span>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                                                {course.subjects.map((sub, i) => <SBadge key={i} color="gray">{sub}</SBadge>)}
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ background: 'var(--s-surface2)', padding: '12px 16px', borderRadius: 12 }}>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--s-primary)', textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <FiActivity /> Best For
                                        </span>
                                        <p style={{ fontSize: 14, fontWeight: 600, margin: '6px 0 0', color: 'var(--s-text)' }}>{course.bestFor}</p>
                                    </div>

                                    {course.warning && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#d97706', fontSize: 13, fontWeight: 600, background: '#fef3c7', padding: '8px 12px', borderRadius: 8 }}>
                                            <FiAlertTriangle /> ⚠️ {course.warning}
                                        </div>
                                    )}

                                    {course.note && (
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: 'var(--s-text2)', fontSize: 13, background: 'var(--s-surface2)', padding: '8px 12px', borderRadius: 8 }}>
                                            <FiInfo style={{ marginTop: 2, flexShrink: 0 }} /> 💡 {course.note}
                                        </div>
                                    )}
                                </SCard>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="s-anim-up s-d2" style={{ background: 'var(--s-surface2)', padding: '30px', borderRadius: 16, border: '1.5px solid var(--s-border)', textAlign: 'center' }}>
                <h3 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 20, marginBottom: 12 }}>Unsure which path to choose?</h3>
                {!quizStarted ? (
                    <>
                        <p style={{ fontSize: 14, color: 'var(--s-text2)', marginBottom: 20 }}>Take our quick Path Finder Quiz to discover streams matching your interests!</p>
                        <SBtn variant="primary" onClick={() => setQuizStarted(true)}>Start Path Finder Quiz</SBtn>
                    </>
                ) : (
                    <div style={{ textAlign: 'left', background: 'var(--s-surface)', padding: 20, borderRadius: 12, border: '1px solid var(--s-border)' }}>
                        <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Q1: What subject do you enjoy studying the most?</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <SBtn variant="outline">A) Mathematics & Physics</SBtn>
                            <SBtn variant="outline">B) Biology & Nature</SBtn>
                            <SBtn variant="outline">C) Economics & Accounts</SBtn>
                            <SBtn variant="outline">D) Hands-on practical work</SBtn>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
