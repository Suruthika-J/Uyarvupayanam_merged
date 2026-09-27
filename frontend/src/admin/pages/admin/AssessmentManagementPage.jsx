import React, { useState, useEffect } from 'react';
import assessmentService from '../../../services/assessmentService';
import onboardingService from '../../../services/onboardingService';
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

// The student onboarding assessment stores grades as "Class N" and skills as skillTag.
const RESULT_GRADES = ['Class 5', 'Class 8', 'Class 10', 'Class 12'];
const RESULT_SKILLS = [
    "Mathematics", "English", "Science", "General Knowledge",
    "Logical Thinking", "Reading Ability", "Creativity",
    "Communication", "Computer Basics", "Learning Habits"
];

const pctColor = (p) => (p >= 80 ? '#10b981' : p >= 60 ? '#f59e0b' : '#ef4444');

export default function AssessmentManagementPage() {
    // ── Question Bank tab ──
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

    // ── Results tab ──
    const [tab, setTab] = useState('bank'); // 'bank' | 'results'
    const [resGrade, setResGrade] = useState('');
    const [resSkill, setResSkill] = useState('');
    const [resSearch, setResSearch] = useState('');
    const [resData, setResData] = useState([]);
    const [resLoading, setResLoading] = useState(false);
    const [resError, setResError] = useState('');
    const [skillOptions, setSkillOptions] = useState(RESULT_SKILLS);

    useEffect(() => {
        if (selectedGrade) {
            fetchQuestions();
        } else {
            setQuestions([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedGrade]);

    useEffect(() => {
        if (tab === 'results') {
            fetchResults();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab, resGrade, resSkill]);

    const fetchQuestions = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await assessmentService.adminGetQuestions(selectedGrade);
            if (res.success) {
                setQuestions(res.questions);
            }
        } catch (err) {
            setError('Failed to fetch questions for grade ' + selectedGrade);
        } finally {
            setLoading(false);
        }
    };

    const fetchResults = async () => {
        setResLoading(true);
        setResError('');
        try {
            const params = {};
            if (resGrade) params.grade = resGrade;
            if (resSkill) params.skill = resSkill;
            if (resSearch.trim()) params.search = resSearch.trim();

            const res = await onboardingService.adminGetResults(params);
            if (res.success) {
                setResData(res.attempts || []);
                if (res.skillOptions?.length) setSkillOptions(res.skillOptions);
            } else {
                setResError(res.message || 'Failed to fetch assessment results');
            }
        } catch (err) {
            setResError('Failed to fetch assessment results');
        } finally {
            setResLoading(false);
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

    const fmtDate = (d) => {
        try { return new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }); }
        catch { return '-'; }
    };

    const tabStyle = (active) => ({
        padding: '12px 22px',
        borderRadius: 14,
        border: active ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
        background: active ? 'var(--primary-l)' : 'var(--surface)',
        color: active ? 'var(--primary)' : 'var(--text2)',
        fontWeight: 800,
        fontSize: 15,
        cursor: 'pointer',
        transition: 'all 0.2s'
    });

    const clearResFilters = () => {
        setResGrade('');
        setResSkill('');
        setResSearch('');
    };

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 0', animation: 'fadeUp 0.4s ease both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 900, fontSize: 32, color: 'var(--text)', margin: '0 0 8px' }}>
                        Assessment Management
                    </h1>
                    <p style={{ color: 'var(--text3)', margin: 0 }}>Manage psychometric test questions and review student assessment results.</p>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
                <button style={tabStyle(tab === 'bank')} onClick={() => setTab('bank')}>🧠 Question Bank</button>
                <button style={tabStyle(tab === 'results')} onClick={() => setTab('results')}>📊 Student Assessment Results</button>
            </div>

            {tab === 'bank' && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
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
                </>
            )}

            {tab === 'results' && (
                <>
                    {resError && <SAlert type="error" onClose={() => setResError('')} style={{ marginBottom: 20 }}>{resError}</SAlert>}

                    {/* Filters — same pattern as Question Management */}
                    <SCard style={{ padding: 24, marginBottom: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: 12, background: 'var(--primary-l)',
                                color: 'var(--primary)', display: 'grid', placeItems: 'center', fontSize: 20
                            }}>
                                <FiFilter />
                            </div>
                            <div style={{ flex: 1, minWidth: 180, maxWidth: 240 }}>
                                <SSelect
                                    label="Filter by Grade / Class"
                                    value={resGrade}
                                    onChange={(e) => setResGrade(e.target.value)}
                                    style={{ marginBottom: 0 }}
                                >
                                    <option value="">All Grades</option>
                                    {RESULT_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                                </SSelect>
                            </div>
                            <div style={{ flex: 1, minWidth: 180, maxWidth: 240 }}>
                                <SSelect
                                    label="Filter by Skill"
                                    value={resSkill}
                                    onChange={(e) => setResSkill(e.target.value)}
                                    style={{ marginBottom: 0 }}
                                >
                                    <option value="">All Skills</option>
                                    {skillOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                </SSelect>
                            </div>
                            <div style={{ flex: 1, minWidth: 200, display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                                <SInput
                                    label="Search student"
                                    value={resSearch}
                                    onChange={(e) => setResSearch(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') fetchResults(); }}
                                    placeholder="Name or email"
                                    style={{ marginBottom: 0 }}
                                />
                                <SBtn variant="primary" onClick={fetchResults} style={{ height: 44 }}>
                                    <FiSearch size={16} />
                                </SBtn>
                            </div>
                            {(resGrade || resSkill || resSearch) && (
                                <SBtn variant="ghost" size="sm" onClick={clearResFilters}>Clear Filters</SBtn>
                            )}
                        </div>
                    </SCard>

                    {resLoading ? (
                        <div style={{ textAlign: 'center', padding: 100 }}>
                            <div className="s-spinner"></div>
                            <p style={{ color: 'var(--text3)', marginTop: 16 }}>Fetching assessment results...</p>
                        </div>
                    ) : resData.length === 0 ? (
                        <div style={{
                            textAlign: 'center', padding: '100px 24px', background: 'var(--surface2)',
                            borderRadius: 24, border: '2px dashed var(--border)'
                        }}>
                            <FiCheckCircle size={48} style={{ color: 'var(--text3)', opacity: 0.3, marginBottom: 16 }} />
                            <h2 style={{ color: 'var(--text2)', fontWeight: 800 }}>No assessment results yet</h2>
                            <p style={{ color: 'var(--text3)' }}>Once students complete their onboarding assessment, scores appear here.</p>
                        </div>
                    ) : (
                        <SCard style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                                        <tr>
                                            <th style={{ padding: '18px 24px', textAlign: 'left', fontSize: 13, textTransform: 'uppercase', color: 'var(--text3)', fontWeight: 800 }}>Student</th>
                                            <th style={{ padding: '18px 24px', textAlign: 'left', fontSize: 13, textTransform: 'uppercase', color: 'var(--text3)', fontWeight: 800 }}>Grade</th>
                                            <th style={{ padding: '18px 24px', textAlign: 'left', fontSize: 13, textTransform: 'uppercase', color: 'var(--text3)', fontWeight: 800 }}>Date Taken</th>
                                            <th style={{ padding: '18px 24px', textAlign: 'left', fontSize: 13, textTransform: 'uppercase', color: 'var(--text3)', fontWeight: 800 }}>Score per Skill</th>
                                            <th style={{ padding: '18px 24px', textAlign: 'center', fontSize: 13, textTransform: 'uppercase', color: 'var(--text3)', fontWeight: 800 }}>Overall</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {resData.map((a, i) => (
                                            <tr key={`${a.studentId}-${a.submittedAt}-${i}`} style={{ borderBottom: '1px solid var(--border)' }} className="table-row-hover">
                                                <td style={{ padding: '20px 24px' }}>
                                                    <div style={{ fontWeight: 800, color: 'var(--text)' }}>{a.studentName || '—'}</div>
                                                    <div style={{ fontSize: 13, color: 'var(--text3)' }}>{a.studentEmail}</div>
                                                </td>
                                                <td style={{ padding: '20px 24px' }}>
                                                    <span style={{
                                                        padding: '4px 12px', background: 'var(--primary-l)',
                                                        color: 'var(--primary)', borderRadius: 20, fontSize: 13, fontWeight: 700
                                                    }}>
                                                        {a.grade}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '20px 24px', fontSize: 14, color: 'var(--text2)', whiteSpace: 'nowrap' }}>
                                                    {fmtDate(a.submittedAt)}
                                                </td>
                                                <td style={{ padding: '20px 24px' }}>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxWidth: 420 }}>
                                                        {a.skills.map(s => (
                                                            <span key={s.skill} style={{
                                                                padding: '6px 12px', borderRadius: 12, fontSize: 12, fontWeight: 700,
                                                                background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text2)'
                                                            }}>
                                                                {s.skill}: <strong style={{ color: pctColor(s.percentage) }}>{s.score}/{s.totalQuestions} ({s.percentage}%)</strong>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                                                    <span style={{
                                                        display: 'inline-block', minWidth: 64, padding: '6px 14px', borderRadius: 99,
                                                        background: pctColor(a.percentage), color: '#fff', fontWeight: 800, fontSize: 14
                                                    }}>
                                                        {a.percentage}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div style={{ padding: '14px 24px', background: 'var(--surface2)', borderTop: '1px solid var(--border)', fontSize: 13, color: 'var(--text3)', fontWeight: 700 }}>
                                {resData.length} assessment attempt{resData.length === 1 ? '' : 's'}
                            </div>
                        </SCard>
                    )}
                </>
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