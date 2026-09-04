import React, { useState } from 'react'
import {
  FiTrendingUp, FiCode, FiAward, FiBookOpen,
  FiExternalLink, FiLayers, FiCheckCircle, FiGithub, FiZap
} from 'react-icons/fi'

const CAPSTONE_PROJECTS = [
  {
    title: 'E-Commerce Platform with Microservices & Stripe',
    domain: 'Full Stack & Cloud',
    difficulty: 'Advanced',
    techStack: 'Node.js / Go, React, Redis, PostgreSQL, Docker, Stripe API',
    description: 'A production-ready store supporting high-concurrency checkouts, asynchronous order processing via Redis message queue, and automated invoice PDF generation.',
    githubTip: 'Include Docker-compose for 1-click startup, API Postman collection, and ER diagrams.',
    impact: 'Demonstrates distributed systems, asynchronous event queues, and real payment integration.'
  },
  {
    title: 'Real-Time Financial Market & Crypto Analytics Pipeline',
    domain: 'Data Engineering & Analytics',
    difficulty: 'Intermediate',
    techStack: 'Python, Apache Kafka / RabbitMQ, Streamlit, Pandas, PostgreSQL',
    description: 'Stream live ticker data through a streaming queue, calculate 15-minute moving averages, RSI indicators, and display interactive alerting dashboards.',
    githubTip: 'Showcase automated data cleaning scripts and SQL analytical window functions in the repository.',
    impact: 'Proves capability to handle continuous time-series data streams.'
  },
  {
    title: 'Automated Multi-Cloud CI/CD & Infrastructure as Code (IaC)',
    domain: 'DevOps & Cloud',
    difficulty: 'Advanced',
    techStack: 'Terraform, AWS (ECS, S3, RDS), GitHub Actions, Docker, Prometheus',
    description: 'Fully declarative Terraform scripts that spin up VPC, load balancer, and containerized app with GitHub Actions zero-downtime rolling deployment pipeline.',
    githubTip: 'Document state management, security group lockdown, and cost monitoring graphs.',
    impact: 'Proves production engineering hygiene and modern DevOps standard compliance.'
  },
  {
    title: 'Predictive Customer Churn Model & REST API',
    domain: 'AI & Data Science',
    difficulty: 'Intermediate',
    techStack: 'Scikit-Learn, XGBoost, FastAPI, Docker, SHAP for explainability',
    description: 'Train an ensemble ML model on telecom user data, evaluate ROC-AUC, package inference inside a FastAPI Docker container, and expose interactive predictions.',
    githubTip: 'Include Jupyter notebook for exploratory data analysis and ROC curve comparisons.',
    impact: 'Bridges theoretical machine learning with production inference APIs.'
  }
]

const CERTIFICATIONS = [
  {
    name: 'AWS Certified Solutions Architect – Associate (SAA-C03)',
    issuer: 'Amazon Web Services',
    difficulty: 'Moderate',
    value: 'Top requested cloud credential across IT & startup enterprises. Proves multi-tier architecture, VPC, and S3/RDS security mastery.',
    prepTime: '6 to 8 Weeks'
  },
  {
    name: 'Google Data Analytics Professional Certificate',
    issuer: 'Google (Coursera)',
    difficulty: 'Beginner to Intermediate',
    value: 'Comprehensive hands-on training across SQL, Tableau, R programming, and data presentation.',
    prepTime: '6 Weeks'
  },
  {
    name: 'HashiCorp Certified: Terraform Associate',
    issuer: 'HashiCorp',
    difficulty: 'Intermediate',
    value: 'Industry standard certification validating Infrastructure-as-Code automation and cloud provisioning skills.',
    prepTime: '4 Weeks'
  },
  {
    name: 'Meta Front-End / Back-End Developer Certificate',
    issuer: 'Meta',
    difficulty: 'Intermediate',
    value: 'Covers modern React, REST API development, unit testing with Jest, and system design patterns.',
    prepTime: '8 Weeks'
  }
]

const FREE_RESOURCES = [
  { name: 'CS50x: Introduction to Computer Science', provider: 'Harvard University (edX)', link: 'https://cs50.harvard.edu/x/', tag: 'Foundations' },
  { name: 'Full Stack Open (Deep Dive into Modern Web)', provider: 'University of Helsinki', link: 'https://fullstackopen.com/en/', tag: 'Web Dev' },
  { name: 'Kaggle Micro-Courses (Python, Pandas, ML)', provider: 'Kaggle', link: 'https://www.kaggle.com/learn', tag: 'Data Science' },
  { name: 'NeetCode Roadmap & DSA Patterns', provider: 'NeetCode.io', link: 'https://neetcode.io/roadmap', tag: 'Coding Interviews' },
  { name: 'System Design Primer', provider: 'Donne Martin (GitHub)', link: 'https://github.com/donnemartin/system-design-primer', tag: 'System Design' }
]

