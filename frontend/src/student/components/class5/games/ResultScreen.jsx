import React from 'react';
import { FiRefreshCcw, FiArrowLeft, FiAward, FiCheckCircle, FiXCircle, FiTarget } from 'react-icons/fi';
import { performanceLabel } from './scoreUtils';

export default function ResultScreen({ result, skills = [], message, onPlayAgain, onBack }) {
  const perf = performanceLabel(result.percentage);
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 32,
        border: '1px solid #f1f5f9',
        padding: '36px 32px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
        maxWidth: 640,
        margin: '0 auto',
        textAlign: 'center',
        animation: 'fadeUp 0.4s ease-out',
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 24,
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          color: '#fff',
          display: 'grid',
          placeItems: 'center',
          margin: '0 auto 18px',
          boxShadow: '0 12px 20px -6px rgba(99,102,241,0.5)',
        }}
      >
        <FiAward size={36} />
      </div>

      <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>
        Activity Complete!
      </h2>
      <p style={{ color: '#64748b', fontSize: 15, margin: '8px 0 24px', lineHeight: 1.5 }}>{message}</p>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 56, fontWeight: 900, color: '#6366f1', letterSpacing: '-0.03em' }}>
          {result.score}
        </span>
        <span style={{ fontSize: 22, fontWeight: 800, color: '#94a3b8' }}>/ {result.maxScore}</span>
      </div>

      <div
        style={{
          width: 140,
          height: 6,
          background: '#eef2f7',
          borderRadius: 99,
          margin: '0 auto 20px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            background: perf.color,
            width: `${result.percentage}%`,
            borderRadius: 99,
            transition: 'width 0.5s ease',
          }}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 10,
          marginBottom: 24,
        }}
      >
        {[
          { label: 'Correct', value: result.correct, icon: FiCheckCircle, color: '#10b981' },
          { label: 'Incorrect', value: result.incorrect, icon: FiXCircle, color: '#ef4444' },
          { label: 'Percentage', value: `${result.percentage}%`, icon: FiTarget, color: '#f59e0b' },
          { label: 'Level', value: perf.label, icon: null, color: perf.color },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              background: '#f8fafc',
              borderRadius: 16,
              padding: '14px 8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {s.icon && <s.icon size={20} color={s.color} />}
            <div style={{ fontSize: 17, fontWeight: 900, color: '#1e293b', lineHeight: 1.1, minHeight: 20 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {skills.length > 0 && (
        <div
          style={{
            background: '#f5f6ff',
            borderRadius: 18,
            padding: 20,
            marginBottom: 24,
            textAlign: 'left',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
            Your Skill Performance
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {skills.map((skill) => {
              const p = performanceLabel(skill.percentage);
              return (
                <div key={skill.name}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#334155' }}>{skill.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: p.color }}>{p.label}</span>
                  </div>
                  <div style={{ height: 10, background: '#e5e7ff', borderRadius: 99, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        background: p.color,
                        width: `${skill.percentage}%`,
                        borderRadius: 99,
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={onPlayAgain}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '13px 24px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: '#fff',
            border: 'none',
            fontWeight: 800,
            fontSize: 15,
            cursor: 'pointer',
            boxShadow: '0 10px 20px -6px rgba(99,102,241,0.5)',
          }}
        >
          <FiRefreshCcw /> Play Again
        </button>
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '13px 24px',
            borderRadius: 14,
            background: '#fff',
            color: '#6366f1',
            border: '2px solid #e0e7ff',
            fontWeight: 800,
            fontSize: 15,
            cursor: 'pointer',
          }}
        >
          <FiArrowLeft /> Back to Games
        </button>
      </div>
    </div>
  );
}
