/**
 * graduateCourseImageResolver.js
 * 
 * Central Course Image Resolver for the Graduate Portal.
 * Maps any course, learning resource, certification, capstone project, or roadmap milestone
 * to a visually relevant, high-resolution topic image, SVG fallback, alt text, and accent styling.
 * 
 * Hierarchy:
 * 1. Existing explicit course image/thumbnail URL (if valid)
 * 2. Topic/Skill specific curated image visual
 * 3. Domain / Specialization category image visual
 * 4. Academic Field category visual
 * 5. Safe generic professional educational visual fallback
 */

// ── TOPIC VISUAL DATABASE (Curated High-Definition Educational Images & SVG Banners) ──
const COURSE_TOPIC_REGISTRY = [
  {
    key: 'embedded-iot',
    title: 'Embedded Systems & IoT Hardware',
    keywords: ['embedded', 'iot', 'microcontroller', 'arduino', 'raspberry pi', 'vlsi', 'electronics', 'circuit', 'fpga', 'hardware', 'sensor', 'pcb', 'firmware', 'c/c++'],
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    altText: 'Embedded Systems and IoT Hardware Engineering course visual showing microcontrollers and circuit design',
    accentColor: '#0284c7',
    icon: '⚡',
    svgFallback: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
      <defs>
        <linearGradient id="embGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#0369a1"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#embGrad)"/>
      <path d="M150 225 h500 M400 100 v250" stroke="#38bdf8" stroke-width="3" stroke-dasharray="10 5" opacity="0.4"/>
      <rect x="300" y="150" width="200" height="150" rx="12" fill="#1e293b" stroke="#38bdf8" stroke-width="4"/>
      <text x="400" y="235" text-anchor="middle" fill="#38bdf8" font-family="system-ui, sans-serif" font-weight="900" font-size="22">MCU / IoT CORE</text>
      <circle cx="340" cy="180" r="8" fill="#10b981"/>
      <circle cx="370" cy="180" r="8" fill="#f59e0b"/>
      <circle cx="400" cy="180" r="8" fill="#ef4444"/>
    </svg>`
  },
  {
    key: 'machine-learning-ai',
    title: 'Machine Learning & Artificial Intelligence',
    keywords: ['machine learning', 'deep learning', 'ai', 'python', 'neural network', 'nlp', 'computer vision', 'tensorflow', 'pytorch', 'scikit-learn', 'data science', 'predictive'],
    imageUrl: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=800&q=80',
    altText: 'Machine Learning and Artificial Intelligence course visual showing data algorithms and neural code',
    accentColor: '#7c3aed',
    icon: '🤖',
    svgFallback: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
      <defs>
        <linearGradient id="mlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e1b4b"/>
          <stop offset="100%" stop-color="#6d28d9"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#mlGrad)"/>
      <circle cx="250" cy="225" r="40" fill="#a78bfa" opacity="0.8"/>
      <circle cx="400" cy="140" r="40" fill="#a78bfa" opacity="0.8"/>
      <circle cx="400" cy="310" r="40" fill="#a78bfa" opacity="0.8"/>
      <circle cx="550" cy="225" r="40" fill="#c4b5fd"/>
      <line x1="250" y1="225" x2="400" y2="140" stroke="#ddd6fe" stroke-width="4"/>
      <line x1="250" y1="225" x2="400" y2="310" stroke="#ddd6fe" stroke-width="4"/>
      <line x1="400" y1="140" x2="550" y2="225" stroke="#ddd6fe" stroke-width="4"/>
      <line x1="400" y1="310" x2="550" y2="225" stroke="#ddd6fe" stroke-width="4"/>
      <text x="400" y="400" text-anchor="middle" fill="#f5f3ff" font-family="system-ui, sans-serif" font-weight="900" font-size="24">NEURAL AI ENGINE</text>
    </svg>`
  },
  {
    key: 'data-analytics-bi',
    title: 'Data Analytics & Power BI',
    keywords: ['power bi', 'data analyst', 'business intelligence', 'sql', 'tableau', 'data visualization', 'excel', 'pandas', 'analytics', 'dashboard', 'reporting', 'statistics'],
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    altText: 'Data Analytics and Power BI course visual showing business intelligence dashboards and data analytics charts',
    accentColor: '#2563eb',
    icon: '📊',
    svgFallback: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
      <defs>
        <linearGradient id="daGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#1d4ed8"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#daGrad)"/>
      <rect x="180" y="240" width="70" height="120" rx="6" fill="#60a5fa"/>
      <rect x="290" y="180" width="70" height="180" rx="6" fill="#93c5fd"/>
      <rect x="400" y="120" width="70" height="240" rx="6" fill="#3b82f6"/>
      <rect x="510" y="200" width="70" height="160" rx="6" fill="#60a5fa"/>
      <path d="M180 220 Q 320 100, 580 140" fill="none" stroke="#f59e0b" stroke-width="6"/>
      <text x="400" y="80" text-anchor="middle" fill="#eff6ff" font-family="system-ui, sans-serif" font-weight="900" font-size="24">DATA ANALYTICS & POWER BI</text>
    </svg>`
  },
  {
    key: 'fullstack-webdev',
    title: 'Full Stack Web Development',
    keywords: ['full stack', 'web development', 'react', 'node', 'javascript', 'frontend', 'backend', 'rest api', 'express', 'html', 'css', 'git', 'github', 'software engineer', 'coding'],
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    altText: 'Full Stack Web Development course visual showing modern web application code editor and developer workstation',
    accentColor: '#059669',
    icon: '💻',
    svgFallback: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
      <defs>
        <linearGradient id="fsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#064e3b"/>
          <stop offset="100%" stop-color="#0284c7"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#fsGrad)"/>
      <rect x="150" y="90" width="500" height="270" rx="12" fill="#0f172a" stroke="#34d399" stroke-width="3"/>
      <circle cx="180" cy="115" r="6" fill="#ef4444"/>
      <circle cx="200" cy="115" r="6" fill="#f59e0b"/>
      <circle cx="220" cy="115" r="6" fill="#10b981"/>
      <text x="180" y="160" fill="#34d399" font-family="monospace" font-weight="700" font-size="18">const app = express();</text>
      <text x="180" y="200" fill="#60a5fa" font-family="monospace" font-weight="700" font-size="18">&lt;ReactApp user={graduate} /&gt;</text>
      <text x="180" y="240" fill="#f43f5e" font-family="monospace" font-weight="700" font-size="18">await db.connect();</text>
      <text x="400" y="410" text-anchor="middle" fill="#ecfdf5" font-family="system-ui, sans-serif" font-weight="900" font-size="22">FULL STACK ENGINE</text>
    </svg>`
  },
  {
    key: 'autocad-mechanical',
    title: 'AutoCAD & Mechanical Design',
    keywords: ['cad', 'cam', 'autocad', 'solidworks', 'mechanical', '3d modeling', 'fea', 'thermodynamics', 'gd&t', 'product design', 'manufacturing', 'automotive'],
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    altText: 'AutoCAD and Mechanical Engineering Design course visual showing 3D CAD modeling rendering and industrial blueprints',
    accentColor: '#d97706',
    icon: '⚙️',
    svgFallback: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
      <defs>
        <linearGradient id="mechGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e293b"/>
          <stop offset="100%" stop-color="#b45309"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#mechGrad)"/>
      <circle cx="400" cy="225" r="100" fill="none" stroke="#fbbf24" stroke-width="12" stroke-dasharray="25 15"/>
      <circle cx="400" cy="225" r="50" fill="#0f172a" stroke="#fbbf24" stroke-width="6"/>
      <text x="400" y="390" text-anchor="middle" fill="#fffbeb" font-family="system-ui, sans-serif" font-weight="900" font-size="24">3D CAD & MECHANICAL DESIGN</text>
    </svg>`
  },
  {
    key: 'cybersecurity',
    title: 'Cybersecurity & Network Defense',
    keywords: ['cybersecurity', 'security', 'network', 'ethical hacking', 'siem', 'encryption', 'linux', 'firewall', 'penetration', 'cloud security'],
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    altText: 'Cybersecurity and Network Defense course visual showing digital security shield and encrypted data streams',
    accentColor: '#dc2626',
    icon: '🛡️',
    svgFallback: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
      <defs>
        <linearGradient id="secGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#450a0a"/>
          <stop offset="100%" stop-color="#991b1b"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#secGrad)"/>
      <path d="M400 100 L520 150 V260 Q400 340 400 340 Q400 340 280 260 V150 Z" fill="#b91c1c" stroke="#fca5a5" stroke-width="4"/>
      <text x="400" y="240" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="36">🔒</text>
      <text x="400" y="400" text-anchor="middle" fill="#fef2f2" font-family="system-ui, sans-serif" font-weight="900" font-size="24">CYBERSECURITY SHIELD</text>
    </svg>`
  },
  {
    key: 'cloud-aws-devops',
    title: 'Cloud Computing & AWS DevOps',
    keywords: ['cloud', 'aws', 'azure', 'docker', 'kubernetes', 'devops', 'terraform', 'microservices', 'infrastructure', 'ci/cd'],
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    altText: 'Cloud Computing and AWS DevOps course visual showing cloud server infrastructure and interconnected global node networks',
    accentColor: '#0284c7',
    icon: '☁️',
    svgFallback: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
      <defs>
        <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0c4a6e"/>
          <stop offset="100%" stop-color="#0369a1"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#cloudGrad)"/>
      <path d="M300 240 Q300 180 370 170 Q410 130 480 150 Q540 150 560 200 Q610 210 600 260 Q600 300 540 300 H320 Q280 300 300 240 Z" fill="#38bdf8" opacity="0.9"/>
      <text x="400" y="380" text-anchor="middle" fill="#e0f2fe" font-family="system-ui, sans-serif" font-weight="900" font-size="24">CLOUD ARCHITECTURE & DEVOPS</text>
    </svg>`
  },
  {
    key: 'finance-investment',
    title: 'Financial Modeling & Corporate Accounting',
    keywords: ['finance', 'financial', 'accounting', 'tally', 'gst', 'taxation', 'investment', 'banking', 'valuation', 'modelling', 'commerce', 'audit'],
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    altText: 'Financial Modeling and Corporate Accounting course visual showing investment charts, corporate tax reports, and financial modeling spreadsheets',
    accentColor: '#047857',
    icon: '📈',
    svgFallback: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
      <defs>
        <linearGradient id="finGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#064e3b"/>
          <stop offset="100%" stop-color="#047857"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#finGrad)"/>
      <path d="M150 320 L 300 220 L 450 270 L 650 140" fill="none" stroke="#34d399" stroke-width="8"/>
      <circle cx="650" cy="140" r="12" fill="#34d399"/>
      <text x="400" y="390" text-anchor="middle" fill="#ecfdf5" font-family="system-ui, sans-serif" font-weight="900" font-size="24">FINANCIAL MODELING & VALUATION</text>
    </svg>`
  },
  {
    key: 'digital-marketing',
    title: 'Digital Marketing & Brand Strategy',
    keywords: ['digital marketing', 'seo', 'sem', 'social media', 'brand', 'content marketing', 'google analytics', 'canva', 'marketing', 'market research'],
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    altText: 'Digital Marketing and Brand Strategy course visual showing online analytics dashboard, SEO campaign metrics, and growth marketing charts',
    accentColor: '#ea580c',
    icon: '🚀',
    svgFallback: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
      <defs>
        <linearGradient id="mktGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#431407"/>
          <stop offset="100%" stop-color="#c2410c"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#mktGrad)"/>
      <text x="400" y="210" text-anchor="middle" fill="#ffedd5" font-family="system-ui, sans-serif" font-weight="900" font-size="64">📢 🚀 📈</text>
      <text x="400" y="390" text-anchor="middle" fill="#ffedd5" font-family="system-ui, sans-serif" font-weight="900" font-size="24">DIGITAL MARKETING STRATEGY</text>
    </svg>`
  },
  {
    key: 'clinical-medical',
    title: 'Clinical Research & Healthcare Sciences',
    keywords: ['clinical', 'medical', 'healthcare', 'pharmacy', 'pharmacology', 'public health', 'nursing', 'doctor', 'patient care', 'ehr', 'spss', 'mbbs'],
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
    altText: 'Clinical Research and Healthcare Sciences course visual showing clinical trial laboratory diagnostic charts and medical research equipment',
    accentColor: '#0891b2',
    icon: '🩺',
    svgFallback: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
      <defs>
        <linearGradient id="medGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#164e63"/>
          <stop offset="100%" stop-color="#0e7490"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#medGrad)"/>
      <rect x="360" y="140" width="80" height="170" rx="10" fill="#67e8f9"/>
      <rect x="315" y="185" width="170" height="80" rx="10" fill="#67e8f9"/>
      <text x="400" y="390" text-anchor="middle" fill="#cffafe" font-family="system-ui, sans-serif" font-weight="900" font-size="24">CLINICAL & MEDICAL RESEARCH</text>
    </svg>`
  },
  {
    key: 'corporate-law',
    title: 'Corporate Law & Regulatory Compliance',
    keywords: ['law', 'legal', 'compliance', 'corporate law', 'contract', 'intellectual property', 'cyber law', 'tax law', 'jurisprudence', 'advocate'],
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    altText: 'Corporate Law and Regulatory Compliance course visual showing scales of justice, law books, and corporate legal contracts',
    accentColor: '#b45309',
    icon: '⚖️',
    svgFallback: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
      <defs>
        <linearGradient id="lawGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#451a03"/>
          <stop offset="100%" stop-color="#78350f"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#lawGrad)"/>
      <text x="400" y="220" text-anchor="middle" fill="#fef3c7" font-family="system-ui, sans-serif" font-weight="900" font-size="72">⚖️</text>
      <text x="400" y="390" text-anchor="middle" fill="#fffbeb" font-family="system-ui, sans-serif" font-weight="900" font-size="24">CORPORATE LAW & COMPLIANCE</text>
    </svg>`
  },
  {
    key: 'agritech-farming',
    title: 'Agricultural Technology & Smart Farming',
    keywords: ['agriculture', 'agronomy', 'farming', 'soil', 'crop', 'horticulture', 'agritech', 'gis', 'qgis', 'precision agriculture', 'plant'],
    imageUrl: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=800&q=80',
    altText: 'Agricultural Technology and Smart Farming course visual showing precision crop field surveying and digital agritech analytics',
    accentColor: '#15803d',
    icon: '🌱',
    svgFallback: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
      <defs>
        <linearGradient id="agriGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#14532d"/>
          <stop offset="100%" stop-color="#15803d"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#agriGrad)"/>
      <text x="400" y="220" text-anchor="middle" fill="#dcfce7" font-family="system-ui, sans-serif" font-weight="900" font-size="72">🌱 🚜 🌾</text>
      <text x="400" y="390" text-anchor="middle" fill="#f0fdf4" font-family="system-ui, sans-serif" font-weight="900" font-size="24">AGRITECH & PRECISION FARMING</text>
    </svg>`
  },
  {
    key: 'psychology-humanities',
    title: 'Behavioral Psychology & Social Sciences',
    keywords: ['psychology', 'sociology', 'humanities', 'counselling', 'behavioural', 'research methodology', 'spss', 'journalism', 'communication'],
    imageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
    altText: 'Behavioral Psychology and Social Sciences Research course visual showing research journals and cognitive analysis tools',
    accentColor: '#6d28d9',
    icon: '🧠',
    svgFallback: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
      <defs>
        <linearGradient id="psyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3b0764"/>
          <stop offset="100%" stop-color="#6d28d9"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#psyGrad)"/>
      <text x="400" y="220" text-anchor="middle" fill="#ddd6fe" font-family="system-ui, sans-serif" font-weight="900" font-size="72">🧠 📚 🔍</text>
      <text x="400" y="390" text-anchor="middle" fill="#faf5ff" font-family="system-ui, sans-serif" font-weight="900" font-size="24">BEHAVIORAL & SOCIAL SCIENCES</text>
    </svg>`
  },
  {
    key: 'pure-sciences-biotech',
    title: 'Pure & Applied Sciences (Biotech & Chemistry)',
    keywords: ['biotech', 'biotechnology', 'chemistry', 'physics', 'microbiology', 'mathematics', 'lab', 'laboratory', 'genetics'],
    imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
    altText: 'Pure and Applied Sciences course visual showing biotechnology laboratory research and chemical analysis',
    accentColor: '#059669',
    icon: '🔬',
    svgFallback: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
      <defs>
        <linearGradient id="sciGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#064e3b"/>
          <stop offset="100%" stop-color="#059669"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#sciGrad)"/>
      <text x="400" y="220" text-anchor="middle" fill="#d1fae5" font-family="system-ui, sans-serif" font-weight="900" font-size="72">🔬 🧪 🧬</text>
      <text x="400" y="390" text-anchor="middle" fill="#ecfdf5" font-family="system-ui, sans-serif" font-weight="900" font-size="24">APPLIED SCIENCES & BIOTECH</text>
    </svg>`
  }
];

