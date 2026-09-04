import React, { useState, useEffect } from 'react';
import onboardingService from '../../../services/onboardingService';
import { SBtn, SInput, SSelect, SAlert, SCard } from '../../components/UI';
import { FiPlus, FiEdit2, FiTrash2, FiFilter, FiSearch, FiCheckCircle, FiBookOpen, FiUserCheck } from 'react-icons/fi';

const SCHOOL_GRADES = ['Class 5', 'Class 8', 'Class 10', 'Class 12'];
const SCHOOL_SKILLS = [
  "Mathematics", "English", "Science", "General Knowledge",
  "Logical Thinking", "Reading Ability", "Creativity",
  "Communication", "Computer Basics", "Learning Habits"
];

const COLLEGE_FIELDS = [
  "Engineering & Technology",
  "Management & Commerce",
  "Medical & Health Sciences",
  "Arts, Humanities & Social Sciences",
  "Pure & Applied Sciences",
  "Law & Legal Studies",
  "Agriculture & Veterinary"
];

const COLLEGE_DOMAINS = [
  "Computer Science & Engineering",
  "Artificial Intelligence & Data Science",
  "Mechanical Engineering",
  "Electrical & Electronics Engineering",
  "Civil Engineering",
  "Data Science",
  "Medicine",
  "Finance & Accounting",
  "Law"
];

const COLLEGE_DIFFICULTIES = [
  { value: "VERY_EASY", label: "Very Easy (Basic College Foundation)" },
  { value: "EASY", label: "Easy (Conceptual & Application)" },
  { value: "MODERATE", label: "Moderate (Analytical Reasoning)" }
];

