import React from 'react';
import { FiSettings, FiTool, FiClock, FiActivity } from 'react-icons/fi';

export default function MaintenancePage() {
  return (
    <div className="maintenance-container">
      <div className="maintenance-blob"></div>
      <div className="maintenance-blob-2"></div>
      
      <div className="maintenance-card">
        <div className="illustration-wrapper">
          <img 
            src="/maintenance.png" 
            alt="Maintenance Illustration" 
            className="maintenance-img"
          />
          <div className="gear-overlay">
            <FiSettings className="floating-gear" />
          </div>
        </div>
        
        <div className="content-section">
          <div className="badge-group">
            <span className="maintenance-badge pulse">
              <FiActivity /> Live Updates
            </span>
          </div>

          <h1 className="maintenance-title">
            Platform Under <span className="highlight">Maintenance</span>
          </h1>
          
          <p className="maintenance-desc">
            We're currently performing some scheduled updates to improve your experience. 
            The student portal will be back online shortly.
          </p>

          <div className="tech-info">
            <div className="info-item">
              <div className="info-icon">
                <FiTool />
              </div>
              <div className="info-text">
                <span className="info-label">Status</span>
                <span className="info-value">Technical Update</span>
              </div>
            </div>
            
            <div className="info-divider"></div>

            <div className="info-item">
              <div className="info-icon accent">
                <FiClock />
              </div>
              <div className="info-text">
                <span className="info-label">ETA</span>
                <span className="info-value">Back Soon</span>
              </div>
            </div>
          </div>
        </div>

        <div className="maintenance-footer">
          <p>© {new Date().getFullYear()} Uyarvu Payanam • Empowering Students</p>
        </div>
      </div>

      <style>{`
        .maintenance-container {
          min-height: 100vh;
          background: var(--bg);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        .maintenance-blob {
          position: absolute;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, var(--primary-glow) 0%, transparent 70%);
          top: -250px;
          right: -100px;
          filter: blur(60px);
          z-index: 0;
        }

        .maintenance-blob-2 {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(232, 137, 26, 0.08) 0%, transparent 70%);
          bottom: -300px;
          left: -150px;
          filter: blur(80px);
          z-index: 0;
        }

        .maintenance-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          border-radius: 40px;
          padding: 3.5rem;
          max-width: 900px;
          width: 100%;
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 4rem;
          box-shadow: 
            0 20px 50px rgba(0, 0, 0, 0.05),
            inset 0 0 0 1px rgba(255, 255, 255, 0.5);
          position: relative;
          z-index: 1;
          animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @media (max-width: 850px) {
          .maintenance-card {
            grid-template-columns: 1fr;
            padding: 2.5rem;
            gap: 2rem;
            text-align: center;
          }
        }

        .illustration-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .maintenance-img {
          width: 100%;
          height: auto;
          border-radius: 24px;
          animation: float 6s ease-in-out infinite;
          filter: drop-shadow(0 30px 40px rgba(0,0,0,0.1));
        }

        .gear-overlay {
          position: absolute;
          top: -20px;
          right: -20px;
          width: 80px;
          height: 80px;
          background: var(--surface);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-lg);
          color: var(--primary);
          font-size: 2.5rem;
          animation: spin 12s linear infinite;
        }

        .maintenance-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--primary-l);
          color: var(--primary);
          padding: 0.6rem 1.2rem;
          border-radius: 100px;
          font-weight: 700;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 1.5rem;
        }

        .pulse {
          animation: pulse 2s infinite;
        }

        .maintenance-title {
          font-size: 3rem;
          line-height: 1.1;
          color: var(--text);
          margin-bottom: 1.5rem;
          font-family: 'Nunito', sans-serif;
          font-weight: 900;
        }

        .highlight {
          color: var(--primary);
          position: relative;
        }

        .maintenance-desc {
          font-size: 1.15rem;
          color: var(--text3);
          line-height: 1.6;
          margin-bottom: 3rem;
        }

        .tech-info {
          display: flex;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 1.5rem;
          gap: 1.5rem;
          align-items: center;
        }

        @media (max-width: 850px) {
          .tech-info {
            justify-content: center;
          }
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          text-align: left;
        }

        .info-icon {
          width: 48px;
          height: 48px;
          background: var(--primary-l);
          color: var(--primary);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }

        .info-icon.accent {
          background: var(--accent-l);
          color: var(--accent);
        }

        .info-text {
          display: flex;
          flex-direction: column;
        }

        .info-label {
          font-size: 0.75rem;
          color: var(--text4);
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .info-value {
          font-size: 1rem;
          color: var(--text);
          font-weight: 700;
        }

        .info-divider {
          width: 1px;
          height: 40px;
          background: var(--border);
        }

        .maintenance-footer {
          position: absolute;
          bottom: 2rem;
          left: 3.5rem;
          font-size: 0.85rem;
          color: var(--text4);
          font-weight: 500;
        }

        @media (max-width: 850px) {
          .maintenance-footer {
            position: relative;
            bottom: 0;
            left: 0;
            margin-top: 2rem;
          }
        }

        [data-theme="dark"] .maintenance-card {
          background: rgba(26, 38, 26, 0.7);
          border-color: rgba(255, 255, 255, 0.05);
        }
        
        [data-theme="dark"] .maintenance-blob {
          background: radial-gradient(circle, rgba(139, 195, 74, 0.12) 0%, transparent 70%);
        }
      `}</style>
    </div>
  );
}
