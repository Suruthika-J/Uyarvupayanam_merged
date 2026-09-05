import React, { useState, useEffect } from 'react';
import onboardingService from '../../../services/onboardingService';
import { SBtn, SInput, SSelect, SAlert, SCard } from '../../components/UI';
import { FiPlus, FiEdit2, FiTrash2, FiFilter, FiSearch, FiCheckCircle } from 'react-icons/fi';

const GRADES = ['Class 5', 'Class 8', 'Class 10', 'Class 12'];
const SKILLS = [
    "Mathematics", "English", "Science", "General Knowledge", 
    "Logical Thinking", "Reading Ability", "Creativity", 
    "Communication", "Computer Basics", "Learning Habits"
];

export default function OnboardingManagementPage() {
    const [selectedGrade, setSelectedGrade] = useState('');
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        grade: 'Class 5',
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        skillTag: 'Mathematics',
        difficultyLevel: 'Easy',
        recommendationCategory: '',
        explanation: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (selectedGrade) {
            fetchQuestions();
        } else {
            setQuestions([]);
        }
    }, [selectedGrade]);

    const fetchQuestions = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await onboardingService.adminGetQuestions(selectedGrade);
            if (res.success) {
                setQuestions(res.questions);
            }
        } catch (err) {
            setError('Failed to fetch questions for ' + selectedGrade);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...formData.options];
        newOptions[index] = value;
        setFormData(prev => ({ ...prev, options: newOptions }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            if (editingId) {
                const res = await onboardingService.adminUpdateQuestion(editingId, formData);
                if (res.success) {
                    setSuccess('Question updated successfully');
                    setEditingId(null);
                    setShowForm(false);
                }
            } else {
                const res = await onboardingService.adminCreateQuestion(formData);
                if (res.success) {
                    setSuccess('Question added successfully');
                    setShowForm(false);
                }
            }
            // Refresh list if the grade matches
            if (formData.grade === selectedGrade) {
                fetchQuestions();
            } else if (!selectedGrade) {
                setSelectedGrade(formData.grade);
            }
            resetForm();
        } catch (err) {
            setError('Operation failed');
        }
    };

    const resetForm = () => {
        setFormData({
            grade: selectedGrade || 'Class 5',
            questionText: '',
            options: ['', '', '', ''],
            correctAnswer: '',
            skillTag: 'Mathematics',
            difficultyLevel: 'Easy',
            recommendationCategory: '',
            explanation: ''
        });
        setEditingId(null);
    };

    const handleEdit = (q) => {
        setEditingId(q._id);
        setFormData({
            grade: q.grade,
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer,
            skillTag: q.skillTag,
            difficultyLevel: q.difficultyLevel,
            recommendationCategory: q.recommendationCategory,
            explanation: q.explanation || ''
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this question?')) return;
        try {
            await onboardingService.adminDeleteQuestion(id);
            setSuccess('Question deleted');
            // Optimistic update
            setQuestions(prev => prev.filter(q => q._id !== id));
        } catch (err) {
            setError('Delete failed');
        }
    };

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '20px 0', animation: 'fadeUp 0.4s ease both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 900, color: 'var(--text)' }}>
                    Question Management
                </h2>
                <SBtn variant="primary" onClick={() => { setShowForm(!showForm); if(!showForm) resetForm(); }}>
                    {showForm ? 'Close Form' : <><FiPlus style={{ marginRight: 8 }} /> Add Question</>}
                </SBtn>
            </div>

            {error && <SAlert type="error" onClose={() => setError('')} style={{ marginBottom: 20 }}>{error}</SAlert>}
            {success && <SAlert type="success" onClose={() => setSuccess('')} style={{ marginBottom: 20 }}>{success}</SAlert>}

            {showForm && (
                <SCard style={{ padding: 32, marginBottom: 32, border: '1.5px solid var(--primary-l)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: 20 }}>{editingId ? 'Edit Question' : 'New Question'}</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <SInput label="Question Text" name="questionText" value={formData.questionText} onChange={handleInputChange} required />
                        </div>
                        
                        <SSelect label="Target Grade" name="grade" value={formData.grade} onChange={handleInputChange}>
                            {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                        </SSelect>

                        <SSelect label="Skill Tag" name="skillTag" value={formData.skillTag} onChange={handleInputChange}>
                            {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
                        </SSelect>

                        <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            {formData.options.map((opt, i) => (
                                <SInput key={i} label={`Option ${i + 1}`} value={opt} onChange={(e) => handleOptionChange(i, e.target.value)} required />
                            ))}
                        </div>

                        <SInput label="Correct Answer" name="correctAnswer" value={formData.correctAnswer} onChange={handleInputChange} required />
                        
                        <SSelect label="Difficulty" name="difficultyLevel" value={formData.difficultyLevel} onChange={handleInputChange}>
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </SSelect>

                        <SInput label="Recommendation Category" name="recommendationCategory" value={formData.recommendationCategory} onChange={handleInputChange} required />
                        <SInput label="Explanation (Optional)" name="explanation" value={formData.explanation} onChange={handleInputChange} />

                        <div style={{ gridColumn: 'span 2', display: 'flex', gap: 10, marginTop: 10 }}>
                            <SBtn type="submit" variant="primary" style={{ flex: 1 }}>{editingId ? 'Update' : 'Save'}</SBtn>
                            <SBtn variant="outline" onClick={() => { setShowForm(false); resetForm(); }} style={{ flex: 1 }}>Cancel</SBtn>
                        </div>
                    </form>
                </SCard>
            )}

            {/* GRADE FILTER */}
            <SCard style={{ padding: 20, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                <FiFilter style={{ color: 'var(--primary)', fontSize: 20 }} />
                <div style={{ flex: 1 }}>
                    <SSelect 
                        label="Filter by Grade" 
                        value={selectedGrade} 
                        onChange={(e) => setSelectedGrade(e.target.value)}
                        style={{ marginBottom: 0, maxWidth: 300 }}
                    >
                        <option value="">-- Select Grade --</option>
                        {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                    </SSelect>
                </div>
                {selectedGrade && (
                    <SBtn variant="ghost" size="sm" onClick={() => setSelectedGrade('')}>Clear Filter</SBtn>
                )}
            </SCard>

            {/* TABLE SECTION */}
            {!selectedGrade ? (
                <div style={{ 
                    textAlign: 'center', padding: '80px 20px', background: 'var(--surface2)', 
                    borderRadius: 20, border: '2px dashed var(--border)' 
                }}>
                    <FiSearch size={40} style={{ color: 'var(--text3)', opacity: 0.3, marginBottom: 12 }} />
                    <h3 style={{ color: 'var(--text2)', fontWeight: 800 }}>Please select a grade</h3>
                    <p style={{ color: 'var(--text3)', fontSize: 14 }}>Choose a grade from the dropdown above to view and manage questions.</p>
                </div>
            ) : loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>Loading questions...</div>
            ) : questions.length === 0 ? (
                <div style={{ 
                    textAlign: 'center', padding: '80px 20px', background: 'var(--surface2)', 
                    borderRadius: 20, border: '2px dashed var(--border)' 
                }}>
                    <FiCheckCircle size={40} style={{ color: 'var(--text3)', opacity: 0.3, marginBottom: 12 }} />
                    <h3 style={{ color: 'var(--text2)', fontWeight: 800 }}>No questions available</h3>
                    <p style={{ color: 'var(--text3)', fontSize: 14 }}>There are no questions added for {selectedGrade} yet.</p>
                    <SBtn variant="primary" style={{ marginTop: 20 }} onClick={() => { setShowForm(true); setFormData(f => ({...f, grade: selectedGrade})); }}>
                        Add Your First Question
                    </SBtn>
                </div>
            ) : (
                <SCard style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                            <tr>
                                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 800, color: 'var(--text3)' }}>GRADE</th>
                                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 800, color: 'var(--text3)' }}>SKILL</th>
                                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 800, color: 'var(--text3)' }}>QUESTION</th>
                                <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: 13, fontWeight: 800, color: 'var(--text3)' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {questions.map(q => (
                                <tr key={q._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '16px 20px' }}>
                                        <span style={{ 
                                            background: 'var(--primary-l)', color: 'var(--primary)', 
                                            padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 
                                        }}>
                                            {q.grade}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text)' }}>{q.skillTag}</td>
                                    <td style={{ padding: '16px 20px', fontSize: 14, color: 'var(--text2)', maxWidth: 350, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {q.questionText}
                                    </td>
                                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                            <button onClick={() => handleEdit(q)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 6, borderRadius: 8, transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-l)'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                                                <FiEdit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(q._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 6, borderRadius: 8, transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </SCard>
            )}
        </div>
    );
}