export default function OnboardingManagementPage() {
  const [studentType, setStudentType] = useState('school'); // 'school' | 'college'

  // School Questions State
  const [selectedGrade, setSelectedGrade] = useState('');
  const [schoolQuestions, setSchoolQuestions] = useState([]);
  const [loadingSchool, setLoadingSchool] = useState(false);

  // College Questions State
  const [collegeFilter, setCollegeFilter] = useState({ field: '', domain: '', difficulty: '' });
  const [collegeQuestions, setCollegeQuestions] = useState([]);
  const [loadingCollege, setLoadingCollege] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    // School fields
    grade: 'Class 5',
    skillTag: 'Mathematics',
    recommendationCategory: '',
    difficultyLevel: 'Easy',

    // College fields
    field: 'Engineering & Technology',
    degree: 'B.E. / B.Tech Computer Science',
    domain: 'Computer Science & Engineering',
    specialization: '',
    topic: 'Core Fundamentals',
    difficulty: 'VERY_EASY',

    // Shared fields
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch School Questions
  useEffect(() => {
    if (studentType === 'school') {
      if (selectedGrade) {
        fetchSchoolQuestions();
      } else {
        setSchoolQuestions([]);
      }
    }
  }, [studentType, selectedGrade]);

  // Fetch College Questions
  useEffect(() => {
    if (studentType === 'college') {
      fetchCollegeQuestions();
    }
  }, [studentType, collegeFilter]);

  const fetchSchoolQuestions = async () => {
    setLoadingSchool(true);
    setError('');
    try {
      const res = await onboardingService.adminGetQuestions(selectedGrade);
      if (res.success) {
        setSchoolQuestions(res.questions);
      }
    } catch (err) {
      setError('Failed to fetch school questions for ' + selectedGrade);
    } finally {
      setLoadingSchool(false);
    }
  };

  const fetchCollegeQuestions = async () => {
    setLoadingCollege(true);
    setError('');
    try {
      const res = await onboardingService.adminGetCollegeQuestions(collegeFilter);
      if (res.success) {
        setCollegeQuestions(res.questions);
      }
    } catch (err) {
      setError('Failed to fetch college questions');
    } finally {
      setLoadingCollege(false);
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
      if (studentType === 'school') {
        if (editingId) {
          const res = await onboardingService.adminUpdateQuestion(editingId, formData);
          if (res.success) {
            setSuccess('School question updated successfully');
            setShowForm(false);
            fetchSchoolQuestions();
          }
        } else {
          const res = await onboardingService.adminCreateQuestion(formData);
          if (res.success) {
            setSuccess('School question added successfully');
            setShowForm(false);
            if (formData.grade === selectedGrade) fetchSchoolQuestions();
            else setSelectedGrade(formData.grade);
          }
        }
      } else {
        // College Question Submit
        if (editingId) {
          const res = await onboardingService.adminUpdateCollegeQuestion(editingId, formData);
          if (res.success) {
            setSuccess('College question updated successfully');
            setShowForm(false);
            fetchCollegeQuestions();
          }
        } else {
          const res = await onboardingService.adminCreateCollegeQuestion(formData);
          if (res.success) {
            setSuccess('College question added successfully');
            setShowForm(false);
            fetchCollegeQuestions();
          }
        }
      }
      resetForm();
    } catch (err) {
      setError('Operation failed');
    }
  };

  const resetForm = () => {
    setFormData({
      grade: selectedGrade || 'Class 5',
      skillTag: 'Mathematics',
      recommendationCategory: '',
      difficultyLevel: 'Easy',

      field: 'Engineering & Technology',
      degree: 'B.E. / B.Tech Computer Science',
      domain: 'Computer Science & Engineering',
      specialization: '',
      topic: 'Core Fundamentals',
      difficulty: 'VERY_EASY',

      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: ''
    });
    setEditingId(null);
  };

  const handleEditSchool = (q) => {
    setEditingId(q._id);
    setFormData({
      ...formData,
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

  const handleEditCollege = (q) => {
    setEditingId(q._id);
    setFormData({
      ...formData,
      field: q.field,
      degree: q.degree || '',
      domain: q.domain,
      specialization: q.specialization || '',
      topic: q.topic || 'Core Fundamentals',
      difficulty: q.difficulty || 'VERY_EASY',
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || ''
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteSchool = async (id) => {
    if (!window.confirm('Delete this school question?')) return;
    try {
      await onboardingService.adminDeleteQuestion(id);
      setSuccess('School question deleted');
      setSchoolQuestions(prev => prev.filter(q => q._id !== id));
    } catch (err) {
      setError('Delete failed');
    }
  };

  const handleDeleteCollege = async (id) => {
    if (!window.confirm('Delete this college question?')) return;
    try {
      await onboardingService.adminDeleteCollegeQuestion(id);
      setSuccess('College question deleted');
      setCollegeQuestions(prev => prev.filter(q => q._id !== id));
    } catch (err) {
      setError('Delete failed');
    }
  };

  return (
    <div style={{ maxWidth: 1050, margin: '0 auto', padding: '20px 0', animation: 'fadeUp 0.4s ease both' }}>
      
      {/* Header & Student Type Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 900, color: 'var(--text)', margin: 0 }}>
            Onboarding Question Management
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text3)', margin: '4px 0 0' }}>
            Manage diagnostic question pools for School and College onboarding flows.
          </p>
        </div>

        {/* Student Type Tabs */}
        <div style={{ display: 'flex', background: 'var(--surface2)', padding: 4, borderRadius: 14, border: '1px solid var(--border)' }}>
          <button
            type="button"
            onClick={() => { setStudentType('school'); setShowForm(false); resetForm(); }}
            style={{
              padding: '8px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontWeight: 800, fontSize: 13,
              background: studentType === 'school' ? 'var(--primary)' : 'transparent',
              color: studentType === 'school' ? '#fff' : 'var(--text2)'
            }}
          >
            🏫 School Students
          </button>
          <button
            type="button"
            onClick={() => { setStudentType('college'); setShowForm(false); resetForm(); }}
            style={{
              padding: '8px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontWeight: 800, fontSize: 13,
              background: studentType === 'college' ? '#047857' : 'transparent',
              color: studentType === 'college' ? '#fff' : 'var(--text2)'
            }}
          >
            🎓 College Students
          </button>
        </div>

        <SBtn variant="primary" onClick={() => { setShowForm(!showForm); if (!showForm) resetForm(); }}>
          {showForm ? 'Close Form' : <><FiPlus style={{ marginRight: 8 }} /> Add {studentType === 'school' ? 'School' : 'College'} Question</>}
        </SBtn>
      </div>

      {error && <SAlert type="error" onClose={() => setError('')} style={{ marginBottom: 20 }}>{error}</SAlert>}
      {success && <SAlert type="success" onClose={() => setSuccess('')} style={{ marginBottom: 20 }}>{success}</SAlert>}

      {/* FORM SECTION */}
      {showForm && (
        <SCard style={{ padding: 32, marginBottom: 32, border: `1.5px solid ${studentType === 'school' ? 'var(--primary-l)' : '#a7f3d0'}` }}>
          <h3 style={{ marginTop: 0, marginBottom: 20 }}>
            {editingId ? 'Edit' : 'New'} {studentType === 'school' ? 'School' : 'College Domain'} Question
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ gridColumn: 'span 2' }}>
              <SInput label="Question Text *" name="questionText" value={formData.questionText} onChange={handleInputChange} required />
            </div>

            {studentType === 'school' ? (
              <>
                <SSelect label="Target Grade *" name="grade" value={formData.grade} onChange={handleInputChange}>
                  {SCHOOL_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </SSelect>

                <SSelect label="Skill Tag *" name="skillTag" value={formData.skillTag} onChange={handleInputChange}>
                  {SCHOOL_SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
                </SSelect>

                <SSelect label="Difficulty *" name="difficultyLevel" value={formData.difficultyLevel} onChange={handleInputChange}>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </SSelect>

                <SInput label="Recommendation Category *" name="recommendationCategory" value={formData.recommendationCategory} onChange={handleInputChange} required />
              </>
            ) : (
              <>
                <SSelect label="Academic Field *" name="field" value={formData.field} onChange={handleInputChange}>
                  {COLLEGE_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                </SSelect>

                <SSelect label="Domain Branch *" name="domain" value={formData.domain} onChange={handleInputChange}>
                  {COLLEGE_DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                </SSelect>

                <SInput label="Degree Programme (Optional)" name="degree" value={formData.degree} onChange={handleInputChange} placeholder="e.g. B.E. / B.Tech Computer Science" />
                <SInput label="Specialization (Optional)" name="specialization" value={formData.specialization} onChange={handleInputChange} placeholder="e.g. Artificial Intelligence" />

                <SInput label="Topic / Concept Area *" name="topic" value={formData.topic} onChange={handleInputChange} required placeholder="e.g. Data Structures" />

                <SSelect label="Difficulty Stage *" name="difficulty" value={formData.difficulty} onChange={handleInputChange}>
                  {COLLEGE_DIFFICULTIES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </SSelect>
              </>
            )}

            <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {formData.options.map((opt, i) => (
                <SInput key={i} label={`Option ${i + 1} *`} value={opt} onChange={(e) => handleOptionChange(i, e.target.value)} required />
              ))}
            </div>

            <SInput label="Exact Correct Answer *" name="correctAnswer" value={formData.correctAnswer} onChange={handleInputChange} required placeholder="Must match one of the 4 options exactly" />
            <SInput label="Explanation (Optional)" name="explanation" value={formData.explanation} onChange={handleInputChange} placeholder="1-sentence explanation of answer" />

            <div style={{ gridColumn: 'span 2', display: 'flex', gap: 10, marginTop: 10 }}>
              <SBtn type="submit" variant="primary" style={{ flex: 1 }}>{editingId ? 'Update Question' : 'Save Question'}</SBtn>
              <SBtn variant="outline" onClick={() => { setShowForm(false); resetForm(); }} style={{ flex: 1 }}>Cancel</SBtn>
            </div>
          </form>
        </SCard>
      )}

      {/* ── SCHOOL QUESTIONS VIEW ── */}
      {studentType === 'school' && (
        <>
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
                {SCHOOL_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </SSelect>
            </div>
            {selectedGrade && (
              <SBtn variant="ghost" size="sm" onClick={() => setSelectedGrade('')}>Clear Filter</SBtn>
            )}
          </SCard>

          {!selectedGrade ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--surface2)', borderRadius: 20, border: '2px dashed var(--border)' }}>
              <FiSearch size={40} style={{ color: 'var(--text3)', opacity: 0.3, marginBottom: 12 }} />
              <h3 style={{ color: 'var(--text2)', fontWeight: 800 }}>Please select a school grade</h3>
              <p style={{ color: 'var(--text3)', fontSize: 14 }}>Choose a grade from the dropdown above to view and manage school questions.</p>
            </div>
          ) : loadingSchool ? (
            <div style={{ textAlign: 'center', padding: 40 }}>Loading school questions...</div>
          ) : schoolQuestions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--surface2)', borderRadius: 20, border: '2px dashed var(--border)' }}>
              <FiCheckCircle size={40} style={{ color: 'var(--text3)', opacity: 0.3, marginBottom: 12 }} />
              <h3 style={{ color: 'var(--text2)', fontWeight: 800 }}>No school questions available</h3>
              <p style={{ color: 'var(--text3)', fontSize: 14 }}>There are no questions added for {selectedGrade} yet.</p>
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
                  {schoolQuestions.map(q => (
                    <tr key={q._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ background: 'var(--primary-l)', color: 'var(--primary)', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                          {q.grade}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text)' }}>{q.skillTag}</td>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: 'var(--text2)', maxWidth: 350, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {q.questionText}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                          <button onClick={() => handleEditSchool(q)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 6 }}>
                            <FiEdit2 size={16} />
                          </button>
                          <button onClick={() => handleDeleteSchool(q._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 6 }}>
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
        </>
      )}

      {/* ── COLLEGE QUESTIONS VIEW ── */}
      {studentType === 'college' && (
        <>
          <SCard style={{ padding: 20, marginBottom: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <SSelect
              label="Filter by Domain"
              value={collegeFilter.domain}
              onChange={(e) => setCollegeFilter({ ...collegeFilter, domain: e.target.value })}
              style={{ marginBottom: 0 }}
            >
              <option value="">All Domains</option>
              {COLLEGE_DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
            </SSelect>

            <SSelect
              label="Filter by Difficulty Stage"
              value={collegeFilter.difficulty}
              onChange={(e) => setCollegeFilter({ ...collegeFilter, difficulty: e.target.value })}
              style={{ marginBottom: 0 }}
            >
              <option value="">All Difficulty Levels</option>
              <option value="VERY_EASY">Very Easy (Basic Foundation)</option>
              <option value="EASY">Easy (Conceptual Application)</option>
              <option value="MODERATE">Moderate (Analytical)</option>
            </SSelect>
          </SCard>

          {loadingCollege ? (
            <div style={{ textAlign: 'center', padding: 40 }}>Loading college onboarding questions...</div>
          ) : collegeQuestions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--surface2)', borderRadius: 20, border: '2px dashed var(--border)' }}>
              <FiCheckCircle size={40} style={{ color: 'var(--text3)', opacity: 0.3, marginBottom: 12 }} />
              <h3 style={{ color: 'var(--text2)', fontWeight: 800 }}>No college questions found</h3>
              <p style={{ color: 'var(--text3)', fontSize: 14 }}>There are no questions matching the selected filter criteria.</p>
            </div>
          ) : (
            <SCard style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                  <tr>
                    <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 800, color: 'var(--text3)' }}>DOMAIN / TOPIC</th>
                    <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 800, color: 'var(--text3)' }}>DIFFICULTY STAGE</th>
                    <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 800, color: 'var(--text3)' }}>QUESTION TEXT</th>
                    <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: 13, fontWeight: 800, color: 'var(--text3)' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {collegeQuestions.map(q => {
                    const diffBadge = {
                      VERY_EASY: { label: 'Very Easy', bg: '#dbeafe', color: '#1e40af' },
                      EASY: { label: 'Easy', bg: '#fef3c7', color: '#b45309' },
                      MODERATE: { label: 'Moderate', bg: '#f3e8ff', color: '#6d28d9' }
                    }[q.difficulty] || { label: q.difficulty, bg: '#f1f5f9', color: '#475569' }

                    return (
                      <tr key={q._id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{q.domain}</div>
                          <div style={{ fontSize: 12, color: 'var(--text3)' }}>{q.topic}</div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ background: diffBadge.bg, color: diffBadge.color, padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 800 }}>
                            {diffBadge.label}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: 14, color: 'var(--text2)', maxWidth: 380, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {q.questionText}
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                            <button onClick={() => handleEditCollege(q)} style={{ background: 'none', border: 'none', color: '#047857', cursor: 'pointer', padding: 6 }}>
                              <FiEdit2 size={16} />
                            </button>
                            <button onClick={() => handleDeleteCollege(q._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 6 }}>
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </SCard>
          )}
        </>
      )}
    </div>
  );
}