export default function GraduateUpskillingPage() {
  const [activeTab, setActiveTab] = useState('projects') // 'projects', 'certs', 'resources'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #115e59 100%)',
        borderRadius: 16, padding: '28px 32px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20,
        boxShadow: '0 8px 24px rgba(15,23,42,0.12)'
      }}>
        <div style={{ maxWidth: 700 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#5eead4', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <FiTrendingUp size={16} /> Hands-On Upskilling Hub
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '6px 0 8px', color: '#fff' }}>
            Portfolio Projects & Industry Credentials
          </h1>
          <p style={{ margin: 0, color: '#ccfbf1', fontSize: 14, lineHeight: 1.5 }}>
            Recruiters hire proof of work over degree certificates. Build impressive full-scale capstone projects and earn high-yield industry certifications.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setActiveTab('projects')}
            style={{
              padding: '10px 16px', borderRadius: 10, border: 'none',
              background: activeTab === 'projects' ? '#0d9488' : 'rgba(255,255,255,0.1)',
              color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer'
            }}
          >
            🚀 Capstone Projects
          </button>
          <button
            onClick={() => setActiveTab('certs')}
            style={{
              padding: '10px 16px', borderRadius: 10, border: 'none',
              background: activeTab === 'certs' ? '#0d9488' : 'rgba(255,255,255,0.1)',
              color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer'
            }}
          >
            🏆 High-Yield Certifications
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            style={{
              padding: '10px 16px', borderRadius: 10, border: 'none',
              background: activeTab === 'resources' ? '#0d9488' : 'rgba(255,255,255,0.1)',
              color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer'
            }}
          >
            📚 Free Curated Resources
          </button>
        </div>
      </div>

      {activeTab === 'projects' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
          {CAPSTONE_PROJECTS.map((proj, idx) => (
            <div
              key={idx}
              style={{
                background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
                padding: 24, display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20, background: '#f0fdfa', color: '#0d9488' }}>
                    {proj.domain}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: 6 }}>
                    {proj.difficulty}
                  </span>
                </div>

                <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 800, color: '#0f172a' }}>
                  {proj.title}
                </h3>
                <p style={{ margin: '0 0 14px', fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                  {proj.description}
                </p>

                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
                    Tech Stack
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', marginTop: 3 }}>
                    {proj.techStack}
                  </div>
                </div>

                <div style={{ background: '#ecfdf5', padding: 10, borderRadius: 8, fontSize: 12, color: '#065f46', marginBottom: 12 }}>
                  💡 <strong>Recruiter Impact:</strong> {proj.impact}
                </div>
              </div>

              <div style={{ paddingTop: 12, borderTop: '1px solid #f1f5f9', fontSize: 12, color: '#475569' }}>
                ⭐ <strong>GitHub Advice:</strong> {proj.githubTip}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'certs' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
          {CERTIFICATIONS.map((cert, idx) => (
            <div
              key={idx}
              style={{
                background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
                padding: 24, display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#0d9488' }}>
                    Issuer: {cert.issuer}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: 6 }}>
                    {cert.prepTime}
                  </span>
                </div>

                <h3 style={{ margin: '0 0 10px', fontSize: 17, fontWeight: 800, color: '#0f172a' }}>
                  {cert.name}
                </h3>

                <p style={{ margin: '0 0 14px', fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                  {cert.value}
                </p>
              </div>

              <div style={{ paddingTop: 12, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#059669', fontWeight: 700 }}>
                  ✓ Globally Verified on LinkedIn
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'resources' && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
            Gold-Standard Free Engineering & Analytics Learning Resources
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FREE_RESOURCES.map((res, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 18px', borderRadius: 10, background: '#f8fafc',
                  border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: 10
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 14.5, color: '#0f172a' }}>{res.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12, background: '#e0f2fe', color: '#0284c7' }}>
                      {res.tag}
                    </span>
                  </div>
                  <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>Offered by: {res.provider}</div>
                </div>

                <a
                  href={res.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: '#2563eb', color: '#fff', textDecoration: 'none',
                    padding: '8px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 700
                  }}
                >
                  Visit Course <FiExternalLink size={13} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
