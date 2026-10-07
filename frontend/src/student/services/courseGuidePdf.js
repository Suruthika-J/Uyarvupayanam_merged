import jsPDF from 'jspdf'
import { applyPlugin } from 'jspdf-autotable'

// jspdf-autotable v5 only self-registers off `window.jsPDF`, so doc.autoTable
// can be undefined depending on bundling. Registering explicitly is
// idempotent and guarantees the table API is available.
applyPlugin(jsPDF)

/**
 * Client-side PDF export for the student "Download Guide" button.
 *
 * Renders the course guide straight from the data the Course Detail page has
 * already loaded (course / colleges / cutoffs) — no extra API calls, and no
 * reliance on the browser print dialog.
 */

// Matches --s-primary on the student UI.
const PRIMARY = [79, 70, 229]
const HEADING = [15, 23, 42]
const BODY = [51, 65, 85]
const MUTED = [100, 116, 139]
const BORDER = [226, 232, 240]

const PAGE = { w: 210, h: 297 }
const M = 16 // page margin (mm)
const CONTENT_W = PAGE.w - M * 2

// College and cutoff tables are capped so a course mapped to thousands of
// colleges cannot produce an unusable multi-hundred-megabyte file.
const MAX_COLLEGES = 150
const MAX_CUTOFFS = 120

const txt = (v) => (v === null || v === undefined ? '' : String(v).replace(/\s+/g, ' ').trim())

const has = (v) => txt(v).length > 0

/**
 * Safe download filename: "B.E. Agri Engineering (SS)" ->
 * "B-E-Agri-Engineering-SS-Guide.pdf". Windows-illegal characters
 * ( \ / : * ? " < > | ), whitespace and unicode are all collapsed away.
 */
