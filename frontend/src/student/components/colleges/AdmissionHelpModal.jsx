import React, { useState, useEffect } from 'react';
import { FiX, FiUser, FiPhone, FiMail, FiBarChart2, FiMapPin, FiBook } from 'react-icons/fi';
import { SBtn, SInput, SSelect } from '../ui';
import axios from '../../../config/axios';

export default function AdmissionHelpModal({ isOpen, onClose, college, student }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    cutoff: '',
    preferredCourse: '',
    preferredLocation: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (student) {
      setFormData(prev => ({
        ...prev,
        name: student.name || '',
        email: student.email || '',
      }));
    }
  }, [student]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('/admission-help', {
        ...formData,
        collegeId: college._id,
        userId: student?._id,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'grid', placeItems: 'center', padding: 20 }}>
        <div style={{ background: '#fff', padding: 40, borderRadius: 32, maxWidth: 450, width: '100%', textAlign: 'center', position: 'relative' }} className="s-anim-scale">
          <div style={{ width: 80, height: 80, borderRadius: 99, background: '#f0fdf4', color: '#16a34a', display: 'grid', placeItems: 'center', fontSize: 40, margin: '0 auto 24px' }}>✅</div>
          <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>Request Submitted!</h2>
          <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: 32 }}>Our counselor will contact you shortly to help you with the admission process at <strong>{college.collegeName}</strong>.</p>
          <SBtn variant="primary" fullWidth onClick={onClose} style={{ borderRadius: 16 }}>Great, Thanks!</SBtn>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'grid', placeItems: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 32, maxWidth: 550, width: '100%', position: 'relative', overflow: 'hidden' }} className="s-anim-up">
        <button onClick={onClose} style={{ position: 'absolute', top: 24, right: 24, background: '#f1f5f9', border: 'none', width: 40, height: 40, borderRadius: 12, cursor: 'pointer', display: 'grid', placeItems: 'center', color: '#64748b' }}><FiX size={20} /></button>
        
        <div style={{ padding: 40 }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Get Admission Help</h2>
          <p style={{ color: '#64748b', marginBottom: 32 }}>Fill in your details and we'll help you secure your seat at {college.collegeName}.</p>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <SInput label="Full Name" icon={<FiUser />} placeholder="Enter your name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <SInput label="Phone Number" icon={<FiPhone />} placeholder="Your mobile number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <SInput label="Email Address (Optional)" icon={<FiMail />} placeholder="Your email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <SInput label="Cutoff / Marks" icon={<FiBarChart2 />} placeholder="e.g. 185.5" type="number" step="0.01" value={formData.cutoff} onChange={e => setFormData({...formData, cutoff: e.target.value})} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 }}>Preferred Course</label>
                <SSelect value={formData.preferredCourse} onChange={e => setFormData({...formData, preferredCourse: e.target.value})} required icon={<FiBook />}>
                   <option value="">Select Course</option>
                   {college.coursesOffered?.map((c, i) => (
                     <option key={i} value={typeof c === 'object' ? c.courseName : c}>
                       {typeof c === 'object' ? c.courseName : c}
                     </option>
                   ))}
                   <option value="Other">Other</option>
                </SSelect>
              </div>
              <SInput label="Preferred Location" icon={<FiMapPin />} placeholder="e.g. Chennai" value={formData.preferredLocation} onChange={e => setFormData({...formData, preferredLocation: e.target.value})} />
            </div>

            {error && <div style={{ color: '#ef4444', fontSize: 14, fontWeight: 600, textAlign: 'center' }}>{error}</div>}

            <SBtn variant="primary" fullWidth size="lg" loading={loading} style={{ marginTop: 12, borderRadius: 16 }}>
              Submit Request
            </SBtn>
          </form>
        </div>
      </div>
    </div>
  );
}
