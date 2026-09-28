/**
 * graduateExamImageResolver.js
 * 
 * Central Competitive Exam Image Resolver for the Graduate Portal.
 * Maps any competitive exam (GATE, CAT, UPSC, UGC NET, CSIR NET, Banking, SSC, TNPSC, GRE/IELTS, etc.)
 * to a visually relevant, high-resolution exam image, SVG fallback, accent color, and alt text.
 */

const EXAM_TOPIC_REGISTRY = [
  {
    key: 'gate',
    keywords: ['gate', 'graduate aptitude test in engineering', 'engineering math', 'psu'],
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    altText: 'GATE Engineering Entrance Examination preparation visual showing technical blueprint and core engineering diagnostics',
    accentColor: '#2563eb',
    icon: '⚙️',
    svgFallback: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
      <defs>
        <linearGradient id="gateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#1d4ed8"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#gateGrad)"/>
      <circle cx="400" cy="210" r="85" fill="none" stroke="#60a5fa" stroke-width="10" stroke-dasharray="20 10"/>
      <text x="400" y="225" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="32">GATE</text>
      <text x="400" y="380" text-anchor="middle" fill="#dbeafe" font-family="system-ui, sans-serif" font-weight="900" font-size="22">ENGINEERING & PSU RECRUITMENT</text>
    </svg>`
  },
  {
    key: 'cat',
    keywords: ['cat', 'common admission test', 'xat', 'cmat', 'mat', 'iim', 'mba', 'quantitative aptitude', 'dilr', 'varc'],
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
    altText: 'CAT Management Admission Examination visual showing quantitative analytics, business reasoning, and leadership strategy',
    accentColor: '#7c3aed',
    icon: '📊',
    svgFallback: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
      <defs>
        <linearGradient id="catGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2e1065"/>
          <stop offset="100%" stop-color="#6d28d9"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#catGrad)"/>
      <text x="400" y="210" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="64">📈 CAT / IIM</text>
      <text x="400" y="380" text-anchor="middle" fill="#faf5ff" font-family="system-ui, sans-serif" font-weight="900" font-size="22">MANAGEMENT & BUSINESS ADMISSION</text>
    </svg>`
  },
  {
    key: 'upsc',
    keywords: ['upsc', 'civil services', 'ias', 'ips', 'ifs', 'irs', 'public administration', 'polity', 'governance'],
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    altText: 'UPSC Civil Services Examination visual showing Indian public administration, constitutional law, and national governance',
    accentColor: '#059669',
    icon: '🏛️',
    svgFallback: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
      <defs>
        <linearGradient id="upscGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#064e3b"/>
          <stop offset="100%" stop-color="#047857"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#upscGrad)"/>
      <text x="400" y="210" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="64">🏛️ UPSC CSE</text>
      <text x="400" y="380" text-anchor="middle" fill="#ecfdf5" font-family="system-ui, sans-serif" font-weight="900" font-size="22">CIVIL SERVICES & GOVERNANCE</text>
    </svg>`
  },
  {
    key: 'ugc-net',
    keywords: ['ugc net', 'ugc-net', 'lectureship', 'assistant professor', 'jrf', 'teaching', 'higher education'],
    imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
    altText: 'UGC NET Examination visual showing university lectureship, academic pedagogy, and higher education research',
    accentColor: '#d97706',
    icon: '🎓',
    svgFallback: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
      <defs>
        <linearGradient id="ugcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#451a03"/>
          <stop offset="100%" stop-color="#b45309"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#ugcGrad)"/>
      <text x="400" y="210" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="64">🎓 UGC NET</text>
      <text x="400" y="380" text-anchor="middle" fill="#fffbeb" font-family="system-ui, sans-serif" font-weight="900" font-size="22">ACADEMIC RESEARCH & LECTURESHIP</text>
    </svg>`
  },
  {
    key: 'csir-net',
    keywords: ['csir net', 'csir-net', 'scientific research', 'chemical sciences', 'life sciences', 'physical sciences', 'laboratory'],
    imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
    altText: 'CSIR NET Examination visual showing advanced scientific research laboratory and molecular analytics',
    accentColor: '#0891b2',
    icon: '🔬',
    svgFallback: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
      <defs>
        <linearGradient id="csirGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#164e63"/>
          <stop offset="100%" stop-color="#0891b2"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#csirGrad)"/>
      <text x="400" y="210" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="64">🔬 CSIR NET</text>
      <text x="400" y="380" text-anchor="middle" fill="#cffafe" font-family="system-ui, sans-serif" font-weight="900" font-size="22">SCIENTIFIC RESEARCH FELLOWSHIP</text>
    </svg>`
  },
  {
    key: 'banking-ibps-sbi',
    keywords: ['banking', 'ibps', 'sbi', 'po', 'clerk', 'probationary officer', 'rbi', 'financial services'],
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
    altText: 'Banking Examination visual showing corporate banking analytics, quantitative aptitude, and financial management',
    accentColor: '#0284c7',
    icon: '🏦',
    svgFallback: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
      <defs>
        <linearGradient id="bankGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0c4a6e"/>
          <stop offset="100%" stop-color="#0284c7"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#bankGrad)"/>
      <text x="400" y="210" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="64">🏦 IBPS / SBI PO</text>
      <text x="400" y="380" text-anchor="middle" fill="#e0f2fe" font-family="system-ui, sans-serif" font-weight="900" font-size="22">BANKING & FINANCIAL OFFICERS</text>
    </svg>`
  },
  {
    key: 'ssc-cgl-je',
    keywords: ['ssc', 'cgl', 'je', 'staff selection commission', 'central govt', 'income tax', 'customs'],
    imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
    altText: 'SSC CGL Examination visual showing Central Government administrative officer posts and general intelligence benchmarking',
    accentColor: '#ea580c',
    icon: '📜',
    svgFallback: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
      <defs>
        <linearGradient id="sscGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#431407"/>
          <stop offset="100%" stop-color="#ea580c"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#sscGrad)"/>
      <text x="400" y="210" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="64">📜 SSC CGL / JE</text>
      <text x="400" y="380" text-anchor="middle" fill="#ffedd5" font-family="system-ui, sans-serif" font-weight="900" font-size="22">CENTRAL GOVERNMENT RECRUITMENT</text>
    </svg>`
  },
  {
    key: 'gre-ielts',
    keywords: ['gre', 'ielts', 'toefl', 'abroad', 'international', 'study abroad', 'ets'],
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    altText: 'GRE and IELTS Examination visual showing international university admission and study abroad aptitude',
    accentColor: '#4f46e5',
    icon: '✈️',
    svgFallback: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
      <defs>
        <linearGradient id="greGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e1b4b"/>
          <stop offset="100%" stop-color="#4f46e5"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#greGrad)"/>
      <text x="400" y="210" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="64">✈️ GRE & IELTS</text>
      <text x="400" y="380" text-anchor="middle" fill="#e0e7ff" font-family="system-ui, sans-serif" font-weight="900" font-size="22">INTERNATIONAL POSTGRADUATE ADMISSION</text>
    </svg>`
  },
  {
    key: 'tnpsc-state-psc',
    keywords: ['tnpsc', 'state psc', 'group 1', 'group 2', 'deputy collector', 'tamil nadu'],
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    altText: 'State Public Service Commission Examination visual showing state administration and civil leadership',
    accentColor: '#16a34a',
    icon: '🏛️',
    svgFallback: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
      <defs>
        <linearGradient id="stateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#14532d"/>
          <stop offset="100%" stop-color="#16a34a"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#stateGrad)"/>
      <text x="400" y="210" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="64">🏛️ TNPSC / STATE PSC</text>
      <text x="400" y="380" text-anchor="middle" fill="#f0fdf4" font-family="system-ui, sans-serif" font-weight="900" font-size="22">STATE ADMINISTRATIVE SERVICES</text>
    </svg>`
  }
];

const GENERIC_EXAM_FALLBACK = {
  key: 'generic-exam',
  title: 'Competitive & Government Examination',
  keywords: [],
  imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
  altText: 'Competitive and Government Examination preparation visual',
  accentColor: '#2563eb',
  icon: '📝',
  svgFallback: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
    <defs>
      <linearGradient id="genExamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#1e293b"/>
      </linearGradient>
    </defs>
    <rect width="800" height="450" fill="url(#genExamGrad)"/>
    <text x="400" y="210" text-anchor="middle" fill="#93c5fd" font-family="system-ui, sans-serif" font-weight="900" font-size="72">📝 🎓 🏆</text>
    <text x="400" y="380" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="900" font-size="22">NATIONAL COMPETITIVE EXAMINATION</text>
  </svg>`
};

/**
 * Resolves a competitive exam to its exam-specific image metadata.
 * 
 * @param {Object|string} exam Exam object or exam name string
 * @returns {Object} { key, title, imageUrl, svgFallback, altText, accentColor, icon, dataUriFallback }
 */
export function resolveExamImage(exam) {
  if (!exam) return GENERIC_EXAM_FALLBACK;

  const examName = typeof exam === 'string' ? exam : (exam.name || exam.title || exam.examName || '');
  const category = typeof exam === 'object' ? (exam.category || exam.conductingBody || '') : '';
  const fullText = `${examName} ${category}`.toLowerCase();

  for (const topic of EXAM_TOPIC_REGISTRY) {
    const hasMatch = topic.keywords.some(kw => fullText.includes(kw.toLowerCase()));
    if (hasMatch) {
      const specificName = examName || topic.title;
      return {
        ...topic,
        altText: `${specificName} preparation visual`,
        dataUriFallback: `data:image/svg+xml;utf8,${encodeURIComponent(topic.svgFallback)}`
      };
    }
  }

  const safeTitle = examName || 'Competitive Examination';
  return {
    ...GENERIC_EXAM_FALLBACK,
    altText: `${safeTitle} preparation visual`,
    dataUriFallback: `data:image/svg+xml;utf8,${encodeURIComponent(GENERIC_EXAM_FALLBACK.svgFallback)}`
  };
}
