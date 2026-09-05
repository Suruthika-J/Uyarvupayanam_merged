import React from 'react';
import { SCard } from '../../components/ui';
import { FiSmile, FiPenTool, FiActivity } from 'react-icons/fi';

const INITIATIVES = [
    { title: "Drawing & Colors", desc: "Express your creativity and imagination.", icon: FiPenTool, color: "orange" },
    { title: "Fun Puzzles", desc: "Train your brain with amazing shapes and logic.", icon: FiActivity, color: "blue" },
    { title: "Funny Logic", desc: "Learn problem-solving through play.", icon: FiSmile, color: "green" }
];

export default function Class5Section() {
    return (
        <div id="class-5" style={{ scrollMarginTop: '100px', marginBottom: '60px' }}>
            <div className="s-anim-up" style={{ textAlign: 'center', marginBottom: 30 }}>
                <h2 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 28, color: 'var(--s-text)', marginBottom: 8 }}>Class 5: Early Discovery</h2>
                <p style={{ fontSize: 15, color: 'var(--s-text3)' }}>Learning through play and creativity!</p>
            </div>
            <div className="s-anim-up s-d1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                {INITIATIVES.map((item, idx) => (
                    <SCard key={idx} hover style={{ borderTop: `4px solid var(--s-${item.color})`, textAlign: 'center', padding: '30px 20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, color: `var(--s-${item.color})` }}>
                            <item.icon size={36} />
                        </div>
                        <h3 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 18, color: 'var(--s-text)', marginBottom: 12 }}>{item.title}</h3>
                        <p style={{ fontSize: 14, color: 'var(--s-text2)', lineHeight: 1.6 }}>{item.desc}</p>
                    </SCard>
                ))}
            </div>
        </div>
    );
}
