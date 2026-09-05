import React from 'react';
import { SCard, SBadge } from '../../components/ui';
import { FiAward, FiBookOpen } from 'react-icons/fi';

export default function Class8Section() {
    return (
        <div id="class-8" style={{ scrollMarginTop: '100px', marginBottom: '60px' }}>
            <div className="s-anim-up" style={{ textAlign: 'center', marginBottom: 30 }}>
                <h2 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 28, color: 'var(--s-text)', marginBottom: 8 }}>Class 8: Foundation & Scholarships</h2>
                <p style={{ fontSize: 15, color: 'var(--s-text3)' }}>Earn while learning with talent exams.</p>
            </div>
            <div className="s-anim-up s-d1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                <SCard hover style={{ borderLeft: '4px solid var(--s-primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <FiAward size={24} color="var(--s-primary)" />
                            <h3 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 18 }}>NMMS Scholarship</h3>
                        </div>
                        <SBadge color="green">Highlight</SBadge>
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--s-text2)', marginBottom: 16 }}>National Means-cum-Merit Scholarship scheme provides financial assistance to meritorious students.</p>
                    <ul style={{ fontSize: 13, color: 'var(--s-text3)', lineHeight: 1.8, paddingLeft: 20 }}>
                        <li><strong style={{ color: 'var(--s-text)' }}>Eligibility:</strong> 8th grade students in government schools.</li>
                        <li><strong style={{ color: 'var(--s-text)' }}>Benefits:</strong> ₹12,000 per annum (₹1,000/month).</li>
                        <li><strong style={{ color: 'var(--s-text)' }}>Support:</strong> Helps fund studies up to Class 12.</li>
                    </ul>
                </SCard>

                <SCard hover style={{ borderLeft: '4px solid var(--s-orange)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <FiBookOpen size={24} color="var(--s-orange)" />
                            <h3 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 18 }}>Other Talent Exams</h3>
                        </div>
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--s-text2)', marginBottom: 16 }}>Expand your horizons early by participating in various Olympiads and regional talent tests.</p>
                    <ul style={{ fontSize: 13, color: 'var(--s-text3)', lineHeight: 1.8, paddingLeft: 20 }}>
                        <li><strong style={{ color: 'var(--s-text)' }}>TRUST Exam:</strong> Tamil Nadu Rural Students Talent Search Exam.</li>
                        <li><strong style={{ color: 'var(--s-text)' }}>Benefits:</strong> Scholarships & recognitions.</li>
                        <li><strong style={{ color: 'var(--s-text)' }}>Support:</strong> Builds competitive exam foundation.</li>
                    </ul>
                </SCard>
            </div>
        </div>
    );
}
