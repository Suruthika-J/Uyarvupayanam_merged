import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiFilter, FiCalendar, FiDollarSign, FiAward, FiExternalLink, FiBookmark } from 'react-icons/fi';
import { scholarshipService } from '../../services';
import { userActionService } from '../../../services/userActionService';
import { useStudentAuth } from '../../context/StudentAuthContext';
import { SLoader, SBadge } from '../../components/ui';
import { fmtName, fmtProvider, fmtAmount, fmtDeadline, fmtEligibilityShort, fmtClasses } from './scholarshipText';

export default function ScholarshipsPage() {

  const navigate = useNavigate();

  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGrade, setSelectedGrade] = useState('All');

  const [savedIds, setSavedIds] = useState(new Set());
  const { isAuthenticated } = useStudentAuth();

  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    setLoading(true);
    try {
      console.log("[Frontend] Calling scholarshipService.getAll()...");
      const res = await scholarshipService.getAll();
      console.log("[Frontend] Response from getAll():", res);
      
      let list = [];
      if (Array.isArray(res)) {
        list = res;
      } else if (res && res.data && Array.isArray(res.data)) {
        list = res.data;
      } else if (res && res.scholarships && Array.isArray(res.scholarships)) {
        list = res.scholarships;
      } else {
        console.warn("[Frontend] Unexpected response format:", res);
      }
      
      console.log("[Frontend] Final parsed scholarship list:", list);
      setScholarships(list);
      setError(null);
    } catch (err) {
      console.error("❌ [Frontend] Error fetching scholarships:", err);
      setError("Failed to load scholarships. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSaved = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await userActionService.getSavedList('Scholarship');
      setSavedIds(new Set(res.data?.map(item => item.contentId?._id || item.contentId)));
    } catch (err) {
      console.error("Error fetching saved scholarships:", err);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, [isAuthenticated]);

  const handleToggleSave = async (id) => {
    if (!isAuthenticated) return;
    try {
      if (savedIds.has(id)) {
        await userActionService.unsaveItem(id);
        setSavedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
      } else {
        await userActionService.saveItem(id, 'Scholarship');
        setSavedIds(prev => new Set([...prev, id]));
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  // Filter Logic

  const categories = ['All', ...new Set(scholarships.map(s => s.category || 'General'))];

  const grades = ['All', '5', '8', '10', '12', 'Graduate'];
  
  const filteredScholarships = scholarships.filter(s => {
    const scholarshipName = s.name || s.scholarshipName || '';
    const matchesSearch = scholarshipName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.provider?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || (s.category || 'General') === selectedCategory;
    const gradesList = Array.isArray(s.grades) ? s.grades : (Array.isArray(s.targetClass) ? s.targetClass : []);
    const matchesGrade = selectedGrade === 'All' || gradesList.includes(selectedGrade);
    return matchesSearch && matchesCategory && matchesGrade;
  });

  return (
    <div className="s-section" style={{ background: 'var(--s-bg)', minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        
        {/* Header Section */}
        <div className="s-section-header" style={{ textAlign: 'left', marginBottom: 40 }}>
           <div className="s-section-tag"><FiAward size={14} /> Financial Aid</div>
           <h1 className="s-section-title" style={{ fontSize: 36, marginTop: 8 }}>Available Scholarships</h1>
           <p className="s-section-desc" style={{ margin: 0, maxWidth: 600 }}>
             Discover and apply for scholarships to support your educational journey.
           </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <FiSearch style={{ position: 'absolute', left: 16, top: 14, color: 'var(--s-text3)' }} />
            <input 
              type="text" 
              placeholder="Search by name or provider..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: 12, border: '1px solid var(--s-border)', fontSize: 15 }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', padding: '4px 16px', borderRadius: 12, border: '1px solid var(--s-border)' }}>
            <FiFilter color="var(--s-text3)" />
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 15, fontWeight: 500, color: 'var(--s-text)' }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', padding: '4px 16px', borderRadius: 12, border: '1px solid var(--s-border)' }}>
            <FiFilter color="var(--s-text3)" />
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 15, fontWeight: 500, color: 'var(--s-text)' }}
            >
              {grades.map(g => (
                <option key={g} value={g}>{g === 'All' ? 'All Classes' : `Class ${g}`}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Blocks */}
        {loading && <SLoader />}
        
        {!loading && error && (
          <div style={{ padding: 24, background: '#fee2e2', color: '#b91c1c', borderRadius: 12, textAlign: 'center' }}>
            {error}
          </div>
        )}
        
        {!loading && !error && filteredScholarships.length === 0 && (
          <div style={{ padding: '60px 20px', textAlign: 'center', background: '#fff', borderRadius: 16, border: '1px solid var(--s-border)' }}>
            <h3 style={{ color: 'var(--s-text2)' }}>No scholarships found</h3>
            <p style={{ color: 'var(--s-text3)' }}>Try adjusting your search criteria.</p>
          </div>
        )}

        {/* Data Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
          {!loading && !error && filteredScholarships.map(scholarship => (
            <div key={scholarship._id} style={{ 
              background: '#fff', 
              border: '1px solid var(--s-border)', 
              borderRadius: 16, 
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
              position: 'relative'
            }}>
              <button 
                onClick={() => handleToggleSave(scholarship._id)}
                style={{ 
                  position: 'absolute', top: 20, right: 20, background: savedIds.has(scholarship._id) ? 'var(--s-primary)' : 'var(--s-bg)', 
                  border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', 
                  justifyContent: 'center', cursor: 'pointer', color: savedIds.has(scholarship._id) ? '#fff' : 'var(--s-text3)', zIndex: 5 
                }}
              >
                <FiBookmark fill={savedIds.has(scholarship._id) ? 'currentColor' : 'none'} />
              </button>

              <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                   <SBadge color="blue" style={{ fontSize: 11 }}>{scholarship.category || 'General'}</SBadge>
                 </div>
                 <h3 style={{ margin: 0, fontSize: 18, color: 'var(--s-text)', lineHeight: 1.4 }}>{fmtName(scholarship)}</h3>
                 <p style={{ margin: '4px 0 0 0', color: 'var(--s-text3)', fontSize: 14 }}>{fmtProvider(scholarship)}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--s-text2)' }}>
                   <FiDollarSign style={{ color: 'var(--s-primary)' }} /> 
                   <span style={{ fontWeight: 600 }}>{fmtAmount(scholarship)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--s-text2)' }}>
                   <FiCalendar style={{ color: '#b45309' }} /> 
                   <span>Apply by: <strong>{fmtDeadline(scholarship)}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--s-text2)' }}>
                   <FiAward style={{ color: 'var(--s-primary)' }} />
                   <span>For: <strong>{fmtClasses(scholarship)}</strong></span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--s-text3)', background: 'var(--s-bg2)', padding: '10px 12px', borderRadius: 8, marginTop: 'auto' }}>
                  <strong>Who can apply:</strong> {fmtEligibilityShort(scholarship)}
                </div>
              </div>

              <a 
                href={scholarship.link || scholarship.applicationLink || '#'} 
                target="_blank" 
                rel="noreferrer"
                className="s-btn s-btn-outline" 
                style={{ width: '100%', border: '1px solid var(--s-primary)', color: 'var(--s-primary)' }}
              >
                Apply Now <FiExternalLink />
              </a>

              <div style={{ display: 'flex', gap: 10 }}>
                <button 
                  onClick={() => navigate(`/student/scholarships/${scholarship._id}`)}
                  className="s-btn s-btn-primary" 
                  style={{ flex: 1, padding: '10px 0', fontSize: 14 }}
                >
                  View Details
                </button>
                { (scholarship.link || scholarship.applicationLink) && (
                  <a 
                    href={scholarship.link || scholarship.applicationLink} 
                    target="_blank" 
                    rel="noreferrer"
                    className="s-btn s-btn-outline" 
                    style={{ flex: 1, border: '1px solid var(--s-primary)', color: 'var(--s-primary)', padding: '10px 0', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    Apply <FiExternalLink size={12} />
                  </a>
                )}
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
