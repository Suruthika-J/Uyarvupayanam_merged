import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '../../context/StudentAuthContext';
import onboardingService from '../../../services/onboardingService';
import { SBtn, SCard, SLoader, SAlert, SInput, SSelect } from '../../components/ui';
import { FiArrowRight, FiCheckCircle, FiAward, FiUser, FiHome, FiTrendingUp, FiRefreshCw, FiAlertCircle, FiSmile } from 'react-icons/fi';

const COG_LABEL = {
    recall: 'Recall', understanding: 'Understanding', application: 'Application',
    reasoning: 'Reasoning', problem_solving: 'Problem Solving',
    pattern_recognition: 'Pattern Recognition', interpretation: 'Interpretation',
    communication: 'Communication'
};

export default function OnboardingPage() {
    const { student, login } = useStudentAuth();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { questionId: selectedOption }
    const [interestQuestions, setInterestQuestions] = useState([]);
    const [interestAnswers, setInterestAnswers] = useState({}); // { questionId: option }
    const [phase, setPhase] = useState('diagnostic'); // 'diagnostic' | 'interests'
    const [grade, setGrade] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Specific State for Class 10 & 12
    const [step, setStep] = useState(1); // 1: Info Form, 2: Assessment
    const [formData, setFormData] = useState({
        schoolName: '',
        board: 'State Board',
        stream: 'Science Maths', // For Class 12
        marksPercentage: '',
        strongSubjects: '',
        weakSubjects: '',
        preferredStream: 'Maths Biology (PCMB)', // For Class 10
        preferredCourseCategory: 'Engineering', // For Class 12
        careerInterest: 'Software / IT',
        entranceExamPlan: 'TNEA', // For Class 12
        learningStyle: 'Videos',
        goalAfter10th: 'Continue 11th and 12th',
        goalAfter12th: 'Join college'
    });

    const studentId = student?._id || student?.id;
    const sessionKey = `uyarvu_session_${studentId || 'guest'}`;
    const isClass10 = ['10th', 'Class 10', '10'].includes(student?.classLevel);
    const isClass12 = ['12th', 'Class 12', '12'].includes(student?.classLevel);
    const isJunior = ['5th', 'Class 5', '5', '8th', 'Class 8', '8'].includes(student?.classLevel);

    const answeredCount = Object.keys(answers).length;
    const allAnswered = questions.length > 0 && answeredCount === questions.length;
    const unansweredCount = questions.length - answeredCount;
    const allInterestsAnswered = interestQuestions.length > 0 && Object.keys(interestAnswers).length === interestQuestions.length;

    const loadQuestions = async () => {
        setLoading(true);
        setError(null);
        try {
            // One generated set per session: pass the stored sessionId so a
            // page refresh resumes the same blueprint set instead of calling
            // the AI again. First attempt has no sessionId → the server
            // generates from the class blueprint (LLM, falling back to the
            // static Question Management bank).
            const savedSessionId = localStorage.getItem(sessionKey) || undefined;
            const res = await onboardingService.ldGenerateQuestions({
                studentId,
                sessionId: savedSessionId
            });
            if (res.alreadyCompleted) {
                localStorage.removeItem(sessionKey);
                navigate('/student/onboarding/result', { replace: true });
                return;
            }
            if (!res.success || !res.questions?.length) {
                setError(res.message || 'No assessment questions available for your class yet. Please check back later.');
                setQuestions([]);
                return;
            }
            if (res.sessionId) localStorage.setItem(sessionKey, res.sessionId);
            setQuestions(res.questions);
            setInterestQuestions(res.interestQuestions || []);
            setGrade(res.grade || '');
        } catch (err) {
            console.error("Fetch questions error:", err);
            setError("Failed to load assessment questions. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (student) {
            if (isJunior) setStep(2); // Skip form for junior classes
            loadQuestions();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [student]);

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const startAssessment = () => {
        if (isClass10 || isClass12) {
            if (!formData.schoolName || !formData.marksPercentage) {
                setError("Please fill in all required fields.");
                return;
            }
            setError(null);
        }
        setStep(2);
    };

    // Select (or change) an answer — no correct/wrong reveal until submission.
    const handleSelect = (questionId, option) => {
        setAnswers(prev => ({ ...prev, [questionId]: option }));
        setError(null);
    };

    const handleInterestSelect = (questionId, option) => {
        setInterestAnswers(prev => ({ ...prev, [questionId]: option }));
        setError(null);
    };

    const handleBack = () => {
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
    };

    const goToInterests = () => {
        if (!allAnswered) {
            setError(`Please answer all ${questions.length} questions before continuing (${unansweredCount} left).`);
            return;
        }
        setError(null);
        setPhase('interests');
    };

    const handleSubmit = async () => {
        if (!allInterestsAnswered) {
            setError('Please answer all the interest questions so we can personalize your experience.');
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            const formattedAnswers = Object.entries(answers).map(([qId, selected]) => ({
                questionId: qId,
                selectedAnswer: selected
            }));
            const formattedInterests = Object.entries(interestAnswers).map(([questionId, option]) => ({
                questionId,
                option
            }));

            const submitGrade = grade || (
                isClass10 ? 'Class 10'
                : isClass12 ? 'Class 12'
                : isJunior && String(student?.classLevel).includes('8') ? 'Class 8'
                : 'Class 5'
            );

            const res = await onboardingService.ldSubmit({
                studentId,
                grade: submitGrade,
                sessionId: localStorage.getItem(sessionKey) || undefined,
                answers: formattedAnswers,
                interestAnswers: formattedInterests,
                ...formData
            });

            if (res.success) {
                localStorage.removeItem(sessionKey); // session consumed
                const updatedStudent = { ...student, onboardingCompleted: true, recommendationGenerated: true };
                const token = localStorage.getItem('studentToken');
                login(token, updatedStudent);
                navigate('/student/onboarding/result');
            } else {
                setError(res.message || "Submission failed. Please try again.");
                setSubmitting(false);
            }
        } catch (err) {
            console.error("Submit error:", err);
            setError(err?.response?.data?.message || "Submission failed. Please try again.");
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="student-root" style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', padding: '40px 20px'
        }}>
            <div style={{ textAlign: 'center', maxWidth: 420 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                    <SLoader />
                </div>
                <h2 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 22, color: 'var(--s-text)', margin: '0 0 8px' }}>
                    Preparing your AI assessment…
                </h2>
                <p style={{ color: 'var(--s-text3)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                    We're generating personalized skill questions for your class right now.
                </p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
                    {['AI-generated', 'Age-appropriate', 'Skills-based'].map((tag) => (
                        <span key={tag} style={{
                            background: '#eff6ff', color: '#1d4ed8', fontWeight: 700, fontSize: 12,
                            padding: '6px 14px', borderRadius: 99, border: '1px solid #bfdbfe'
                        }}>{tag}</span>
                    ))}
                </div>
            </div>
        </div>
    );

    // Step 1: Info Form (Class 10 & 12 Only)
    if ((isClass10 || isClass12) && step === 1) {
        return (
            <div className="student-root" style={{ minHeight: '100vh', background: '#f8fafc', padding: '60px 20px' }}>
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 40 }}>
                        <h1 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 32, marginBottom: 12 }}>
                            Class {isClass10 ? '10' : '12'} Onboarding
                        </h1>
                        <p style={{ color: 'var(--s-text3)' }}>Tell us more about your academic goals and interests.</p>
                    </div>

                    <SCard style={{ padding: 40, borderRadius: 24 }}>
                        {error && <SAlert type="error" style={{ marginBottom: 24 }}>{error}</SAlert>}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="s-grid-1col">
                            <SInput label="Student Name" value={student?.name} disabled icon={<FiUser />} />
                            <SInput label="School Name" name="schoolName" value={formData.schoolName} onChange={handleFormChange} placeholder="Enter your school name" icon={<FiHome />} />

                            <SSelect label="Board" name="board" value={formData.board} onChange={handleFormChange}>
                                <option value="State Board">State Board</option>
                                <option value="CBSE">CBSE</option>
                                <option value="ICSE">ICSE</option>
                                <option value="Others">Others</option>
                            </SSelect>

                            <SInput label="Latest Marks (%)" name="marksPercentage" type="number" value={formData.marksPercentage} onChange={handleFormChange} placeholder="e.g. 85" icon={<FiTrendingUp />} />

                            {isClass12 && (
                                <SSelect label="Stream" name="stream" value={formData.stream} onChange={handleFormChange}>
                                    <option value="Science Maths">Science Maths</option>
                                    <option value="Science Biology">Science Biology</option>
                                    <option value="Commerce">Commerce</option>
                                    <option value="Arts / Humanities">Arts / Humanities</option>
                                    <option value="Vocational">Vocational</option>
                                </SSelect>
                            )}

                            <SInput label="Strong Subjects" name="strongSubjects" value={formData.strongSubjects} onChange={handleFormChange} placeholder="e.g. Maths, Science" />
                            <SInput label="Weak Subjects" name="weakSubjects" value={formData.weakSubjects} onChange={handleFormChange} placeholder="e.g. English, Social" />

                            {isClass10 && (
                                <SSelect label="Interested Stream after 10th" name="preferredStream" value={formData.preferredStream} onChange={handleFormChange}>
                                    <option value="Maths Biology (PCMB)">Maths Biology (PCMB)</option>
                                    <option value="Maths Computer Science (PCM-CS)">Maths Computer Science (PCM-CS)</option>
                                    <option value="Biology (PCB)">Biology (PCB)</option>
                                    <option value="Commerce with Accountancy">Commerce with Accountancy</option>
                                    <option value="Commerce with Business Maths">Commerce with Business Maths</option>
                                    <option value="Commerce with Computer Science">Commerce with Computer Science</option>
                                    <option value="Arts with Humanities subjects">Arts with Humanities subjects</option>
                                    <option value="Diploma / Polytechnic">Diploma / Polytechnic</option>
                                    <option value="ITI / Vocational">ITI / Vocational</option>
                                    <option value="Not Sure">Not Sure</option>
                                </SSelect>
                            )}

                            {isClass12 && (
                                <SSelect label="Interested Course Category" name="preferredCourseCategory" value={formData.preferredCourseCategory} onChange={handleFormChange}>
                                    <option value="Engineering">Engineering</option>
                                    <option value="Medical">Medical</option>
                                    <option value="Arts">Arts</option>
                                    <option value="Science">Science</option>
                                    <option value="Commerce">Commerce</option>
                                    <option value="Management">Management</option>
                                    <option value="Law">Law</option>
                                    <option value="Agriculture">Agriculture</option>
                                    <option value="Design">Design</option>
                                    <option value="Computer / IT">Computer / IT</option>
                                    <option value="Paramedical">Paramedical</option>
                                    <option value="Teaching">Teaching</option>
                                    <option value="Government Jobs">Government Jobs</option>
                                    <option value="Not Sure">Not Sure</option>
                                </SSelect>
                            )}

                            <SSelect label="Career Interest" name="careerInterest" value={formData.careerInterest} onChange={handleFormChange}>
                                <option value="Software / IT">Software / IT</option>
                                <option value="Doctor / Healthcare">Doctor / Healthcare</option>
                                <option value="Engineer">Engineer</option>
                                <option value="Business / Finance">Business / Finance</option>
                                <option value="Government Sector">Government Sector</option>
                                <option value="Teacher / Professor">Teacher / Professor</option>
                                <option value="Lawyer">Lawyer</option>
                                <option value="Designer">Designer</option>
                                <option value="Agriculture">Agriculture</option>
                                <option value="Research">Research</option>
                                <option value="Entrepreneurship">Entrepreneurship</option>
                                <option value="Not Sure">Not Sure</option>
                            </SSelect>

                            {isClass12 && (
                                <SSelect label="Entrance Exam Plan" name="entranceExamPlan" value={formData.entranceExamPlan} onChange={handleFormChange}>
                                    <option value="TNEA">TNEA</option>
                                    <option value="NEET">NEET</option>
                                    <option value="JEE">JEE</option>
                                    <option value="CUET">CUET</option>
                                    <option value="CLAT">CLAT</option>
                                    <option value="NATA">NATA</option>
                                    <option value="TANCET later">TANCET later</option>
                                    <option value="No plan">No plan</option>
                                    <option value="Not Sure">Not Sure</option>
                                </SSelect>
                            )}

                            <SSelect label="Preferred Learning Style" name="learningStyle" value={formData.learningStyle} onChange={handleFormChange}>
                                <option value="Reading">Reading</option>
                                <option value="Videos">Videos</option>
                                <option value="Practical learning">Practical learning</option>
                                <option value="Quizzes">Quizzes</option>
                                <option value="Mentor guidance">Mentor guidance</option>
                            </SSelect>

                            {isClass10 && (
                                <SSelect label="Goal after 10th" name="goalAfter10th" value={formData.goalAfter10th} onChange={handleFormChange}>
                                    <option value="Continue 11th and 12th">Continue 11th and 12th</option>
                                    <option value="Join Diploma">Join Diploma</option>
                                    <option value="Join ITI">Join ITI</option>
                                    <option value="Prepare for entrance exams">Prepare for entrance exams</option>
                                    <option value="Need career guidance">Need career guidance</option>
                                </SSelect>
                            )}

                            {isClass12 && (
                                <SSelect label="Goal after 12th" name="goalAfter12th" value={formData.goalAfter12th} onChange={handleFormChange}>
                                    <option value="Join college">Join college</option>
                                    <option value="Prepare for entrance exam">Prepare for entrance exam</option>
                                    <option value="Join diploma/lateral entry">Join diploma/lateral entry</option>
                                    <option value="Learn job-ready skills">Learn job-ready skills</option>
                                    <option value="Need career guidance">Need career guidance</option>
                                </SSelect>
                            )}
                        </div>

                        <div style={{ marginTop: 40, textAlign: 'right' }}>
                            <SBtn variant="primary" onClick={startAssessment} style={{ padding: '14px 40px' }}>
                                Next: Skill Assessment <FiArrowRight style={{ marginLeft: 8 }} />
                            </SBtn>
                        </div>
                    </SCard>
                </div>
            </div>
        );
    }

    // Fallback card when the diagnostic set could not be built
    if (!loading && questions.length === 0 && phase === 'diagnostic') {
        return (
            <div className="student-root" style={{
                minHeight: '100vh',
                background: '#f8fafc',
                padding: '60px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <SCard style={{ maxWidth: 520, padding: 40, textAlign: 'center', borderRadius: 24 }}>
                    <FiAlertCircle size={48} style={{ color: '#f59e0b', marginBottom: 16 }} />
                    <h2 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 24, color: 'var(--s-text)', marginBottom: 12 }}>
                        Assessment Not Ready
                    </h2>
                    <p style={{ color: 'var(--s-text3)', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
                        {error || 'No assessment questions available for your class yet.'}
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' }}>
                        <SBtn variant="primary" onClick={loadQuestions}>
                            <FiRefreshCw style={{ marginRight: 8 }} /> Retry
                        </SBtn>
                        <SBtn variant="outline" onClick={() => navigate('/student/dashboard')}>Go to Dashboard</SBtn>
                    </div>
                </SCard>
            </div>
        );
    }

    // ── Interest mini-assessment phase (Part 10) ──
    if (phase === 'interests') {
        const answeredInterestCount = Object.keys(interestAnswers).length;
        return (
            <div className="student-root" style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                padding: '40px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ width: '100%', maxWidth: 700 }}>
                    {error && <SAlert type="error" style={{ marginBottom: 20 }} onClose={() => setError(null)}>{error}</SAlert>}
                    <div style={{ marginBottom: 32, textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                            <FiSmile size={32} color="#8b5cf6" />
                            <h1 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 30, color: 'var(--s-text)', margin: 0 }}>
                                What do you enjoy?
                            </h1>
                        </div>
                        <p style={{ color: 'var(--s-text3)', fontSize: 16 }}>
                            Almost done! Answer 4 quick interest questions — this helps us suggest areas to explore (it never decides your ability).
                        </p>
                    </div>

                    {interestQuestions.map((q, qi) => {
                        const chosen = interestAnswers[q.questionId];
                        return (
                            <SCard key={q.questionId} style={{ padding: '28px 28px', borderRadius: 20, marginBottom: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                                    <div style={{
                                        width: 28, height: 28, borderRadius: '50%', background: '#ede9fe', color: '#6d28d9',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13
                                    }}>{qi + 1}</div>
                                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--s-text)', margin: 0 }}>{q.questionText}</h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {q.options.map((option) => {
                                        const isSelected = chosen === option;
                                        return (
                                            <button
                                                key={option}
                                                onClick={() => handleInterestSelect(q.questionId, option)}
                                                style={{
                                                    padding: '14px 20px', borderRadius: 14, textAlign: 'left', cursor: 'pointer', fontSize: 15,
                                                    border: isSelected ? '2px solid #8b5cf6' : '2px solid var(--s-border)',
                                                    background: isSelected ? '#f5f3ff' : 'var(--s-surface)',
                                                    color: isSelected ? '#6d28d9' : 'var(--s-text)',
                                                    fontWeight: 700, transition: 'all 0.2s', display: 'flex',
                                                    alignItems: 'center', justifyContent: 'space-between'
                                                }}
                                            >
                                                {option}
                                                {isSelected && <FiCheckCircle size={18} />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </SCard>
                        );
                    })}

                    <div style={{ marginTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <SBtn variant="ghost" onClick={() => { setPhase('diagnostic'); setCurrentIndex(questions.length - 1); }}>← Back to Test</SBtn>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {answeredInterestCount < interestQuestions.length && (
                                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--s-text3)' }}>
                                    {interestQuestions.length - answeredInterestCount} remaining
                                </span>
                            )}
                            <SBtn variant="primary" onClick={handleSubmit} disabled={submitting} style={{ padding: '14px 40px', borderRadius: 14, fontSize: 16 }}>
                                {submitting ? 'Analyzing your learning DNA...' : 'Submit & See My Learning DNA'}
                                {!submitting && <FiArrowRight style={{ marginLeft: 8 }} />}
                            </SBtn>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Diagnostic question phase ──
    const currentQuestion = questions[currentIndex];
    const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
    const isLast = currentIndex === questions.length - 1;
    const cogLabel = COG_LABEL[currentQuestion?.cognitiveType] || currentQuestion?.cognitiveType;

    return (
        <div className="student-root" style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            padding: '40px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{ width: '100%', maxWidth: 700 }}>
                {error && questions.length > 0 && (
                    <SAlert type="error" style={{ marginBottom: 20 }} onClose={() => setError(null)}>{error}</SAlert>
                )}

                {/* Header & Progress */}
                <div style={{ marginBottom: 32, textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <FiAward size={32} color="#3b82f6" />
                        <h1 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 32, color: 'var(--s-text)', margin: 0 }}>
                            Assessment Test
                        </h1>
                    </div>
                    <p style={{ color: 'var(--s-text3)', fontSize: 16 }}>
                        Let's check your skill level and give you the best recommendations!
                    </p>

                    <div style={{ marginTop: 24, background: '#e2e8f0', height: 10, borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{
                            width: `${progress}%`,
                            height: '100%',
                            background: 'var(--s-primary)',
                            transition: 'width 0.4s ease-out'
                        }} />
                    </div>
                    <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--s-text3)' }}>
                            Category: <span style={{ color: 'var(--s-primary)' }}>{currentQuestion?.skill}</span>
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--s-primary)' }}>
                            Question {currentIndex + 1} of {questions.length}
                        </span>
                    </div>
                </div>

                {/* Metadata chips: subskill + cognitive type + difficulty */}
                {currentQuestion && (
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 18 }}>
                        <span style={{ background: '#eff6ff', color: '#1d4ed8', fontWeight: 700, fontSize: 12, padding: '6px 14px', borderRadius: 99, border: '1px solid #bfdbfe' }}>
                            {currentQuestion.subskill}
                        </span>
                        <span style={{ background: '#f5f3ff', color: '#6d28d9', fontWeight: 700, fontSize: 12, padding: '6px 14px', borderRadius: 99, border: '1px solid #ddd6fe' }}>
                            {cogLabel}
                        </span>
                        <span style={{ background: '#ecfdf5', color: '#047857', fontWeight: 700, fontSize: 12, padding: '6px 14px', borderRadius: 99, border: '1px solid #a7f3d0' }}>
                            {(currentQuestion.difficulty || 'easy').charAt(0).toUpperCase() + (currentQuestion.difficulty || 'easy').slice(1)}
                        </span>
                    </div>
                )}

                {/* Question Card */}
                <SCard style={{ padding: '40px 32px', borderRadius: 24, boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }} className="s-anim-up">
                    <h2 style={{ fontFamily: 'var(--s-font-display)', fontSize: 22, fontWeight: 800, marginBottom: 32, color: 'var(--s-text)', lineHeight: 1.4 }}>
                        {currentQuestion?.questionText}
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {currentQuestion?.options.map((option, idx) => {
                            const isSelected = answers[currentQuestion._id] === option;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleSelect(currentQuestion._id, option)}
                                    style={{
                                        padding: '18px 24px',
                                        borderRadius: 16,
                                        border: isSelected ? '2px solid var(--s-primary)' : '2px solid var(--s-border)',
                                        background: isSelected ? 'var(--s-primary-l)' : 'var(--s-surface)',
                                        color: isSelected ? 'var(--s-primary)' : 'var(--s-text)',
                                        textAlign: 'left',
                                        fontSize: 16,
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    {option}
                                    {isSelected && <FiCheckCircle size={20} />}
                                </button>
                            );
                        })}
                    </div>

                    <p style={{ marginTop: 24, marginBottom: 0, fontSize: 13, color: 'var(--s-text3)', fontWeight: 600 }}>
                        You can change an answer anytime — results are revealed after you finish.
                    </p>

                    {/* Navigation Buttons */}
                    <div style={{ marginTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <SBtn variant="ghost" onClick={handleBack} disabled={currentIndex === 0}>
                            ← Back
                        </SBtn>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {isLast && unansweredCount > 0 && (
                                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--s-text3)' }}>
                                    {unansweredCount} unanswered
                                </span>
                            )}
                            <SBtn
                                variant="primary"
                                onClick={isLast ? goToInterests : handleNext}
                                disabled={submitting}
                                style={{ padding: '14px 40px', borderRadius: 14, fontSize: 16 }}
                            >
                                {isLast ? 'Next: Interests' : 'Next Question'}
                                <FiArrowRight style={{ marginLeft: 8 }} />
                            </SBtn>
                        </div>
                    </div>
                </SCard>
            </div>
        </div>
    );
}