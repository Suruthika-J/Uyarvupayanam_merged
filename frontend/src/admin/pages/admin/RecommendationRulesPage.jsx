import React, { useState, useEffect, useCallback } from 'react';
import onboardingService from '../../../services/onboardingService';
import { SBtn, SInput, SSelect, SAlert, SCard, Modal, SEmpty } from '../../components/UI';
import { FiPlus, FiEdit2, FiTrash2, FiFilter } from 'react-icons/fi';

const RULE_GRADES = ['All', 'Class 5', 'Class 8', 'Class 10', 'Class 12'];
const LEVELS = ['Strong', 'Average', 'Needs Improvement'];
const GUIDELINE_LEVELS = ['Strong', 'Average', 'Needs Improvement', 'Fallback'];
const SKILLS = [
    "Mathematics", "English", "Science", "General Knowledge",
    "Logical Thinking", "Reading Ability", "Creativity",
    "Communication", "Computer Basics", "Learning Habits"
];

const emptyRule = { grade: 'All', skill: SKILLS[0], skillLevel: 'Strong', recommendedActivity: '', recommendedExam: '' };
const emptyGuideline = { overallLevel: 'Strong', guidelineText: '' };

export default function RecommendationRulesPage() {
    const [tab, setTab] = useState('rules'); // 'rules' | 'guidelines'
    const [rules, setRules] = useState([]);
    const [guidelines, setGuidelines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // rules filters + form
    const [filterGrade, setFilterGrade] = useState('');
    const [filterSkill, setFilterSkill] = useState('');
    const [showRuleForm, setShowRuleForm] = useState(false);
    const [ruleForm, setRuleForm] = useState(emptyRule);
    const [editingRuleId, setEditingRuleId] = useState(null);

    // guideline form
    const [showGuidelineForm, setShowGuidelineForm] = useState(false);
    const [guidelineForm, setGuidelineForm] = useState(emptyGuideline);
    const [editingGuidelineId, setEditingGuidelineId] = useState(null);

    const fetchRules = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = {};
            if (filterGrade) params.grade = filterGrade;
            if (filterSkill) params.skill = filterSkill;
            const res = await onboardingService.adminGetRecommendationRules(params);
            if (res.success) setRules(res.rules || []);
        } catch (err) {
            setError('Failed to load recommendation rules');
        } finally {
            setLoading(false);
        }
    }, [filterGrade, filterSkill]);

    const fetchGuidelines = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await onboardingService.adminGetGuidelines();
            if (res.success) setGuidelines(res.guidelines || []);
        } catch (err) {
            setError('Failed to load guideline messages');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { if (tab === 'rules') fetchRules(); else fetchGuidelines(); }, [tab, fetchRules, fetchGuidelines]);

    const resetRuleForm = () => { setRuleForm(emptyRule); setEditingRuleId(null); };

    const handleRuleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingRuleId) {
                await onboardingService.adminUpdateRecommendationRule(editingRuleId, ruleForm);
                setSuccess('Rule updated');
            } else {
                await onboardingService.adminCreateRecommendationRule(ruleForm);
                setSuccess('Rule created');
            }
            setShowRuleForm(false);
            resetRuleForm();
            fetchRules();
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to save rule');
        }
    };

    const editRule = (r) => {
        setRuleForm({ grade: r.grade, skill: r.skill, skillLevel: r.skillLevel, recommendedActivity: r.recommendedActivity, recommendedExam: r.recommendedExam });
        setEditingRuleId(r._id);
        setShowRuleForm(true);
    };

    const deleteRule = async (id) => {
        if (!window.confirm('Delete this recommendation rule?')) return;
        try {
            await onboardingService.adminDeleteRecommendationRule(id);
            setSuccess('Rule deleted');
            setRules(prev => prev.filter(r => r._id !== id));
        } catch (err) {
            setError('Failed to delete rule');
        }
    };

    const resetGuidelineForm = () => { setGuidelineForm(emptyGuideline); setEditingGuidelineId(null); };

    const handleGuidelineSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingGuidelineId) {
                await onboardingService.adminUpdateGuideline(editingGuidelineId, guidelineForm);
                setSuccess('Guideline updated');
            } else {
                await onboardingService.adminCreateGuideline(guidelineForm);
                setSuccess('Guideline created');
            }
            setShowGuidelineForm(false);
            resetGuidelineForm();
            fetchGuidelines();
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to save guideline');
        }
    };

    const editGuideline = (g) => {
        setGuidelineForm({ overallLevel: g.overallLevel, guidelineText: g.guidelineText });
        setEditingGuidelineId(g._id);
        setShowGuidelineForm(true);
    };

    const deleteGuideline = async (id) => {
        if (!window.confirm('Delete this guideline message?')) return;
        try {
            await onboardingService.adminDeleteGuideline(id);
            setSuccess('Guideline deleted');
            setGuidelines(prev => prev.filter(g => g._id !== id));
        } catch (err) {
            setError('Failed to delete guideline');
        }
    };

    const levelBadge = (level) => {
        const map = { 'Strong': '#16a34a', 'Average': '#d97706', 'Needs Improvement': '#dc2626', 'Fallback': '#64748b' };
        return (
            <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: `${map[level]}18`, color: map[level] || '#64748b' }}>
                {level}
            </span>
        );
    };

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 0', animation: 'fadeUp 0.4s ease both' }}>
            <h2 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 900, color: 'var(--text)', marginBottom: 4 }}>
                Recommendation Rules
            </h2>
            <p style={{ color: 'var(--text3)', fontSize: 14, marginTop: 0 }}>
                Rule tables powering the assessment result screen — changes apply immediately, no code deploy needed.
            </p>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 10, margin: '24px 0' }}>
                <SBtn variant={tab === 'rules' ? 'primary' : 'outline'} onClick={() => { setTab('rules'); setError(''); setSuccess(''); }}>
                    🧩 Recommendation Rules
                </SBtn>
                <SBtn variant={tab === 'guidelines' ? 'primary' : 'outline'} onClick={() => { setTab('guidelines'); setError(''); setSuccess(''); }}>
                    💬 Guideline Messages
                </SBtn>
            </div>

            {error && <SAlert type="error" onClose={() => setError('')} style={{ marginBottom: 20 }}>{error}</SAlert>}
            {success && <SAlert type="success" onClose={() => setSuccess('')} style={{ marginBottom: 20 }}>{success}</SAlert>}

            {tab === 'rules' && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div style={{ fontSize: 14, color: 'var(--text3)' }}>
                            {loading ? 'Loading…' : `${rules.length} rule(s)`}
                        </div>
                        <SBtn variant="primary" onClick={() => { resetRuleForm(); setShowRuleForm(true); }}>
                            <FiPlus style={{ marginRight: 8 }} /> Add Rule
                        </SBtn>
                    </div>

                    {/* Filters */}
                    <SCard style={{ padding: 20, marginBottom: 24, display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
                        <FiFilter style={{ color: 'var(--primary)', fontSize: 20, marginBottom: 10 }} />
                        <div style={{ minWidth: 180 }}>
                            <SSelect label="Grade" value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)}>
                                <option value="">All Grades</option>
                                {RULE_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                            </SSelect>
                        </div>
                        <div style={{ minWidth: 200 }}>
                            <SSelect label="Skill" value={filterSkill} onChange={(e) => setFilterSkill(e.target.value)}>
                                <option value="">All Skills</option>
                                {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
                            </SSelect>
                        </div>
                    </SCard>

                    {showRuleForm && (
                        <Modal title={editingRuleId ? 'Edit Recommendation Rule' : 'New Recommendation Rule'} onClose={() => { setShowRuleForm(false); resetRuleForm(); }}>
                            <form onSubmit={handleRuleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                                <SSelect label="Grade" value={ruleForm.grade} onChange={(e) => setRuleForm({ ...ruleForm, grade: e.target.value })}>
                                    {RULE_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                                </SSelect>
                                <SSelect label="Skill" value={ruleForm.skill} onChange={(e) => setRuleForm({ ...ruleForm, skill: e.target.value })}>
                                    {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
                                </SSelect>
                                <SSelect label="Skill Level" value={ruleForm.skillLevel} onChange={(e) => setRuleForm({ ...ruleForm, skillLevel: e.target.value })}>
                                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                </SSelect>
                                <SInput label="Recommended Exam (optional)" value={ruleForm.recommendedExam} onChange={(e) => setRuleForm({ ...ruleForm, recommendedExam: e.target.value })} placeholder="e.g. NTSE" />
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <SInput label="Recommended Activity" value={ruleForm.recommendedActivity} onChange={(e) => setRuleForm({ ...ruleForm, recommendedActivity: e.target.value })} placeholder="e.g. Take part in math olympiads and advanced problem solving." required />
                                </div>
                                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, marginTop: 8 }}>
                                    <SBtn type="submit" variant="primary" style={{ flex: 1 }}>{editingRuleId ? 'Update Rule' : 'Save Rule'}</SBtn>
                                    <SBtn variant="outline" onClick={() => { setShowRuleForm(false); resetRuleForm(); }} style={{ flex: 1 }}>Cancel</SBtn>
                                </div>
                            </form>
                        </Modal>
                    )}

                    {!loading && rules.length === 0 ? (
                        <SEmpty title="No recommendation rules" desc="Add a rule to suggest activities and exams for a skill-level combination." icon="🧩" />
                    ) : (
                        <SCard style={{ padding: 0, overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                                    <tr>
                                        <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 800, color: 'var(--text3)' }}>GRADE</th>
                                        <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 800, color: 'var(--text3)' }}>SKILL</th>
                                        <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 800, color: 'var(--text3)' }}>LEVEL</th>
                                        <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 800, color: 'var(--text3)' }}>RECOMMENDED ACTIVITY</th>
                                        <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 800, color: 'var(--text3)' }}>EXAM</th>
                                        <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: 13, fontWeight: 800, color: 'var(--text3)' }}>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rules.map(r => (
                                        <tr key={r._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '16px 20px', fontWeight: 700 }}>{r.grade}</td>
                                            <td style={{ padding: '16px 20px' }}>{r.skill}</td>
                                            <td style={{ padding: '16px 20px' }}>{levelBadge(r.skillLevel)}</td>
                                            <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--text2)' }}>{r.recommendedActivity || '—'}</td>
                                            <td style={{ padding: '16px 20px', fontSize: 13 }}>{r.recommendedExam || '—'}</td>
                                            <td style={{ padding: '16px 20px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                                <SBtn variant="outline" style={{ padding: '6px 12px', marginRight: 8 }} onClick={() => editRule(r)}><FiEdit2 style={{ marginRight: 6 }} /> Edit</SBtn>
                                                <SBtn variant="outline" style={{ padding: '6px 12px', color: '#dc2626' }} onClick={() => deleteRule(r._id)}><FiTrash2 style={{ marginRight: 6 }} /> Delete</SBtn>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </SCard>
                    )}
                </>
            )}

            {tab === 'guidelines' && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div style={{ fontSize: 14, color: 'var(--text3)' }}>
                            {loading ? 'Loading…' : `${guidelines.length} guideline(s)`}
                        </div>
                        <SBtn variant="primary" onClick={() => { resetGuidelineForm(); setShowGuidelineForm(true); }}>
                            <FiPlus style={{ marginRight: 8 }} /> Add Guideline
                        </SBtn>
                    </div>

                    {showGuidelineForm && (
                        <Modal title={editingGuidelineId ? 'Edit Guideline Message' : 'New Guideline Message'} onClose={() => { setShowGuidelineForm(false); resetGuidelineForm(); }}>
                            <form onSubmit={handleGuidelineSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 18 }}>
                                <SSelect label="Overall Level" value={guidelineForm.overallLevel} onChange={(e) => setGuidelineForm({ ...guidelineForm, overallLevel: e.target.value })}>
                                    {GUIDELINE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                </SSelect>
                                <div>
                                    <textarea
                                        name="guidelineText"
                                        value={guidelineForm.guidelineText}
                                        onChange={(e) => setGuidelineForm({ ...guidelineForm, guidelineText: e.target.value })}
                                        placeholder="Quick guideline message shown on the result screen for this level."
                                        required
                                        rows={4}
                                        style={{ width: '100%', background: 'var(--surface2)', border: '1.5px solid var(--border)', color: 'var(--text)', borderRadius: 12, padding: '11px 16px', fontSize: 14, fontFamily: 'Outfit, sans-serif', resize: 'vertical' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                                    <SBtn type="submit" variant="primary" style={{ flex: 1 }}>{editingGuidelineId ? 'Update Guideline' : 'Save Guideline'}</SBtn>
                                    <SBtn variant="outline" onClick={() => { setShowGuidelineForm(false); resetGuidelineForm(); }} style={{ flex: 1 }}>Cancel</SBtn>
                                </div>
                            </form>
                        </Modal>
                    )}

                    {!loading && guidelines.length === 0 ? (
                        <SEmpty title="No guideline messages" desc="Add at least a Strong, Average, Needs Improvement and Fallback message." icon="💬" />
                    ) : (
                        <SCard style={{ padding: 0, overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                                    <tr>
                                        <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 800, color: 'var(--text3)' }}>LEVEL</th>
                                        <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 800, color: 'var(--text3)' }}>GUIDELINE MESSAGE</th>
                                        <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: 13, fontWeight: 800, color: 'var(--text3)' }}>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {guidelines.map(g => (
                                        <tr key={g._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '16px 20px' }}>{levelBadge(g.overallLevel)}</td>
                                            <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--text2)' }}>{g.guidelineText}</td>
                                            <td style={{ padding: '16px 20px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                                <SBtn variant="outline" style={{ padding: '6px 12px', marginRight: 8 }} onClick={() => editGuideline(g)}><FiEdit2 style={{ marginRight: 6 }} /> Edit</SBtn>
                                                <SBtn variant="outline" style={{ padding: '6px 12px', color: '#dc2626' }} onClick={() => deleteGuideline(g._id)}><FiTrash2 style={{ marginRight: 6 }} /> Delete</SBtn>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </SCard>
                    )}
                </>
            )}
        </div>
    );
}