// Generic professional educational fallback
const GENERIC_LEARNING_FALLBACK = {
  key: 'generic-learning',
  title: 'Professional Learning & Upskilling',
  keywords: [],
  imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
  altText: 'Professional Learning and Graduate Skill Acquisition course visual',
  accentColor: '#2563eb',
  icon: '🎓',
  svgFallback: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
    <defs>
      <linearGradient id="genGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#1e293b"/>
      </linearGradient>
    </defs>
    <rect width="800" height="450" fill="url(#genGrad)"/>
    <text x="400" y="220" text-anchor="middle" fill="#93c5fd" font-family="system-ui, sans-serif" font-weight="900" font-size="72">🎓 💼 🚀</text>
    <text x="400" y="390" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="900" font-size="24">GRADUATE CAREER PLATFORM</text>
  </svg>`
};

/**
 * Resolves a course or learning item to its course-specific image metadata.
 * 
 * @param {Object|string} item Course object or title string
 * @returns {Object} { key, title, imageUrl, svgFallback, altText, accentColor, icon, dataUriFallback }
 */
export function resolveCourseImage(item) {
  if (!item) return GENERIC_LEARNING_FALLBACK;

  // 1. Explicit imageUrl provided on item object
  if (typeof item === 'object' && item.imageUrl && typeof item.imageUrl === 'string' && item.imageUrl.startsWith('http')) {
    const rawTitle = item.title || item.name || item.courseName || 'Learning Course';
    return {
      key: 'custom-provided',
      title: rawTitle,
      imageUrl: item.imageUrl,
      svgFallback: GENERIC_LEARNING_FALLBACK.svgFallback,
      altText: `${rawTitle} course visual`,
      accentColor: '#2563eb',
      icon: '🎓',
      dataUriFallback: `data:image/svg+xml;utf8,${encodeURIComponent(GENERIC_LEARNING_FALLBACK.svgFallback)}`
    };
  }

  // 2. Extract text payload to evaluate keywords
  const title = typeof item === 'string' ? item : (item.title || item.courseName || item.name || item.resourceTitle || item.skill || '');
  const category = typeof item === 'object' ? (item.category || item.domain || item.field || '') : '';
  const skills = typeof item === 'object' && Array.isArray(item.requiredSkills) ? item.requiredSkills.join(' ') : (item.techStack || '');
  const description = typeof item === 'object' ? (item.description || item.summary || '') : '';

  const fullText = `${title} ${category} ${skills} ${description}`.toLowerCase();

  // 3. Search topic registry for best keyword match
  for (const topic of COURSE_TOPIC_REGISTRY) {
    const hasMatch = topic.keywords.some(kw => fullText.includes(kw.toLowerCase()));
    if (hasMatch) {
      const specificTitle = title || topic.title;
      return {
        ...topic,
        altText: `${specificTitle} course visual`,
        dataUriFallback: `data:image/svg+xml;utf8,${encodeURIComponent(topic.svgFallback)}`
      };
    }
  }

  // 4. Fallback to generic learning visual with course title
  const safeTitle = title || 'Professional Learning Course';
  return {
    ...GENERIC_LEARNING_FALLBACK,
    altText: `${safeTitle} course visual`,
    dataUriFallback: `data:image/svg+xml;utf8,${encodeURIComponent(GENERIC_LEARNING_FALLBACK.svgFallback)}`
  };
}