export const buildGuideFileName = (courseName) => {
  const slug = txt(courseName)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')      // strip accents
    .replace(/[^a-zA-Z0-9]+/g, '-')        // spaces + punctuation -> '-'
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${slug || 'Course'}-Guide.pdf`
}

/* ── low-level layout helpers ─────────────────────────────────────── */

const setBody = (doc) => doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(...BODY)
const setMuted = (doc) => doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(...MUTED)

/** Draw a section title with a short accent rule, return the next y. */
const sectionTitle = (doc, y, title) => {
  doc.setFont('helvetica', 'bold').setFontSize(13).setTextColor(...HEADING)
  doc.text(title, M, y)
  doc.setDrawColor(...PRIMARY).setLineWidth(0.6)
  doc.line(M, y + 1.6, M + 14, y + 1.6)
  return y + 7
}

/** Wrapped paragraph. Returns the next free y (adds spacing). */
const paragraph = (doc, y, value, { size = 10, color = BODY, lineHeight = 4.6, gap = 5 } = {}) => {
  const body = txt(value)
  if (!body) return y
  doc.setFont('helvetica', 'normal').setFontSize(size).setTextColor(...color)
  const lines = doc.splitTextToSize(body, CONTENT_W)
  const height = lines.length * lineHeight
  if (y + height > PAGE.h - M - 12) {
    doc.addPage()
    y = M
  }
  doc.text(lines, M, y)
  return y + height + gap
}

/** Bulleted list, chunked across pages. */
const bulletList = (doc, y, items, { size = 10, gap = 3 } = {}) => {
  const list = (items || []).map(txt).filter(Boolean)
  if (!list.length) return y
  doc.setFont('helvetica', 'normal').setFontSize(size).setTextColor(...BODY)
  for (const item of list) {
    const lines = doc.splitTextToSize(item, CONTENT_W - 5)
    const height = lines.length * 4.4
    if (y + height > PAGE.h - M - 12) {
      doc.addPage()
      y = M
    }
    doc.setFillColor(...PRIMARY)
    doc.circle(M + 1.1, y - 1.2, 0.7, 'F')
    doc.text(lines, M + 5, y)
    y += height + gap
  }
  return y + 2
}

/** Ensure `needed` mm of vertical space, paging if required. */
const ensureSpace = (doc, y, needed) => {
  if (y + needed > PAGE.h - M - 12) {
    doc.addPage()
    return M
  }
  return y
}

/**
 * Key/value facts as a compact two-column table. autoTable is used because it
 * already handles page breaks and cell wrapping correctly.
 */
const factGrid = (doc, y, facts) => {
  const rows = (facts || []).filter(([, v]) => has(v))
  if (!rows.length) return y

  const pairs = []
  for (let i = 0; i < rows.length; i += 2) {
    const left = rows[i]
    const right = rows[i + 1]
    pairs.push([
      has(left[1]) ? `${String(left[0]).toUpperCase()}\n${txt(left[1])}` : '',
      has(right?.[1]) ? `${String(right[0]).toUpperCase()}\n${txt(right[1])}` : '',
    ])
  }

  doc.autoTable({
    body: pairs,
    startY: y,
    margin: { left: M, right: M },
    theme: 'grid',
    styles: {
      font: 'helvetica', fontSize: 9, cellPadding: 2.2, lineColor: BORDER, lineWidth: 0.2,
      textColor: HEADING, valign: 'top',
    },
    didParseCell: (data) => {
      // Small uppercase label line, then the value line.
      if (data.section === 'body') data.cell.styles.fontStyle = 'normal'
    },
    columnStyles: { 0: { cellWidth: CONTENT_W / 2 }, 1: { cellWidth: CONTENT_W / 2 } },
  })

  return (doc.lastAutoTable?.finalY || y) + 5
}

const stampFooter = (doc, course) => {
  const pages = doc.getNumberOfPages()
  const label = `${txt(course.courseName) || 'Course Guide'}  |  Uyarvu Payanam`
  for (let i = 1; i <= pages; i += 1) {
    doc.setPage(i)
    setMuted(doc)
    doc.text(label, M, PAGE.h - 8)
    doc.text(`Page ${i} of ${pages}`, PAGE.w - M, PAGE.h - 8, { align: 'right' })
  }
}

/* ── public API ───────────────────────────────────────────────────── */

/**
 * Build and download the course guide PDF.
 *
 * @param {object} course    course document already loaded by the page
 * @param {Array}  colleges  offering colleges already loaded by the page
 * @param {Array}  cutoffs   TNEA cutoffs already loaded by the page
 * @returns {string} the filename that was saved
 */
export function downloadCourseGuidePdf(course, colleges = [], cutoffs = []) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const name = txt(course?.courseName) || 'Course Guide'

  /* Header band */
  doc.setFillColor(...PRIMARY)
  doc.rect(0, 0, PAGE.w, 34, 'F')
  doc.setFont('helvetica', 'bold').setFontSize(17).setTextColor(255, 255, 255)
  doc.text(doc.splitTextToSize(name, CONTENT_W), M, 14)
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(224, 231, 255)
  const subtitle = [course?.targetLevel, course?.level, course?.category].filter(has).join('  |  ')
  doc.text(subtitle || 'Course Guide', M, 27)

  let y = M + 14

  /* Intro */
  y = paragraph(doc, y, course?.shortDescription, { size: 10.5, lineHeight: 4.8, gap: 3 })

  /* Quick facts */
  y = sectionTitle(doc, ensureSpace(doc, y, 30), 'Quick Facts')
  y = factGrid(doc, y, [
    ['Duration', course?.duration],
    ['Eligibility', course?.eligibility],
    ['Level', course?.targetLevel || course?.level],
    ['Category', course?.category],
  ])

  /* Overview */
  if (has(course?.overview) || has(course?.futureScope)) {
    y = sectionTitle(doc, ensureSpace(doc, y, 26), 'Program Overview')
    y = paragraph(doc, y, course.overview || course.futureScope)
  }

  /* Skills + subjects */
  const skills = course?.skillsRequired || []
  const subjects = course?.subjectsCovered || []
  if (skills.length || subjects.length) {
    y = sectionTitle(doc, ensureSpace(doc, y, 26), 'Curriculum Snapshot')

    if (skills.length) {
      y = ensureSpace(doc, y, 12)
      setBody(doc)
      doc.setFont('helvetica', 'bold')
      doc.text('Key Skills', M, y)
      y = bulletList(doc, y + 5, skills)
    }
    if (subjects.length) {
      y = ensureSpace(doc, y, 12)
      setBody(doc)
      doc.setFont('helvetica', 'bold')
      doc.text('Core Subjects', M, y)
      y = bulletList(doc, y + 5, subjects)
    }
  }

  /* Career scope + salary */
  if (has(course?.careerScope) || has(course?.futureScope) || (course?.salaryRange && (course.salaryRange.starting || course.salaryRange.growth)) || (course?.jobRoles || []).length) {
    y = sectionTitle(doc, ensureSpace(doc, y, 26), 'Career Scope & Opportunities')
    y = paragraph(doc, y, course.careerScope || course.futureScope)

    y = factGrid(doc, y, [
      ['Starting Salary', course?.salaryRange?.starting],
      ['Growth Path', course?.salaryRange?.growth],
      ['Job Roles', (course?.jobRoles || []).length ? `${course.jobRoles.length} categories` : ''],
      ['Average Salary', course?.averageSalary],
    ])

    if ((course?.jobRoles || []).length) {
      y = bulletList(doc, y, course.jobRoles, { size: 9.5 })
    }
  }

  /* Admission */
  if (has(course?.admissionProcess) || has(course?.higherStudies)) {
    y = sectionTitle(doc, ensureSpace(doc, y, 26), 'Admission & Roadmap')

    if (has(course?.admissionProcess)) {
      y = paragraph(doc, y, course.admissionProcess)
    } else {
      y = paragraph(doc, y,
        'Admission details for this program are typically based on merit / entrance exam results. '
        + 'Contact the respective college for the most up-to-date process.',
        { color: MUTED, size: 9.5 })
    }

    if (has(course?.higherStudies)) {
      y = ensureSpace(doc, y, 14)
      setBody(doc)
      doc.setFont('helvetica', 'bold')
      doc.text('Higher Studies Opportunities', M, y)
      y = paragraph(doc, y + 5, course.higherStudies)
    }
  }

  /* Offering colleges */
  const collegeRows = (colleges || [])
    .slice(0, MAX_COLLEGES)
    .map((c) => [
      txt(c.collegeName) || '—',
      txt(c.district) || '—',
      txt(c.state) || '—',
      txt(c.collegeType || c.type) || '—',
      Number(c.feesPerYear) > 0 ? `Rs. ${Number(c.feesPerYear).toLocaleString('en-IN')}/yr` : 'Fees vary',
    ])

  if (collegeRows.length) {
    doc.addPage()
    y = sectionTitle(doc, M, `Colleges Offering ${name}`)
    setMuted(doc)
    doc.text(
      `${colleges.length} college${colleges.length === 1 ? '' : 's'} found`
      + (colleges.length > MAX_COLLEGES ? ` — showing the first ${MAX_COLLEGES}.` : '.'),
      M, y
    )
    y += 6

    doc.autoTable({
      head: [['College', 'District', 'State', 'Type', 'Fees']],
      body: collegeRows,
      startY: y,
      margin: { left: M, right: M },
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 8, cellPadding: 1.8, textColor: BODY, lineColor: BORDER, lineWidth: 0.2 },
      headStyles: { fillColor: PRIMARY, textColor: 255, fontStyle: 'bold', fontSize: 8 },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      columnStyles: { 0: { cellWidth: 70 }, 4: { cellWidth: 26 } },
    })

    y = (doc.lastAutoTable?.finalY || y) + 8
  }

  /* Cutoff trends (engineering only) */
  const cutoffRows = (cutoffs || [])
    .slice(0, MAX_CUTOFFS)
    .map((ct) => [
      txt(ct.collegeId?.collegeName || ct.college) || '—',
      txt(ct.courseId?.branchCode || ct.branchCode) || '—',
      txt(ct.year) || '—',
      txt(ct.cutoffData?.find((d) => ['OC', 'General'].includes(d.category))?.score ?? ct.oc) || '—',
      txt(ct.cutoffData?.find((d) => ['BC', 'OBC'].includes(d.category))?.score ?? ct.bc) || '—',
      txt(ct.cutoffData?.find((d) => ['SC', 'ST'].includes(d.category))?.score ?? ct.sc) || '—',
    ])

  if (cutoffRows.length) {
    doc.addPage()
    y = sectionTitle(doc, M, 'TNEA Cutoff Trends')
    setMuted(doc)
    doc.text(
      `Cutoff data sourced from official year-wise reports (2022-2025). Scores are category-specific.`
      + (cutoffs.length > MAX_CUTOFFS ? ` Showing the first ${MAX_CUTOFFS} of ${cutoffs.length} records.` : ''),
      M, y
    )
    y += 6

    doc.autoTable({
      head: [['College', 'Branch', 'Year', 'OC', 'OBC / BC', 'SC / ST']],
      body: cutoffRows,
      startY: y,
      margin: { left: M, right: M },
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 7.5, cellPadding: 1.6, textColor: BODY, lineColor: BORDER, lineWidth: 0.2 },
      headStyles: { fillColor: PRIMARY, textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
      alternateRowStyles: { fillColor: [249, 250, 251] },
    })

    y = (doc.lastAutoTable?.finalY || y) + 6
  }

  /* Closing note */
  y = ensureSpace(doc, y, 16) + 4
  setMuted(doc)
  doc.text(`Generated on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, M, y)

  stampFooter(doc, course || {})

  const fileName = buildGuideFileName(course?.courseName)
  doc.save(fileName)
  return fileName
}
