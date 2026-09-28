import React from 'react';
import ActivityHeader from './ActivityHeader';

export default function ActivityLayout({ title, subtitle, emoji, backTo, backLabel, onBack, children, maxWidth = 820 }) {
  const handleBack = onBack || (() => {
    window.location.href = backTo;
  });

  return (
    <div className="student-root" style={{ background: '#f8fafc', minHeight: '100vh', padding: '40px 24px 100px' }}>
      <div style={{ maxWidth, margin: '0 auto' }}>
        <ActivityHeader title={title} subtitle={subtitle} emoji={emoji} onBack={handleBack} backLabel={backLabel} />
        {children}
      </div>
    </div>
  );
}
