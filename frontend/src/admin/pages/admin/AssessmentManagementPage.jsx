import React, { useState, useEffect } from 'react';
import assessmentService from '../../../services/assessmentService';
import { SBtn, SInput, SSelect, SAlert, SCard } from '../../components/UI';
import { FiPlus, FiEdit2, FiTrash2, FiFilter, FiSearch, FiCheckCircle } from 'react-icons/fi';

const GRADES = ['5', '8', '10', '12'];
const CATEGORIES = [
    "Logical Thinking",
    "Mathematics / Quantitative Ability",
    "Science Understanding",
    "Communication",
    "Creativity",
    "Career Interest",
    "Decision Making",
    "General Awareness"
];

export default function AssessmentManagementPage() {
    const [selectedGrade, setSelectedGrade] = useState('');
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Form State
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        classLevel: '5',
        category: 'Logical Thinking',
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        marks: 1
    });

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
            const res = await assessmentService.adminGetQuestions(selectedGrade);
            if (res.success) {
                setQuestions(res.questions);
            }
        } catch (err) {
            setError('Failed to fetch questions');
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

        // Prepare data for backend (options as objects)
        const submissionData = {
            ...formData,
            options: formData.options.map(opt => ({ text: opt }))
        };

        try {
            if (editingId) {
                const res = await assessmentService.adminUpdateQuestion(editingId, submissionData);
                if (res.success) {
                    setSuccess('Question updated successfully');
                    setEditingId(null);
                    setShowForm(false);
                }
            } else {
                const res = await assessmentService.adminCreateQuestion(submissionData);
                if (res.success) {
                    setSuccess('Question added successfully');
                    setShowForm(false);
                }
            }
            fetchQuestions();
            resetForm();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    const resetForm = () => {
        setFormData({
            classLevel: selectedGrade || '5',
            category: 'Logical Thinking',
            questionText: '',
            options: ['', '', '', ''],
            correctAnswer: '',
            marks: 1
        });
        setEditingId(null);
    };

    const handleEdit = (q) => {
        setEditingId(q._id);
        setFormData({
            classLevel: q.classLevel,
            category: q.category,
            questionText: q.questionText,
            options: q.options.map(o => o.text),
            correctAnswer: q.correctAnswer,
            marks: q.marks || 1
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this question?')) return;
        try {
            const res = await assessmentService.adminDeleteQuestion(id);
            if (res.success) {
                setSuccess('Question deleted');
                fetchQuestions();
            }
        } catch (err) {
            setError('Delete failed');
        }
    };

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 0', animation: 'fadeUp 0.4s ease both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 900, fontSize: 32, color: 'var(--text)', margin: '0 0 8px' }}>
                        Assessment Management
                    </h1>
                    <p style={{ color: 'var(--text3)', margin: 0 }}>Manage psychometric test questions for students.</p>
                </div>
                <SBtn variant="primary" onClick={() => { setShowForm(!showForm); resetForm(); }}>
                    <FiPlus style={{ marginRight: 8 }} /> {showForm ? 'Close Form' : 'Add Question'}
                </SBtn>
            </div>

            {error && <SAlert type="error" onClose={() => setError('')} style={{ marginBottom: 20 }}>{error}</SAlert>}
            {success && <SAlert type="success" onClose={() => setSuccess('')} style={{ marginBottom: 20 }}>{success}</SAlert>}

            {showForm && (
                <SCard style={{ padding: 32, marginBottom: 32, border: '2px solid var(--primary-l)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                        {editingId ? <FiEdit2 /> : <FiPlus />} {editingId ? 'Edit Question' : 'Add New Question'}
                    </h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <SInput label="Question Text" name="questionText" value={formData.questionText} onChange={handleInputChange} required placeholder="Enter the psychometric question..." />
                        </div>
                        
                        <SSelect label="Grade (Class Level)" name="classLevel" value={formData.classLevel} onChange={handleInputChange}>
                            {GRADES.map(g => <option key={g} value={g}>Class {g}</option>)}
                        </SSelect>

                        <SSelect label="Skill / Category" name="category" value={formData.category} onChange={handleInputChange}>
                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </SSelect>

                        <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {formData.options.map((opt, i) => (
                                <SInput 
                                    key={i} 
                                    label={`Option ${i + 1}`} 
                                    value={opt} 
                                    onChange={(e) => handleOptionChange(i, e.target.value)} 
                                    required 
                                    placeholder={`Answer option ${i + 1}`}
                                />
                            ))}
                        </div>

                        <SSelect label="Correct Answer" name="correctAnswer" value={formData.correctAnswer} onChange={handleInputChange} required>
                            <option value="">Select the correct option</option>
                            {formData.options.filter(opt => opt.trim() !== '').map((opt, i) => (
                                <option key={i} value={opt}>{opt}</option>
                            ))}
                        </SSelect>

                        <SInput label="Marks" name="marks" type="number" value={formData.marks} onChange={handleInputChange} required />

                        <div style={{ gridColumn: 'span 2', display: 'flex', gap: 12, marginTop: 10 }}>
                            <SBtn type="submit" variant="primary" style={{ flex: 1 }}>
                                {editingId ? 'Update Question' : 'Save Question'}
                            </SBtn>
                            <SBtn variant="outline" onClick={() => { setShowForm(false); resetForm(); }} style={{ flex: 1 }}>
                                Cancel
                            </SBtn>
                        </div>
                    </form>
                </SCard>
            )}

            <SCard style={{ padding: 24, marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ 
                        width: 44, height: 44, borderRadius: 12, background: 'var(--primary-l)', 
                        color: 'var(--primary)', display: 'grid', placeItems: 'center', fontSize: 20 
                    }}>
                        <FiFilter />
                    </div>
                    <div style={{ flex: 1 }}>
                        <SSelect 
                            label="Filter by Grade" 
                            value={selectedGrade} 
                            onChange={(e) => setSelectedGrade(e.target.value)}
                            style={{ maxWidth: 300, marginBottom: 0 }}
                        >
                            <option value="">-- Select Grade --</option>
                            {GRADES.map(g => <option key={g} value={g}>Class {g}</option>)}
                        </SSelect>
                    </div>
                </div>
            </SCard>

            {!selectedGrade ? (
                <div style={{ 
                    textAlign: 'center', padding: '100px 24px', background: 'var(--surface2)', 
                    borderRadius: 24, border: '2px dashed var(--border)' 
                }}>
                    <FiSearch size={48} style={{ color: 'var(--text3)', opacity: 0.3, marginBottom: 16 }} />
                    <h2 style={{ color: 'var(--text2)', fontWeight: 800 }}>Please select a grade</h2>
                    <p style={{ color: 'var(--text3)' }}>Choose a grade level from the filter above to manage questions.</p>
                </div>
            ) : loading ? (
                <div style={{ textAlign: 'center', padding: 100 }}>
                    <div className="s-spinner"></div>
                    <p style={{ color: 'var(--text3)', marginTop: 16 }}>Fetching questions for Grade {selectedGrade}...</p>
                </div>
            ) : questions.length === 0 ? (
                <div style={{ 
                    textAlign: 'center', padding: '100px 24px', background: 'var(--surface2)', 
                    borderRadius: 24, border: '2px dashed var(--border)' 
                }}>
                    <FiCheckCircle size={48} style={{ color: 'var(--text3)', opacity: 0.3, marginBottom: 16 }} />
                    <h2 style={{ color: 'var(--text2)', fontWeight: 800 }}>No questions available</h2>
                    <p style={{ color: 'var(--text3)' }}>There are no questions added for Grade {selectedGrade} yet.</p>
                    <SBtn variant="primary" style={{ marginTop: 24 }} onClick={() => setShowForm(true)}>
                        Add Your First Question
                    </SBtn>
                </div>
            ) : (
                <SCard style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                                <tr>
                                    <th style={{ padding: '18px 24px', textAlign: 'left', fontSize: 13, textTransform: 'uppercase', color: 'var(--text3)', fontWeight: 800 }}>Grade</th>
                                    <th style={{ padding: '18px 24px', textAlign: 'left', fontSize: 13, textTransform: 'uppercase', color: 'var(--text3)', fontWeight: 800 }}>Skill / Category</th>
                                    <th style={{ padding: '18px 24px', textAlign: 'left', fontSize: 13, textTransform: 'uppercase', color: 'var(--text3)', fontWeight: 800 }}>Question</th>
                                    <th style={{ padding: '18px 24px', textAlign: 'center', fontSize: 13, textTransform: 'uppercase', color: 'var(--text3)', fontWeight: 800 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {questions.map(q => (
                                    <tr key={q._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} className="table-row-hover">
                                        <td style={{ padding: '20px 24px' }}>
                                            <span style={{ 
                                                padding: '4px 12px', background: 'var(--primary-l)', 
                                                color: 'var(--primary)', borderRadius: 20, fontSize: 13, fontWeight: 700 
                                            }}>
                                                Class {q.classLevel}
                                            </span>
                                        </td>
                                        <td style={{ padding: '20px 24px', fontWeight: 600, color: 'var(--text)' }}>
                                            {q.category}
                                        </td>
                                        <td style={{ padding: '20px 24px', color: 'var(--text2)', fontSize: 14, lineHeight: 1.5, maxWidth: 400 }}>
                                            {q.questionText}
                                        </td>
                                        <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                                <button 
                                                    onClick={() => handleEdit(q)} 
                                                    title="Edit"
                                                    style={{ 
                                                        width: 36, height: 36, borderRadius: 10, background: 'var(--surface2)', 
                                                        border: '1px solid var(--border)', color: 'var(--primary)', 
                                                        display: 'grid', placeItems: 'center', cursor: 'pointer' 
                                                    }}
                                                >
                                                    <FiEdit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(q._id)} 
                                                    title="Delete"
                                                    style={{ 
                                                        width: 36, height: 36, borderRadius: 10, background: 'var(--surface2)', 
                                                        border: '1px solid var(--border)', color: '#ef4444', 
                                                        display: 'grid', placeItems: 'center', cursor: 'pointer' 
                                                    }}
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </SCard>
            )}

            <style>{`
                .table-row-hover:hover {
                    background: var(--surface3) !important;
                }
                .s-spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid var(--primary-l);
                    border-top: 4px solid var(--primary);
                    border-radius: 50%;
                    margin: 0 auto;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
