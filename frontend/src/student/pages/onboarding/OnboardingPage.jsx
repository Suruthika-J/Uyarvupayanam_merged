import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '../../context/StudentAuthContext';
import onboardingService from '../../../services/onboardingService';
import { SBtn, SCard, SLoader, SAlert, SInput, SSelect } from '../../components/ui';
import { FiArrowRight, FiCheckCircle, FiXCircle, FiAward, FiStar, FiSmile, FiUser, FiHome, FiTrendingUp } from 'react-icons/fi';

export default function OnboardingPage() {
    const { student, login } = useStudentAuth();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { questionId: selectedOption }
    const [feedback, setFeedback] = useState({}); // { questionId: { isCorrect, message } }
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);

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

    const isClass10 = ['10th', 'Class 10', '10'].includes(student?.classLevel);
    const isClass12 = ['12th', 'Class 12', '12'].includes(student?.classLevel);
    const isJunior = ['5th', 'Class 5', '5', '8th', 'Class 8', '8'].includes(student?.classLevel);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                let grade = student?.classLevel || 'Class 5';
                if (['5', '5th'].includes(grade)) grade = 'Class 5';
                if (['8', '8th'].includes(grade)) grade = 'Class 8';
                if (['10', '10th'].includes(grade)) grade = 'Class 10';
                if (['12', '12th'].includes(grade)) grade = 'Class 12';
                
                const res = await onboardingService.getQuestions(grade);
                if (res.success) {
                    setQuestions(res.questions);
                }
            } catch (err) {
                console.error("Fetch questions error:", err);
                setError("Failed to load onboarding questions. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (student) {
            if (isJunior) setStep(2); // Skip form for junior classes
            fetchQuestions();
        }
    }, [student, isJunior]);

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

    const handleSelect = (questionId, option) => {
        if (feedback[questionId]) return;

        const currentQuestion = questions[currentIndex];
        const isCorrect = option === currentQuestion.correctAnswer;
        
        setAnswers(prev => ({ ...prev, [questionId]: option }));
        setFeedback(prev => ({ 
            ...prev, 
            [questionId]: { 
                isCorrect, 
                message: isCorrect ? "Correct! Good job. You are strong in this skill." : `Wrong answer. Don’t worry, you need to improve this skill.` 
            } 
        }));
        setShowFeedback(true);
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setShowFeedback(false);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const formattedAnswers = Object.entries(answers).map(([qId, selected]) => ({
                questionId: qId,
                selectedAnswer: selected
            }));

            let grade = student?.classLevel || 'Class 5';
            if (['5', '5th'].includes(grade)) grade = 'Class 5';
            if (['8', '8th'].includes(grade)) grade = 'Class 8';
            if (['10', '10th'].includes(grade)) grade = 'Class 10';
            if (['12', '12th'].includes(grade)) grade = 'Class 12';

            const res = await onboardingService.submitOnboarding({
                userId: student?._id || student?.id,
                grade,
                answers: formattedAnswers,
                ...formData,
                interests: [formData.careerInterest]
            });

            if (res.success) {
                const updatedStudent = { ...student, onboardingCompleted: true };
                const token = localStorage.getItem('studentToken');
                login(token, updatedStudent);
                navigate('/student/onboarding/result');
            }
        } catch (err) {
            setError("Submission failed. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><SLoader /></div>;

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

    // Step 2: Assessment (Existing Logic)
    const currentQuestion = questions[currentIndex];
    const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
    const currentFeedback = feedback[currentQuestion?._id];

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
                            Category: <span style={{ color: 'var(--s-primary)' }}>{currentQuestion?.skillTag}</span>
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--s-primary)' }}>
                            {currentIndex + 1} / {questions.length}
                        </span>
                    </div>
                </div>

                {/* Question Card */}
                <SCard style={{ padding: '40px 32px', borderRadius: 24, boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }} className="s-anim-up">
                    <h2 style={{ fontFamily: 'var(--s-font-display)', fontSize: 22, fontWeight: 800, marginBottom: 32, color: 'var(--s-text)', lineHeight: 1.4 }}>
                        {currentQuestion?.questionText}
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {currentQuestion?.options.map((option, idx) => {
                            const isSelected = answers[currentQuestion._id] === option;
                            const isCorrect = option === currentQuestion.correctAnswer;
                            const hasAnswered = !!currentFeedback;
                            
                            let border = '2px solid var(--s-border)';
                            let bg = 'var(--s-surface)';
                            let color = 'var(--s-text)';

                            if (hasAnswered) {
                                if (isCorrect) {
                                    border = '2px solid #10b981';
                                    bg = '#f0fdf4';
                                    color = '#15803d';
                                } else if (isSelected) {
                                    border = '2px solid #ef4444';
                                    bg = '#fef2f2';
                                    color = '#b91c1c';
                                }
                            } else if (isSelected) {
                                border = '2px solid var(--s-primary)';
                                bg = 'var(--s-primary-l)';
                                color = 'var(--s-primary)';
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleSelect(currentQuestion._id, option)}
                                    disabled={hasAnswered}
                                    style={{
                                        padding: '18px 24px',
                                        borderRadius: 16,
                                        border,
                                        background: bg,
                                        color,
                                        textAlign: 'left',
                                        fontSize: 16,
                                        fontWeight: 700,
                                        cursor: hasAnswered ? 'default' : 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    {option}
                                    {hasAnswered && isCorrect && <FiCheckCircle size={20} />}
                                    {hasAnswered && !isCorrect && isSelected && <FiXCircle size={20} />}
                                </button>
                            );
                        })}
                    </div>

                    {/* Feedback Alert */}
                    {showFeedback && currentFeedback && (
                        <div style={{ marginTop: 24 }} className="s-anim-down">
                            <div style={{ 
                                padding: '16px 20px', 
                                borderRadius: 16, 
                                background: currentFeedback.isCorrect ? '#f0fdf4' : '#fef2f2',
                                border: `1px solid ${currentFeedback.isCorrect ? '#86efac' : '#fecaca'}`,
                                color: currentFeedback.isCorrect ? '#15803d' : '#991b1b',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12
                            }}>
                                {currentFeedback.isCorrect ? <FiStar /> : <FiSmile />}
                                <div>
                                    <p style={{ margin: 0, fontWeight: 800, fontSize: 15 }}>{currentFeedback.message}</p>
                                    {!currentFeedback.isCorrect && (
                                        <p style={{ margin: '4px 0 0', fontSize: 14 }}>Correct answer: <strong>{currentQuestion.correctAnswer}</strong></p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div style={{ marginTop: 40, display: 'flex', justifyContent: 'flex-end' }}>
                        <SBtn 
                            variant="primary" 
                            onClick={handleNext} 
                            disabled={!currentFeedback || submitting}
                            style={{ padding: '14px 40px', borderRadius: 14, fontSize: 16 }}
                        >
                            {submitting ? 'Calculating...' : (currentIndex === questions.length - 1 ? 'Finish Test' : 'Next Question')}
                            {!submitting && <FiArrowRight style={{ marginLeft: 8 }} />}
                        </SBtn>
                    </div>
                </SCard>
            </div>
        </div>
    );
}
