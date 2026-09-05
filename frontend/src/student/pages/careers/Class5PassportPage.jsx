import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiAward, FiCalendar, FiMapPin, FiBookOpen, FiArrowLeft, FiVolume2, FiShare2, FiUser, FiActivity } from 'react-icons/fi';
import class5CommunicationService from '../../../services/class5CommunicationService';
import { SLoader, SBtn, SAlert } from '../../components/ui';

export default function Class5PassportPage() {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [alert, setAlert] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchPassportData();
  }, [studentId]);

  const fetchPassportData = async () => {
    try {
      setLoading(true);
      const res = await class5CommunicationService.getPublicPassport(studentId);
      if (res.success) {
        setData(res.data);
      } else {
        triggerAlert("error", "Failed to retrieve passport details.");
      }
    } catch (err) {
      triggerAlert("error", "Unable to communicate with the server.");
    } finally {
      setLoading(false);
    }
  };

  const triggerAlert = (type, text) => {
    setAlert({ type, text });
    setTimeout(() => setAlert({ type: '', text: '' }), 4000);
  };

  const handleSharePassport = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl)
      .then(() => triggerAlert("success", "Passport URL copied to clipboard! Share it with parents and teachers. 📋"))
      .catch(() => triggerAlert("error", "Failed to copy URL."));
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <SLoader fullPage />;
  }

  if (!data || !data.student) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2>Passport Not Found</h2>
        <p style={{ color: '#64748b', marginBottom: 20 }}>The requested student passport could not be found or has been disabled.</p>
        <SBtn onClick={() => navigate(-1)}>Go Back</SBtn>
      </div>
    );
  }

  const { student, progress, badges, recordingsCount, recentActivities } = data;
  const initials = student.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'S';
  const regYear = student.createdAt ? new Date(student.createdAt).getFullYear() : new Date().getFullYear();

  // Recommendations for Parents & Teachers
  const getParentRecommendations = () => {
    const lowSkills = [];
    const skillList = [
      { name: "Speaking Confidence", val: progress.speakingConfidence },
      { name: "Listening", val: progress.listening },
      { name: "Empathy", val: progress.empathy },
      { name: "Observation", val: progress.observation },
      { name: "Confidence", val: progress.confidence },
      { name: "Respect", val: progress.respect },
      { name: "Leadership", val: progress.leadership }
    ];

    skillList.forEach(s => {
      if (s.val < 50) lowSkills.push(s.name);
    });

    if (lowSkills.length === 0) {
      return "This student has displayed excellent communication habits! Encourage them to take up class leadership roles, read storybooks aloud, and participate in debate or drama events.";
    }

    let tips = "Based on the student's current profile, here is how you can support their growth at home/school:\n";
    if (lowSkills.includes("Speaking Confidence")) {
      tips += "• Speaking: Ask them to describe their day in 5 full sentences every evening. Do not interrupt or correct them immediately; let them build momentum.\n";
    }
    if (lowSkills.includes("Listening") || lowSkills.includes("Respect")) {
      tips += "• Listening & Respect: Play 'listening games' like Simon Says. Set a rule at home/class to wait 3 seconds before responding after someone finishes speaking.\n";
    }
    if (lowSkills.includes("Empathy")) {
      tips += "• Empathy: Read stories together and ask questions like, 'How do you think the character felt when that happened? What would you do to help them?'\n";
    }
    if (lowSkills.includes("Observation")) {
      tips += "• Observation: Notice facial expressions of characters in books or movies and discuss what emotion they represent.\n";
    }
    if (lowSkills.includes("Confidence") || lowSkills.includes("Leadership")) {
      tips += "• Confidence & Leadership: Give them small daily responsibilities (like packing their bag, arranging bookshelves, or watering plants) and praise their efforts.\n";
    }

    return tips;
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '40px 24px' }}>
      
      {/* Top action bar */}
      <div style={{ maxWidth: 850, margin: '0 auto 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
            borderRadius: 12, border: 'none', background: '#fff',
            color: '#475569', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
          }}
          className="hover-lift no-print"
        >
          <FiArrowLeft size={16} /> Back
        </button>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handlePrint}
            style={{
              padding: '10px 18px', borderRadius: 12, border: '2px solid #e2e8f0',
              background: '#fff', color: '#475569', fontWeight: 700, cursor: 'pointer'
            }}
            className="hover-lift no-print"
          >
            🖨️ Print Passport
          </button>
          <SBtn variant="primary" onClick={handleSharePassport} style={{ borderRadius: 12 }} className="no-print">
            <FiShare2 style={{ marginRight: 8 }} /> Share Passport
          </SBtn>
        </div>
      </div>

      {/* Main Passport Document Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          maxWidth: 850, margin: '0 auto', background: '#fff',
          borderRadius: 32, border: '12px solid #d97706', // gold passport frame
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)', overflow: 'hidden'
        }}
        className="passport-card"
      >
        {/* Embossed gold heading banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#fbbf24', padding: '32px 40px', borderBottom: '6px solid #fbbf24',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>👑</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Communication Skills Passport
          </h1>
          <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 700, marginTop: 4 }}>
            Uyarvu Payanam learning module • Class 5
          </div>
        </div>

        {/* Passport Content Grid */}
        <div style={{ padding: 40, display: 'grid', gridTemplateColumns: '220px 1fr', gap: 40 }} className="s-grid-1col">
          
          {/* Photo Page (Left Column) */}
          <div style={{ textAlign: 'center', borderRight: '1px dashed #cbd5e1', paddingRight: 40 }} className="no-border-mobile">
            <div style={{
              width: 140, height: 160, borderRadius: 16, background: '#f1f5f9',
              border: '4px solid #e2e8f0', margin: '0 auto 20px', display: 'flex',
              flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              color: '#94a3b8'
            }}>
              <span style={{ fontSize: 44, fontWeight: 800, color: '#3b82f6' }}>{initials}</span>
              <span style={{ fontSize: 11, fontWeight: 700, marginTop: 10, textTransform: 'uppercase' }}>Student Photo</span>
            </div>

            <div style={{ background: '#fef3c7', padding: '10px 16px', borderRadius: 12, border: '1px solid #fcd34d', color: '#b45309', fontWeight: 800, fontSize: 13, display: 'inline-block', marginBottom: 20 }}>
              Communication Level {progress.level || 1}
            </div>

            <div style={{ textAlign: 'left', fontSize: 13, color: '#475569', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <span style={{ display: 'block', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', fontSize: 10 }}>District</span>
                <strong>{student.district || 'Tamil Nadu'}</strong>
              </div>
              <div>
                <span style={{ display: 'block', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', fontSize: 10 }}>Class Grade</span>
                <strong>Class {student.classLevel || '5'}</strong>
              </div>
              <div>
                <span style={{ display: 'block', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', fontSize: 10 }}>Member Since</span>
                <strong>{regYear}</strong>
              </div>
            </div>
          </div>

          {/* Visa & Progress Page (Right Column) */}
          <div>
            
            {/* Student Info Summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #f1f5f9', paddingBottom: 20, marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 900, color: '#1e293b', margin: 0 }}>{student.name}</h2>
                <div style={{ fontSize: 14, color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <FiMapPin /> {student.district || 'Tamil Nadu'}, IN
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#d97706' }}>{progress.xp || 0} XP</div>
                <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 800 }}>Total Experience Points</div>
              </div>
            </div>

            {/* Badges Stamps Grid */}
            <div style={{ marginBottom: 32 }}>
              <h4 style={{ fontSize: 13, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
                🛡️ Passport Visa Stamps (Unlocked Badges)
              </h4>
              {badges.length === 0 ? (
                <div style={{ border: '2px dashed #e2e8f0', borderRadius: 16, padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                  No stamps collected yet. Keep practicing to unlock!
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
                  {badges.map(b => (
                    <div
                      key={b}
                      style={{
                        padding: 12, borderRadius: 16, border: '2px solid #bbf7d0',
                        background: '#f0fdf4', color: '#15803d', textAlign: 'center',
                        fontWeight: 800, fontSize: 12, display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: 6
                      }}
                    >
                      <span style={{ fontSize: 20 }}>💮</span>
                      {b}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Skills Progress Breakdown */}
            <div style={{ marginBottom: 32 }}>
              <h4 style={{ fontSize: 13, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
                📊 Skill Levels
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="s-grid-1col">
                {[
                  { name: "Speaking Confidence", val: progress.speakingConfidence, color: "#10b981" },
                  { name: "Listening", val: progress.listening, color: "#3b82f6" },
                  { name: "Empathy", val: progress.empathy, color: "#ec4899" },
                  { name: "Observation", val: progress.observation, color: "#8b5cf6" },
                  { name: "Confidence", val: progress.confidence, color: "#f59e0b" },
                  { name: "Respect", val: progress.respect, color: "#f43f5e" },
                  { name: "Leadership", val: progress.leadership, color: "#14b8a6" }
                ].map(skill => (
                  <div key={skill.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      <span>{skill.name}</span>
                      <span>{skill.val || 10}%</span>
                    </div>
                    <div style={{ width: '100%', height: 6, borderRadius: 99, background: '#f1f5f9', overflow: 'hidden' }}>
                      <div style={{ width: `${skill.val || 10}%`, height: '100%', background: skill.color, borderRadius: 99 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Parent Teacher Guide Section */}
            <div style={{ background: '#f8fafc', padding: 24, borderRadius: 20, border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                👨‍👩‍👧‍👦 Parent & Teacher Guidance Notes
              </h4>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: '#475569', whiteSpace: 'pre-line', fontWeight: 500 }}>
                {getParentRecommendations()}
              </p>
            </div>

          </div>

        </div>

        {/* Passport Footer Info */}
        <div style={{ background: '#f8fafc', padding: '20px 40px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, fontSize: 12, color: '#64748b', fontWeight: 600 }}>
          <span>Passport ID: UP-CLASS5-{studentId.slice(-6).toUpperCase()}</span>
          <span>Verified by Uyarvu Payanam Interactive Lab</span>
        </div>

      </motion.div>

      {alert.text && (
        <div style={{ position: 'fixed', bottom: 40, right: 40, zIndex: 99999 }} className="no-print">
          <SAlert type={alert.type}>{alert.text}</SAlert>
        </div>
      )}

    </div>
  );
}
