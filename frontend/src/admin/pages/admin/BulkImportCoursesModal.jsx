import React, { useState } from 'react'
import { Modal, FormActions, PrimaryBtn, SBtn } from '../../components/UI'
import { courseService } from '../../../services/courseService'

export default function BulkImportCoursesModal({ onClose, onImportSuccess }) {
  const [sourceText, setSourceText] = useState('')
  const [parsedCourses, setParsedCourses] = useState([])
  const [isParsing, setIsParsing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)

  const parseSourceText = () => {
    setIsParsing(true)
    const lines = sourceText.split('\n').map(l => l.trim()).filter(Boolean)
    const courses = []
    
    let currentCategory = 'Others'

    const getDuration = (type, category) => {
      if (type === 'Diploma') return '2 Years'
      if (type === 'Certificate') return '6 Months'
      if (category === 'Engineering' || category === 'Architecture') return '4 Years'
      return '3 Years'
    }

    const getType = (name) => {
      name = name.toLowerCase()
      if (name.includes('diploma')) return 'Diploma'
      if (name.includes('certificate')) return 'Certificate'
      return 'Degree'
    }

    for (let line of lines) {
      if (line.toLowerCase().includes('list of') || line.toLowerCase().includes('upload courses')) {
        const lower = line.toLowerCase()
        if (lower.includes('diploma')) currentCategory = 'Polytechnic' // mapped
        else if (lower.includes('arts')) currentCategory = 'Arts'
        else if (lower.includes('certification') || lower.includes('certificate')) currentCategory = 'Certificate'
        else if (lower.includes('commerce')) currentCategory = 'Commerce'
        else if (lower.includes('entrepreneur')) currentCategory = 'Management'
        else if (lower.includes('management')) currentCategory = 'Management'
        else if (lower.includes('science')) currentCategory = 'Science'
        else if (lower.includes('engineering') || lower.includes('tech')) currentCategory = 'Engineering'
        continue
      }

      // Check if it looks like a valid course name (starts with B.E, B.Sc, Diploma, etc)
      if (line.startsWith('B.') || line.startsWith('Diploma') || line.startsWith('Certificate')) {
        const cType = getType(line)
        // Clean up course name
        let name = line.replace(/(\/ B\.Sc\..*|\/ Garment.*)/, '').trim()
        
        courses.push({
          courseName: name,
          category: currentCategory,
          targetLevel: 'After 12th',
          level: cType,
          duration: getDuration(cType, currentCategory),
          eligibility: '10+2 standard passing',
          shortDescription: `Learn foundational and advanced concepts in ${name}.`,
          sourceUrl: 'https://www.drukihsr.org/druk/blog/courses-after-12th/',
          isPublished: true
        })
      }
    }

    // Deduplicate internally before showing preview
    const uniqueMap = {}
    courses.forEach(c => {
       const key = c.courseName.toLowerCase()
       if (!uniqueMap[key]) uniqueMap[key] = c
    })

    setParsedCourses(Object.values(uniqueMap))
    setIsParsing(false)
  }

  const handleImport = async () => {
    setIsImporting(true)
    try {
      const res = await courseService.bulkImport({ courses: parsedCourses })
      if (res.success) {
         setImportResult(`Successfully added ${res.stats.inserted} courses! (Skipped ${res.stats.skipped} duplicates)`)
         setTimeout(() => {
            onImportSuccess()
         }, 3000)
      } else {
         setImportResult('Import failed: ' + res.message)
      }
    } catch (err) {
      console.error('Import error', err)
      setImportResult('Import API error. Please check console.')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Modal title="Bulk Import Courses from Source" onClose={onClose}>
      {!importResult ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {parsedCourses.length === 0 ? (
            <>
              <p style={{ fontSize: 13, color: 'var(--text2)', margin: 0 }}>
                Paste the copied text from the source page directly into this box. The parser will extract 
                valid courses, auto-categorize them (Engineering, Arts, etc.), and assign the <b>After 12th</b> trajectory.
              </p>
              <textarea 
                rows={12}
                placeholder="Paste the raw text here (e.g. List of 15 Arts Courses... B.A. Tamil Literature...)"
                value={sourceText}
                onChange={e => setSourceText(e.target.value)}
                style={{
                  width: '100%', padding: 12, borderRadius: 8, border: '1px solid var(--border)',
                  fontFamily: 'monospace', fontSize: 13, resize: 'vertical'
                }}
              />
              <FormActions 
                onClose={onClose} 
                onSave={parseSourceText} 
                saveDisabled={!sourceText.trim() || isParsing}
                saveText={isParsing ? "Parsing..." : "Parse Text"} 
              />
            </>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <h4 style={{ margin: 0 }}>Preview Parsed Courses</h4>
                 <div style={{ fontSize: 13, background: 'var(--primary-l)', color: 'var(--primary)', padding: '4px 10px', borderRadius: 20, fontWeight: 700 }}>
                   {parsedCourses.length} Valid Courses Found
                 </div>
              </div>
              <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: 10, background: 'var(--surface2)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {parsedCourses.map((c, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, background: '#fff', padding: 8, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                     <span style={{ fontWeight: 600, width: '40%'}}>{c.courseName}</span>
                     <span style={{ width: '25%', color: 'var(--text2)' }}>{c.category}</span>
                     <span style={{ width: '20%', color: 'var(--primary)' }}>{c.targetLevel}</span>
                     <span style={{ width: '15%', color: 'var(--text3)' }}>{c.duration}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
                 <SBtn variant="outline" onClick={() => setParsedCourses([])}>Reset</SBtn>
                 <PrimaryBtn onClick={handleImport} disabled={isImporting}>
                   {isImporting ? 'Importing securely...' : 'Confirm & Import to Database'}
                 </PrimaryBtn>
              </div>
            </>
          )}
        </div>
      ) : (
         <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
            <h3 style={{ margin: '0 0 10px' }}>Import Completed</h3>
            <p style={{ color: 'var(--text2)', fontWeight: 600 }}>{importResult}</p>
         </div>
      )}
    </Modal>
  )
}
