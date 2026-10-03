import React, { useState, useEffect } from 'react'
import axiosInstance from '../../../config/axios'
import { SBtn, SCard, SInput, SSelect, SBadge, AIGenerating, AIFailure, SEmpty } from '../../components/ui'
import {
  FiCalendar, FiCheckSquare, FiPlus, FiClock, FiCheck,
  FiZap, FiBookOpen, FiRefreshCw, FiUser, FiAlertCircle,
  FiEdit2, FiRepeat, FiSkipForward, FiAward, FiTarget,
  FiArrowRight, FiArrowLeft, FiSliders, FiShield, FiTrendingUp,
  FiCheckCircle, FiPlay, FiLayers, FiHelpCircle, FiTrash2,
  FiSearch, FiGlobe, FiExternalLink, FiCpu, FiBriefcase
} from 'react-icons/fi'
import { useCollegeProfile, useStudentContext } from '../../context/CollegeProfileContext'

export default function StudyPlannerPage() {
  const { profile } = useCollegeProfile()
  const { studentContext } = useStudentContext()

  // ── Overall Planner Mode: 'academic' | 'placement' ──
  const [plannerType, setPlannerType] = useState('academic')

  // ── Overall Planner View Mode: 'landing' | 'wizard' | 'animating' | 'dashboard'
  const [viewMode, setViewMode] = useState('landing')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activePlan, setActivePlan] = useState(null)
  const [activePlacementPlan, setActivePlacementPlan] = useState(null)
  const [xpEarned, setXpEarned] = useState(0)

  // ── Animation Step Tracking for Stepped Loader ──
  const [animStep, setAnimStep] = useState(0)

  // ── Active Plan Tab Index ──
  const [activeDayIdx, setActiveDayIdx] = useState(0)

  // ── ACADEMIC WIZARD FORM STATE (Phases 2 – 10) ──
  const [wizardStep, setWizardStep] = useState(1)

  // Step 1: Goal
  const [selectedGoalType, setSelectedGoalType] = useState('semester_exam')
  const [goalTitle, setGoalTitle] = useState('Semester Examination')
  const [userGoalText, setUserGoalText] = useState('')
  const [parsingNlp, setParsingNlp] = useState(false)

  // Step 2: Subjects & Topics
  const [selectedSubjects, setSelectedSubjects] = useState([])
  const [customSubjectInput, setCustomSubjectInput] = useState('')
  const [customTopicInput, setCustomTopicInput] = useState({})

  // Step 3: Duration & Dates
  const [durationPreset, setDurationPreset] = useState('14')
  const [startDateStr, setStartDateStr] = useState(() => new Date().toISOString().split('T')[0])
  const [deadlineStr, setDeadlineStr] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 14)
    return d.toISOString().split('T')[0]
  })

  // Step 4: Daily Availability
  const [availabilityMode, setAvailabilityMode] = useState('same')
  const [sameDailyHours, setSameDailyHours] = useState('2')
  const [customDailyHours, setCustomDailyHours] = useState({
    Monday: 2, Tuesday: 2, Wednesday: 2, Thursday: 2, Friday: 2, Saturday: 3, Sunday: 3
  })

  // Step 5: Time Slots
  const [selectedSlots, setSelectedSlots] = useState(['Evening', 'Night'])

  // Step 6: Priority & Difficulty per Subject
  const [subjectPriorities, setSubjectPriorities] = useState({})
  const [subjectDifficulties, setSubjectDifficulties] = useState({})

  // Step 7: Study Preferences / Style
  const [selectedPreferences, setSelectedPreferences] = useState(['Theory', 'Coding Practice', 'Revision'])

  // Step 8: Constraints
  const [selectedConstraints, setSelectedConstraints] = useState(['College hours (9 AM – 4 PM)', 'No late-night sessions'])
  const [customConstraintInput, setCustomConstraintInput] = useState('')

  // ── SPECIALIZED PLACEMENT PREPARATION STATE (Placement Workflow) ──
  const [placementStep, setPlacementStep] = useState(1) // 1: Input, 2: Research Profile, 3: Dates & Availability, 4: Skill Rating, 5: Review
  const [companyName, setCompanyName] = useState('')
  const [targetRole, setTargetRole] = useState('Software Engineer')
  const [hiringType, setHiringType] = useState('Campus Placement')
  const [researchingCompany, setResearchingCompany] = useState(false)
  const [researchDoc, setResearchDoc] = useState(null)
  const [placementDeadlineStr, setPlacementDeadlineStr] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 14)
    return d.toISOString().split('T')[0]
  })
  const [placementAvailabilityMode, setPlacementAvailabilityMode] = useState('same')
  const [samePlacementHours, setSamePlacementHours] = useState('2.5')
  const [customPlacementHours, setCustomPlacementHours] = useState({
    Monday: 2, Tuesday: 2, Wednesday: 2, Thursday: 2, Friday: 2, Saturday: 4, Sunday: 4
  })
  const [placementSlots, setPlacementSlots] = useState(['Evening', 'Night'])

  // Phase 10: Current Skill Profile Ratings
  const [skillProfile, setSkillProfile] = useState({
    Aptitude: 'Moderate',
    LogicalReasoning: 'Moderate',
    Coding: 'Moderate',
    DSA: 'Weak',
    DBMS: 'Weak',
    OOP: 'Moderate',
    ComputerNetworks: 'Moderate',
    OperatingSystems: 'Moderate',
    Projects: 'Strong',
    Communication: 'Moderate',
    TechnicalInterview: 'Moderate',
    HR: 'Strong'
  })

  // ── 1. Fetch Active Academic & Placement Plans on Mount ──
  const fetchActivePlans = async () => {
    setLoading(true)
    try {
      const [acadRes, placeRes] = await Promise.all([
        axiosInstance.get('/study-tools/planner/active'),
        axiosInstance.get('/study-tools/placement/active')
      ])

      if (placeRes.data?.success && placeRes.data.plan) {
        setActivePlacementPlan(placeRes.data.plan)
        setPlannerType('placement')
        setViewMode('dashboard')
      } else if (acadRes.data?.success && acadRes.data.plan) {
        setActivePlan(acadRes.data.plan)
        setPlannerType('academic')
        setViewMode('dashboard')
      } else {
        setActivePlan(null)
        setActivePlacementPlan(null)
        setViewMode('landing')
      }
    } catch (err) {
      console.warn('Fetch active plans failed:', err)
      setViewMode('landing')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivePlans()
  }, [])

  // ── Pre-populate Default Subjects & Skill Profile from Context ──
  useEffect(() => {
    if (studentContext || profile) {
      const rawActive = (studentContext?.subjects || profile?.subjects || []).concat(studentContext?.skills || profile?.skills || [])
      const cleanList = rawActive
        .filter(s => s && typeof s === 'string' && !s.toLowerCase().includes('full stack web') && !s.toLowerCase().startsWith('b.e.') && !s.toLowerCase().startsWith('b.tech'))

      const defaultSubs = cleanList.length > 0 ? cleanList.slice(0, 4) : [
        'Data Structures & Algorithms',
        'Database Management Systems',
        'Operating Systems',
        'Computer Networks'
      ]

      const formatted = defaultSubs.map(name => ({
        name,
        priority: 'High',
        difficulty: 'Moderate',
        topics: name.includes('Data Structures') ? ['Arrays & Lists', 'Trees & BST', 'Graphs']
          : name.includes('Database') ? ['SQL Joins', 'Normalization', 'Transactions']
          : ['Core Principles', 'Lab Practice']
      }))

      setSelectedSubjects(formatted)

      const prioMap = {}
      const diffMap = {}
      formatted.forEach(s => {
        prioMap[s.name] = s.priority
        diffMap[s.name] = s.difficulty
      })
      setSubjectPriorities(prioMap)
      setSubjectDifficulties(diffMap)

      // Diagnostic weak topics update skill profile
      const weakTopics = studentContext?.quizPerformance?.weakTopics || []
      if (weakTopics.length > 0) {
        setSkillProfile(prev => {
          const updated = { ...prev }
          weakTopics.forEach(wt => {
            const wLower = wt.toLowerCase()
            if (wLower.includes('dbms') || wLower.includes('database') || wLower.includes('sql')) updated.DBMS = 'Weak'
            if (wLower.includes('dsa') || wLower.includes('tree') || wLower.includes('graph')) updated.DSA = 'Weak'
            if (wLower.includes('coding') || wLower.includes('array')) updated.Coding = 'Weak'
            if (wLower.includes('aptitude') || wLower.includes('math')) updated.Aptitude = 'Weak'
          })
          return updated
        })
      }
    }
  }, [studentContext, profile])

  // ── Goal Types Catalog (Phase 2) ──
  const goalCatalog = [
    { type: 'placement', title: 'Placement Preparation', icon: '🎯', desc: 'Target company interview research, reported rounds, and round-wise prep pathway.' },
    { type: 'semester_exam', title: 'Semester Examination', icon: '📚', desc: 'Comprehensive coverage of course syllabus & past exam questions.' },
    { type: 'new_skill', title: 'Learn a New Skill', icon: '💻', desc: 'Master React, Node, Python, Cloud, or DevOps from scratch.' },
    { type: 'project', title: 'Complete a Project', icon: '🚀', desc: 'Structured roadmap to build capstone or mini project milestone.' },
    { type: 'internal_exam', title: 'Assignment / Internal Exam', icon: '📝', desc: 'Short sprint for upcoming mid-term tests and lab evaluations.' },
    { type: 'competitive_exam', title: 'Competitive Exam', icon: '🏆', desc: 'Intensive prep for GATE, GRE, CAT, or TANCET.' },
    { type: 'weak_subjects', title: 'Improve Weak Subjects', icon: '🧠', desc: 'Remedial revision focused on low diagnostic quiz scores.' },
    { type: 'custom', title: 'Custom Goal', icon: '✨', desc: 'Define your own personalized learning goal.' }
  ]

  const handleSelectGoalCard = (card) => {
    if (card.type === 'placement') {
      setPlannerType('placement')
      setPlacementStep(1)
      setViewMode('wizard')
    } else {
      setPlannerType('academic')
      setSelectedGoalType(card.type)
      setGoalTitle(card.title)

      // Dynamically load tailored subjects, topics, priorities & duration for each specific goal card
      let newSubjects = []
      let newDays = '14'
      let defaultGoalPrompt = ''

      if (card.type === 'new_skill') {
        newDays = '21'
        defaultGoalPrompt = 'Master React, Node, Python, and Cloud deployment from scratch in 21 days.'
        newSubjects = [
          { name: 'React.js & Frontend Architecture', priority: 'High', difficulty: 'Moderate', topics: ['Components & JSX', 'React Hooks & State', 'Tailwind & UI Styling'] },
          { name: 'Node.js & Express REST APIs', priority: 'High', difficulty: 'Moderate', topics: ['Express Routing', 'MongoDB & Mongoose Schema', 'JWT Authentication'] },
          { name: 'Python & Machine Learning Foundations', priority: 'Medium', difficulty: 'Difficult', topics: ['Pandas & Data Cleaning', 'Scikit-Learn Classifiers', 'Neural Nets Overview'] },
          { name: 'Cloud Deployment & DevOps Pipeline', priority: 'Medium', difficulty: 'Moderate', topics: ['Git & GitHub Workflows', 'Docker Containers', 'Vercel / Render Hosting'] }
        ]
      } else if (card.type === 'project') {
        newDays = '14'
        defaultGoalPrompt = 'Build and deploy a full-stack web application capstone project in 14 days.'
        newSubjects = [
          { name: 'System Architecture & Database Schema', priority: 'High', difficulty: 'Moderate', topics: ['Requirements & API Design', 'ER Diagram & Mongoose Schemas', 'Database Indexing'] },
          { name: 'Backend Services & Auth Middleware', priority: 'High', difficulty: 'Difficult', topics: ['REST Controller Routes', 'JWT Authentication', 'Input Validation'] },
          { name: 'Interactive Frontend & Component Wiring', priority: 'High', difficulty: 'Moderate', topics: ['Dashboard Pages', 'Form State & Axios', 'Responsive Layout'] },
          { name: 'Testing, Deployment & Documentation', priority: 'Medium', difficulty: 'Easy', topics: ['Unit & API Integration Tests', 'Vercel / Render Deployment', 'Project README & Demo Video'] }
        ]
      } else if (card.type === 'internal_exam') {
        newDays = '7'
        defaultGoalPrompt = 'Sprint prep for upcoming mid-term exams and lab evaluations in 7 days.'
        newSubjects = [
          { name: 'Unit 1 & 2 Core Fundamentals', priority: 'High', difficulty: 'Moderate', topics: ['Key Definitions & Concepts', 'Short Answer Q&A', 'Core Principles'] },
          { name: 'Unit 3 & 4 Problem Solving', priority: 'High', difficulty: 'Difficult', topics: ['Numerical Problems', 'Derivations & Proofs', 'Solved Exam Questions'] },
          { name: 'Lab Assessment & Code Viva Prep', priority: 'Medium', difficulty: 'Moderate', topics: ['Practical Programs', 'Code Tracing', 'Viva Voice Questions'] }
        ]
      } else if (card.type === 'competitive_exam') {
        newDays = '30'
        defaultGoalPrompt = 'Intensive GATE / GRE / CAT competitive exam prep pathway in 30 days.'
        newSubjects = [
          { name: 'Quantitative Aptitude & Logical Reasoning', priority: 'High', difficulty: 'Difficult', topics: ['Speed Math & Data Interpretation', 'Puzzles & Syllogisms', 'Permutations & Probability'] },
          { name: 'Computer Science Core Theory (GATE)', priority: 'High', difficulty: 'Very Difficult', topics: ['Discrete Mathematics', 'Theory of Computation', 'Compiler Design'] },
          { name: 'Advanced Algorithms & Data Structures', priority: 'High', difficulty: 'Difficult', topics: ['Asymptotic Analysis', 'Dynamic Programming', 'Graph Algorithms (Dijkstra/BFS)'] },
          { name: 'Computer Architecture & Operating Systems', priority: 'Medium', difficulty: 'Moderate', topics: ['Instruction Pipeline', 'Paging & Memory Virtualization', 'Process Concurrency'] }
        ]
      } else if (card.type === 'weak_subjects') {
        newDays = '10'
        defaultGoalPrompt = 'Targeted revision for weak diagnostic topics and low quiz scores.'
        const weakList = studentContext?.quizPerformance?.weakTopics || []
        newSubjects = [
          { name: 'Database Management Systems (Remedial Focus)', priority: 'High', difficulty: 'Difficult', topics: ['SQL Joins & Complex Subqueries', 'Normalization (3NF/BCNF)', 'Transactions & ACID'] },
          { name: 'Data Structures & Algorithms (Remedial Focus)', priority: 'High', difficulty: 'Difficult', topics: ['Recursion & Backtracking', 'Binary Search Trees', 'Graph Algorithms'] },
          { name: 'Operating Systems (Remedial Focus)', priority: 'Medium', difficulty: 'Moderate', topics: ['Deadlock Resolution', 'Paging & Virtual Memory', 'CPU Scheduling'] }
        ]
      } else if (card.type === 'custom') {
        newDays = '14'
        defaultGoalPrompt = 'Personalized self-paced learning plan.'
        newSubjects = [
          { name: 'Custom Module 1', priority: 'High', difficulty: 'Moderate', topics: ['Core Topic 1', 'Core Topic 2'] },
          { name: 'Custom Module 2', priority: 'Medium', difficulty: 'Moderate', topics: ['Core Topic 3', 'Core Topic 4'] }
        ]
      } else {
        // semester_exam default
        newDays = '14'
        defaultGoalPrompt = 'Comprehensive coverage of semester course syllabus and past exam questions.'
        const rawActive = (studentContext?.subjects || profile?.subjects || []).concat(studentContext?.skills || profile?.skills || [])
        const cleanList = rawActive.filter(s => s && typeof s === 'string' && !s.toLowerCase().includes('full stack web') && !s.toLowerCase().startsWith('b.e.') && !s.toLowerCase().startsWith('b.tech'))
        const defaultSubs = cleanList.length > 0 ? cleanList.slice(0, 4) : [
          'Data Structures & Algorithms',
          'Database Management Systems',
          'Operating Systems',
          'Computer Networks'
        ]
        newSubjects = defaultSubs.map(name => ({
          name,
          priority: 'High',
          difficulty: 'Moderate',
          topics: name.includes('Data Structures') ? ['Arrays & Lists', 'Trees & BST', 'Graphs']
            : name.includes('Database') ? ['SQL Joins', 'Normalization', 'Transactions']
            : ['Core Principles', 'Lab Practice']
        }))
      }

      setSelectedSubjects(newSubjects)

      const prioMap = {}
      const diffMap = {}
      newSubjects.forEach(s => {
        prioMap[s.name] = s.priority
        diffMap[s.name] = s.difficulty
      })
      setSubjectPriorities(prioMap)
      setSubjectDifficulties(diffMap)

      setDurationPreset(newDays)
      const start = new Date(startDateStr)
      const end = new Date(start)
      end.setDate(end.getDate() + parseInt(newDays))
      setDeadlineStr(end.toISOString().split('T')[0])

      if (!userGoalText.trim()) {
        setUserGoalText(defaultGoalPrompt)
      }
    }
  }

  // ── NLP Auto Extraction (Phase 2) ──
  const handleParseNlpGoal = async () => {
    if (!userGoalText.trim()) return
    setParsingNlp(true)
    try {
      const res = await axiosInstance.post('/study-tools/planner/parse-goal', { userText: userGoalText })
      if (res.data?.success && res.data.extracted) {
        const ext = res.data.extracted
        if (ext.goalType === 'placement') {
          setPlannerType('placement')
          setPlacementStep(1)
        } else {
          setSelectedGoalType(ext.goalType)
          setGoalTitle(ext.goal)
          if (ext.suggestedDays) {
            setDurationPreset(String(ext.suggestedDays))
            const d = new Date(startDateStr)
            d.setDate(d.getDate() + ext.suggestedDays)
            setDeadlineStr(d.toISOString().split('T')[0])
          }
          if (ext.suggestedSubjects?.length > 0) {
            setSelectedSubjects(ext.suggestedSubjects.map(s => ({
              name: s.name,
              priority: s.priority || 'High',
              difficulty: s.difficulty || 'Moderate',
              topics: []
            })))
          }
        }
      }
    } catch (err) {
      console.warn('NLP extraction error:', err)
    } finally {
      setParsingNlp(false)
    }
  }

  // ── Subject Management Helpers (Phase 3) ──
  const toggleSubjectSelect = (subName) => {
    if (selectedSubjects.some(s => s.name === subName)) {
      setSelectedSubjects(selectedSubjects.filter(s => s.name !== subName))
    } else {
      const newSub = { name: subName, priority: 'Medium', difficulty: 'Moderate', topics: [] }
      setSelectedSubjects([...selectedSubjects, newSub])
      setSubjectPriorities(prev => ({ ...prev, [subName]: 'Medium' }))
      setSubjectDifficulties(prev => ({ ...prev, [subName]: 'Moderate' }))
    }
  }

  const handleAddCustomSubject = () => {
    if (customSubjectInput.trim()) {
      const name = customSubjectInput.trim()
      toggleSubjectSelect(name)
      setCustomSubjectInput('')
    }
  }

  const handleAddTopicToSubject = (subName) => {
    const topicText = customTopicInput[subName]
    if (topicText && topicText.trim()) {
      setSelectedSubjects(selectedSubjects.map(s => {
        if (s.name === subName) {
          return { ...s, topics: [...(s.topics || []), topicText.trim()] }
        }
        return s
      }))
      setCustomTopicInput({ ...customTopicInput, [subName]: '' })
    }
  }

  // ── Duration & Date Calculator (Phase 4) ──
  const handleDurationPresetChange = (daysNum) => {
    setDurationPreset(String(daysNum))
    const start = new Date(startDateStr)
    const end = new Date(start)
    end.setDate(end.getDate() + parseInt(daysNum))
    setDeadlineStr(end.toISOString().split('T')[0])
  }

  const calculatedDays = Math.max(1, Math.ceil((new Date(deadlineStr) - new Date(startDateStr)) / (1000 * 60 * 60 * 24)))
  const calculatedPlacementDays = Math.max(1, Math.ceil((new Date(placementDeadlineStr) - new Date()) / (1000 * 60 * 60 * 24)))

  // ── Time Slot Toggles (Phase 6) ──
  const toggleSlot = (slot) => {
    if (selectedSlots.includes(slot)) {
      setSelectedSlots(selectedSlots.filter(s => s !== slot))
    } else {
      setSelectedSlots([...selectedSlots, slot])
    }
  }

  const togglePlacementSlot = (slot) => {
    if (placementSlots.includes(slot)) {
      setPlacementSlots(placementSlots.filter(s => s !== slot))
    } else {
      setPlacementSlots([...placementSlots, slot])
    }
  }

  // ── Preference & Constraint Toggles ──
  const togglePreference = (pref) => {
    if (selectedPreferences.includes(pref)) {
      setSelectedPreferences(selectedPreferences.filter(p => p !== pref))
    } else {
      setSelectedPreferences([...selectedPreferences, pref])
    }
  }

  const toggleConstraint = (c) => {
    if (selectedConstraints.includes(c)) {
      setSelectedConstraints(selectedConstraints.filter(item => item !== c))
    } else {
      setSelectedConstraints([...selectedConstraints, c])
    }
  }

  // ── PLACEMENT WORKFLOW: RESEARCH COMPANY (Phase 2 - 6) ──
  const handleResearchCompany = async (overrideCompany) => {
    const queryComp = overrideCompany || companyName
    if (!queryComp || !queryComp.trim()) return
    setResearchingCompany(true)
    setError('')
    try {
      const res = await axiosInstance.post('/study-tools/placement/research', {
        companyName: queryComp.trim(),
        targetRole,
        hiringType
      })
      if (res.data?.success && res.data.research) {
        setResearchDoc(res.data.research)
        setPlacementStep(2) // Move to Company Preparation Profile UI
      } else {
        setError('Could not complete company research. Please check details.')
      }
    } catch (err) {
      console.error('Company research error:', err)
      setError('Failed to reach company research service.')
    } finally {
      setResearchingCompany(false)
    }
  }

  // ── SUBMIT PLACEMENT PREPARATION PLAN (Phase 12) ──
  const handleGeneratePlacementPlanSubmit = async () => {
    setViewMode('animating')
    setAnimStep(1)

    const dailyMap = placementAvailabilityMode === 'same' ? {
      Monday: Number(samePlacementHours),
      Tuesday: Number(samePlacementHours),
      Wednesday: Number(samePlacementHours),
      Thursday: Number(samePlacementHours),
      Friday: Number(samePlacementHours),
      Saturday: Number(samePlacementHours),
      Sunday: Number(samePlacementHours)
    } : customPlacementHours

    const payload = {
      companyId: researchDoc?._id,
      companyName: researchDoc?.companyName || companyName,
      targetRole: researchDoc?.targetRole || targetRole,
      hiringType: researchDoc?.hiringType || hiringType,
      reportedRounds: researchDoc?.reportedRounds || [],
      skillProfile,
      startDate: new Date().toISOString().split('T')[0],
      deadline: placementDeadlineStr,
      durationDays: calculatedPlacementDays,
      dailyAvailability: dailyMap,
      timeSlots: placementSlots,
      learningPreferences: selectedPreferences
    }

    const timers = [
      setTimeout(() => setAnimStep(2), 300),
      setTimeout(() => setAnimStep(3), 650),
      setTimeout(() => setAnimStep(4), 1000),
      setTimeout(() => setAnimStep(5), 1350),
      setTimeout(() => setAnimStep(6), 1650),
      setTimeout(() => setAnimStep(7), 1900)
    ]

    try {
      const res = await axiosInstance.post('/study-tools/placement/create-plan', payload)
      setTimeout(() => {
        if (res.data?.success && res.data.plan) {
          setActivePlacementPlan(res.data.plan)
          setPlannerType('placement')
          setActiveDayIdx(0)
          setViewMode('dashboard')
        } else {
          setError('Failed to create placement plan.')
          setViewMode('landing')
        }
      }, 2100)
    } catch (err) {
      console.error('Placement plan creation error:', err)
      setTimeout(() => {
        setError('Error generating placement schedule.')
        setViewMode('landing')
      }, 2100)
    }
  }

  // ── SUBMIT ACADEMIC PLAN (Phase 12) ──
  const handleGeneratePlanSubmit = async () => {
    setViewMode('animating')
    setAnimStep(1)

    const dailyMap = availabilityMode === 'same' ? {
      Monday: Number(sameDailyHours),
      Tuesday: Number(sameDailyHours),
      Wednesday: Number(sameDailyHours),
      Thursday: Number(sameDailyHours),
      Friday: Number(sameDailyHours),
      Saturday: Number(sameDailyHours),
      Sunday: Number(sameDailyHours)
    } : customDailyHours

    const finalSubjects = selectedSubjects.map(s => ({
      name: s.name,
      priority: subjectPriorities[s.name] || 'Medium',
      difficulty: subjectDifficulties[s.name] || 'Moderate',
      topics: s.topics || []
    }))

    const payload = {
      goal: goalTitle,
      goalType: selectedGoalType,
      goalDescription: userGoalText,
      subjects: finalSubjects,
      startDate: startDateStr,
      deadline: deadlineStr,
      durationDays: calculatedDays,
      dailyAvailability: dailyMap,
      timeSlots: selectedSlots,
      learningPreferences: selectedPreferences,
      constraints: selectedConstraints
    }

    const timers = [
      setTimeout(() => setAnimStep(2), 300),
      setTimeout(() => setAnimStep(3), 650),
      setTimeout(() => setAnimStep(4), 1000),
      setTimeout(() => setAnimStep(5), 1350),
      setTimeout(() => setAnimStep(6), 1650),
      setTimeout(() => setAnimStep(7), 1900)
    ]

    try {
      const res = await axiosInstance.post('/study-tools/planner/create', payload)
      setTimeout(() => {
        if (res.data?.success && res.data.plan) {
          setActivePlan(res.data.plan)
          setPlannerType('academic')
          setActiveDayIdx(0)
          setViewMode('dashboard')
        } else {
          setError(res.data?.message || 'Failed to generate plan.')
          setViewMode('landing')
        }
      }, 2100)
    } catch (err) {
      console.error('Plan creation error:', err)
      setTimeout(() => {
        setError('Error creating plan.')
        setViewMode('landing')
      }, 2100)
    }
  }

  // ── ACTIVE TASK ACTIONS ──
  const handleCompleteTask = async (taskId) => {
    try {
      const endpoint = plannerType === 'placement' ? '/study-tools/placement/complete-task' : '/study-tools/planner/complete-task'
      const res = await axiosInstance.post(endpoint, { taskId })
      if (res.data?.success) {
        if (res.data.xpGained > 0) setXpEarned(prev => prev + res.data.xpGained)
        fetchActivePlans()
      }
    } catch (err) {
      console.error('Complete task error:', err)
    }
  }

  const handleRescheduleTask = async (taskId) => {
    const newSlot = prompt('Enter new rescheduled time slot (e.g. 8:30 PM - 9:30 PM):')
    if (newSlot) {
      try {
        await axiosInstance.post('/study-tools/planner/reschedule-task', { taskId, newTimeSlot: newSlot })
        fetchActivePlans()
      } catch (err) {
        console.error('Reschedule task error:', err)
      }
    }
  }

  const handleSkipTask = async (taskId) => {
    try {
      await axiosInstance.post('/study-tools/planner/skip-task', { taskId })
      fetchActivePlans()
    } catch (err) {
      console.error('Skip task error:', err)
    }
  }

  const handleEditTaskTopic = async (taskObj) => {
    const newTopic = prompt('Edit Task Topic:', taskObj.topic)
    if (newTopic) {
      try {
        await axiosInstance.post('/study-tools/planner/edit-task', { taskId: taskObj.id, newTopic })
        fetchActivePlans()
      } catch (err) {
        console.error('Edit topic error:', err)
      }
    }
  }

  const handleResetPlan = async () => {
    if (window.confirm(`Are you sure you want to clear your active ${plannerType} study plan?`)) {
      try {
        const endpoint = plannerType === 'placement' ? '/study-tools/placement/active' : '/study-tools/planner/active'
        await axiosInstance.delete(endpoint)
        if (plannerType === 'placement') setActivePlacementPlan(null)
        else setActivePlan(null)
        setWizardStep(1)
        setPlacementStep(1)
        setViewMode('landing')
      } catch (err) {
        console.error('Reset plan error:', err)
      }
    }
  }

  // ── RENDER PHASE 1: LANDING SCREEN ──
  if (viewMode === 'landing') {
    return (
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '10px 0' }} className="s-anim-up">
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ede9fe', color: '#6d28d9', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            <FiZap size={15} /> AI Study Plan & Placement Preparation Engine
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
            Personalized Academic & Placement Study Planner
          </h1>
          <p style={{ fontSize: 15, color: 'var(--s-text3)', margin: '8px auto 0', maxWidth: 640 }}>
            Craft personalized semester exam study schedules or target real-world company placement preparation pathways built around your exact availability.
          </p>
        </div>

        {/* ACTIVE PLAN DETECTED BANNER */}
        {activePlacementPlan ? (
          <SCard style={{ padding: 32, borderRadius: 24, marginBottom: 32, background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', color: '#fff', border: '1px solid #312e81' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
              <div>
                <span style={{ background: '#818cf8', color: '#0f172a', padding: '4px 12px', borderRadius: 12, fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>
                  🎯 Active Placement Plan Saved
                </span>
                <h2 style={{ fontSize: 24, fontWeight: 900, margin: '10px 0 6px', color: '#fff' }}>
                  {activePlacementPlan.companyName} — {activePlacementPlan.targetRole}
                </h2>
                <p style={{ fontSize: 14, color: '#c7d2fe', margin: 0, maxWidth: 600 }}>
                  Hiring: <strong>{activePlacementPlan.hiringType}</strong> • {activePlacementPlan.durationDays} Days ({activePlacementPlan.totalAvailableHours} Total Hours)
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <SBtn variant="primary" onClick={() => { setPlannerType('placement'); setViewMode('dashboard') }} style={{ padding: '12px 24px', borderRadius: 14, fontSize: 14 }}>
                  <FiPlay size={16} style={{ marginRight: 6 }} /> Continue Placement Plan
                </SBtn>
                <button
                  type="button"
                  onClick={() => { setPlannerType('placement'); setPlacementStep(1); setViewMode('wizard') }}
                  style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 20px', borderRadius: 14, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}
                >
                  <FiPlus size={16} style={{ marginRight: 6 }} /> Target Another Company
                </button>
              </div>
            </div>
          </SCard>
        ) : activePlan ? (
          <SCard style={{ padding: 32, borderRadius: 24, marginBottom: 32, background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#fff', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
              <div>
                <span style={{ background: '#38bdf8', color: '#0f172a', padding: '4px 12px', borderRadius: 12, fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>
                  📚 Active Academic Plan Saved
                </span>
                <h2 style={{ fontSize: 24, fontWeight: 900, margin: '10px 0 6px', color: '#fff' }}>
                  {activePlan.title}
                </h2>
                <p style={{ fontSize: 14, color: '#94a3b8', margin: 0, maxWidth: 600 }}>
                  Goal: <strong>{activePlan.goal}</strong> • {activePlan.durationDays} Days ({activePlan.totalAvailableHours} Total Hours)
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <SBtn variant="primary" onClick={() => { setPlannerType('academic'); setViewMode('dashboard') }} style={{ padding: '12px 24px', borderRadius: 14, fontSize: 14 }}>
                  <FiPlay size={16} style={{ marginRight: 6 }} /> Continue Academic Plan
                </SBtn>
                <button
                  type="button"
                  onClick={() => { setPlannerType('academic'); setWizardStep(1); setViewMode('wizard') }}
                  style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 20px', borderRadius: 14, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}
                >
                  <FiPlus size={16} style={{ marginRight: 6 }} /> Create New Plan
                </button>
              </div>
            </div>
          </SCard>
        ) : null}

        {/* HERO CHOICES: ACADEMIC VS PLACEMENT */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {/* PLACEMENT CARD */}
          <SCard style={{ padding: 36, borderRadius: 28, background: '#fff', border: '2px solid #818cf8', boxShadow: '0 12px 30px rgba(99,102,241,0.08)' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🎯</div>
            <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 12px', borderRadius: 12, fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>
              Specialized Workflow
            </span>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--s-text)', margin: '10px 0 8px' }}>
              Placement Preparation
            </h2>
            <p style={{ fontSize: 14, color: 'var(--s-text2)', margin: '0 0 24px', lineHeight: 1.6 }}>
              Research target company hiring processes (*TCS, Infosys, Amazon, Zoho...*), discover reported selection rounds & subtopics, and generate a round-wise preparation schedule.
            </p>
            <SBtn
              variant="primary"
              onClick={() => { setPlannerType('placement'); setPlacementStep(1); setViewMode('wizard') }}
              style={{ width: '100%', padding: '12px 24px', borderRadius: 14, fontSize: 15, fontWeight: 900 }}
            >
              <FiBriefcase size={17} style={{ marginRight: 8 }} /> Target Company Placement Plan
            </SBtn>
          </SCard>

          {/* ACADEMIC CARD */}
          <SCard style={{ padding: 36, borderRadius: 28, background: '#fff', border: '1px solid var(--s-border)' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>📚</div>
            <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: 12, fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>
              General Academic
            </span>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--s-text)', margin: '10px 0 8px' }}>
              Academic Study Plan
            </h2>
            <p style={{ fontSize: 14, color: 'var(--s-text2)', margin: '0 0 24px', lineHeight: 1.6 }}>
              Build a personalized study routine around semester exams, project milestones, or weak subjects based on your weekly availability.
            </p>
            <button
              type="button"
              onClick={() => { setPlannerType('academic'); setWizardStep(1); setViewMode('wizard') }}
              style={{ width: '100%', background: 'var(--s-surface2)', border: '1px solid var(--s-border)', color: 'var(--s-text)', padding: '12px 24px', borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: 'pointer' }}
            >
              <FiBookOpen size={17} style={{ marginRight: 8 }} /> Academic Study Plan
            </button>
          </SCard>
        </div>
      </div>
    )
  }

  // ── RENDER PHASE 18: ANIMATED STEPPED GENERATION ──
  if (viewMode === 'animating') {
    const stepsList = plannerType === 'placement' ? [
      { step: 1, label: `ANALYZING TARGET COMPANY (${researchDoc?.companyName || companyName || 'Target Company'})` },
      { step: 2, label: 'EXTRACTING REPORTED SELECTION ROUNDS' },
      { step: 3, label: 'EVALUATING STUDENT SKILL PROFILE & WEAKNESSES' },
      { step: 4, label: 'ALLOCATING DAILY HOURS & ROUND TIME SLOTS' },
      { step: 5, label: 'BUILDING ROUND-WISE PREPARATION PATHWAY' },
      { step: 6, label: 'OPTIMIZING REVISION & MOCK TESTS' },
      { step: 7, label: 'YOUR PLACEMENT PLAN IS READY!' }
    ] : [
      { step: 1, label: 'ANALYZING YOUR GOAL' },
      { step: 2, label: 'CALCULATING AVAILABLE TIME' },
      { step: 3, label: 'ANALYZING SUBJECT PRIORITIES' },
      { step: 4, label: 'ALLOCATING STUDY HOURS' },
      { step: 5, label: 'BUILDING REVISION CYCLES' },
      { step: 6, label: 'OPTIMIZING YOUR SCHEDULE' },
      { step: 7, label: 'YOUR PLAN IS READY!' }
    ]

    return (
      <div style={{ maxWidth: 650, margin: '60px auto', textAlign: 'center' }} className="s-anim-up">
        <SCard style={{ padding: 40, borderRadius: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✨</div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 24px' }}>
            {plannerType === 'placement' ? 'Generating Company Placement Plan' : 'Building Your Personalized Study Plan'}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left', maxWidth: 460, margin: '0 auto 28px' }}>
            {stepsList.map(s => {
              const isDone = animStep >= s.step
              return (
                <div key={s.step} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderRadius: 14, background: isDone ? '#ecfdf5' : '#f8fafc', border: isDone ? '1px solid #a7f3d0' : '1px solid #e2e8f0', transition: 'all 0.3s ease' }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: isDone ? '#047857' : '#64748b' }}>
                    {s.label}
                  </span>
                  {isDone ? (
                    <FiCheckCircle color="#059669" size={18} />
                  ) : (
                    <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #cbd5e1', borderTopColor: 'var(--s-primary)', animation: 'spin 1s linear infinite' }} />
                  )}
                </div>
              )
            })}
          </div>
        </SCard>
      </div>
    )
  }

  // ── RENDER PHASE 19 & 23: GENERATED ACTIVE PLAN DASHBOARD (ACADEMIC OR PLACEMENT) ──
  if (viewMode === 'dashboard') {
    const curPlan = plannerType === 'placement' ? activePlacementPlan : activePlan

    if (curPlan) {
      let totalTasks = 0
      let completedCount = 0
      curPlan.schedule?.forEach(day => {
        day.tasks?.forEach(t => {
          totalTasks += 1
          if (t.status === 'completed') completedCount += 1
        })
      })
      const percent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0

      return (
        <div style={{ maxWidth: 1080, margin: '0 auto' }} className="s-anim-up">
          {/* HEADER BAR */}
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: plannerType === 'placement' ? '#e0e7ff' : '#dbeafe', color: plannerType === 'placement' ? '#4338ca' : '#1e40af', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>
                <FiTarget size={14} /> {plannerType === 'placement' ? `Company Placement: ${curPlan.companyName}` : `Active Goal: ${curPlan.goal}`}
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
                {plannerType === 'placement' ? `🚀 ${curPlan.companyName} — ${curPlan.targetRole} Preparation` : '🎯 YOUR PERSONALIZED STUDY PLAN'}
              </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {xpEarned > 0 && (
                <div style={{ background: '#d1fae5', color: '#047857', padding: '6px 14px', borderRadius: 14, fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FiAward size={16} /> +{xpEarned} XP Today
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  if (plannerType === 'placement') { setPlacementStep(1); setViewMode('wizard') }
                  else { setWizardStep(1); setViewMode('wizard') }
                }}
                style={{ background: 'var(--s-primary)', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <FiPlus size={15} /> {plannerType === 'placement' ? 'Target Another Company' : 'Create New Plan'}
              </button>
              <button
                type="button"
                onClick={handleResetPlan}
                title="Clear Active Plan"
                style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '9px 14px', borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <FiTrash2 size={15} /> Reset
              </button>
            </div>
          </div>

          {/* OVERVIEW SUMMARY CARD */}
          <div style={{
            background: plannerType === 'placement' ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#fff', padding: '24px 30px', borderRadius: 22, marginBottom: 28,
            boxShadow: '0 10px 25px rgba(0,0,0,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20
          }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
                {plannerType === 'placement' ? 'Company Preparation Telemetry & Reported Rounds' : 'Study Plan Telemetry & Targets'}
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 900, margin: '4px 0 8px', color: '#fff' }}>
                {plannerType === 'placement' ? `${curPlan.companyName} (${curPlan.targetRole}) Preparation Schedule` : curPlan.title}
              </h2>
              <p style={{ fontSize: 14, color: '#94a3b8', margin: 0, maxWidth: 620, lineHeight: 1.5 }}>
                {curPlan.overview || `Targeting ${curPlan.companyName} (${curPlan.hiringType}) across ${curPlan.durationDays} Days (${curPlan.totalAvailableHours} Total Hours).`}
              </p>

              {/* REPORTED SELECTION ROUND CHIPS FOR PLACEMENT */}
              {plannerType === 'placement' && curPlan.reportedRounds?.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                  {curPlan.reportedRounds.map((r, rIdx) => (
                    <span key={rIdx} style={{ background: 'rgba(255,255,255,0.15)', color: '#c7d2fe', padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 800 }}>
                      Round {rIdx + 1}: {r.roundName}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div style={{ width: 220 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 800, color: '#38bdf8', marginBottom: 6 }}>
                <span>Completion Rate</span>
                <span>{percent}%</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.15)', height: 10, borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: `${percent}%`, height: '100%', background: '#34d399', transition: 'width 0.5s ease' }} />
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6, textAlign: 'right', fontWeight: 700 }}>
                {completedCount} of {totalTasks} Sessions Done
              </div>
            </div>
          </div>

          {/* DAY TABS */}
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6, marginBottom: 20 }}>
            {curPlan.schedule?.map((dayObj, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveDayIdx(idx)}
                style={{
                  padding: '10px 20px', borderRadius: 16, fontSize: 13, fontWeight: 800,
                  border: activeDayIdx === idx ? '2px solid var(--s-primary)' : '1px solid var(--s-border)',
                  background: activeDayIdx === idx ? 'var(--s-primary)' : '#fff',
                  color: activeDayIdx === idx ? '#fff' : 'var(--s-text2)',
                  cursor: 'pointer', transition: 'all 0.2s ease', whiteSpace: 'nowrap'
                }}
              >
                {dayObj.day} ({dayObj.tasks?.length || 0} Sessions)
              </button>
            ))}
          </div>

          {/* DAY TIME-SLOTTED TASKS */}
          {curPlan.schedule?.[activeDayIdx] && (
            <SCard style={{ padding: 28, borderRadius: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
                    📅 {curPlan.schedule[activeDayIdx].day} Schedule ({curPlan.schedule[activeDayIdx].date})
                  </h3>
                  <span style={{ fontSize: 13, color: 'var(--s-text3)', fontWeight: 600 }}>
                    Target Allocation: {curPlan.schedule[activeDayIdx].dailyTargetHours}
                  </span>
                </div>
                <SBadge color="blue">{curPlan.schedule[activeDayIdx].tasks?.length} Time Slots</SBadge>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {curPlan.schedule[activeDayIdx].tasks?.map((task) => {
                  const isDone = task.status === 'completed'
                  const isSkipped = task.status === 'skipped'

                  return (
                    <div
                      key={task.id}
                      style={{
                        padding: '18px 22px', borderRadius: 16,
                        background: isDone ? '#ecfdf5' : isSkipped ? '#f1f5f9' : '#fff',
                        border: isDone ? '1px solid #a7f3d0' : isSkipped ? '1px solid #cbd5e1' : '1px solid var(--s-border)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1, minWidth: 260 }}>
                        <div style={{
                          padding: '6px 12px', borderRadius: 12, fontSize: 12, fontWeight: 900,
                          background: task.priority === 'HIGH' ? '#fef3c7' : '#e0f2fe',
                          color: task.priority === 'HIGH' ? '#b45309' : '#0369a1',
                          whiteSpace: 'nowrap'
                        }}>
                          ⏰ {task.timeSlot}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 15, fontWeight: 900, color: isDone ? '#047857' : 'var(--s-text)', textDecoration: isDone ? 'line-through' : 'none' }}>
                              {task.roundType || task.subject}
                            </span>
                            <span style={{
                              fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 8,
                              background: '#dbeafe', color: '#1e40af'
                            }}>
                              {task.subject}
                            </span>
                          </div>

                          <div style={{ fontSize: 13, color: isDone ? '#065f46' : 'var(--s-text2)', fontWeight: 600 }}>
                            {task.topic}
                          </div>
                        </div>
                      </div>

                      {/* TASK ACTION BUTTONS */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => handleCompleteTask(task.id)}
                          style={{
                            background: isDone ? '#047857' : '#fff',
                            color: isDone ? '#fff' : '#047857',
                            border: '1px solid #047857', padding: '6px 14px', borderRadius: 10,
                            fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                          }}
                        >
                          {isDone ? <><FiCheck size={14} /> Completed</> : 'Mark Complete'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRescheduleTask(task.id)}
                          title="Reschedule Time Slot"
                          style={{
                            background: 'var(--s-surface2)', border: '1px solid var(--s-border)',
                            color: 'var(--s-text2)', padding: '6px 10px', borderRadius: 10,
                            fontSize: 12, fontWeight: 700, cursor: 'pointer'
                          }}
                        >
                          <FiRepeat size={14} /> Reschedule
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEditTaskTopic(task)}
                          title="Edit Topic"
                          style={{
                            background: 'var(--s-surface2)', border: '1px solid var(--s-border)',
                            color: 'var(--s-text2)', padding: '6px 10px', borderRadius: 10,
                            fontSize: 12, fontWeight: 700, cursor: 'pointer'
                          }}
                        >
                          <FiEdit2 size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSkipTask(task.id)}
                          title="Skip Task"
                          style={{
                            background: isSkipped ? '#f1f5f9' : '#fff', border: '1px solid var(--s-border)',
                            color: isSkipped ? '#64748b' : 'var(--s-text3)', padding: '6px 10px', borderRadius: 10,
                            fontSize: 12, fontWeight: 700, cursor: 'pointer'
                          }}
                        >
                          <FiSkipForward size={14} /> {isSkipped ? 'Skipped' : 'Skip'}
                        </button>
                      </div>

                    </div>
                  )
                })}
              </div>
            </SCard>
          )}
        </div>
      )
    }
  }

  // ── SPECIALIZED PLACEMENT PREPARATION WIZARD (Phases 1 – 11) ──
  if (plannerType === 'placement') {
    return (
      <div style={{ maxWidth: 960, margin: '0 auto' }} className="s-anim-up">
        {/* WIZARD HEADER & PROGRESS BAR */}
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🎯 PLACEMENT PREPARATION WORKFLOW • STEP {placementStep} OF 4
            </span>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--s-text)', margin: '2px 0 0' }}>
              {placementStep === 1 && 'Phase 1: Company Identification & Target Role'}
              {placementStep === 2 && 'Phase 6: Company Preparation Profile & Reported Selection Process'}
              {placementStep === 3 && 'Phases 8 & 9: Preparation Window & Daily Availability'}
              {placementStep === 4 && 'Phase 10: Current Skill Profile Rating'}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setViewMode('landing')}
            style={{ background: 'none', border: 'none', color: 'var(--s-text3)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            ✕ Exit
          </button>
        </div>

        <div style={{ background: '#e0e7ff', height: 6, borderRadius: 99, marginBottom: 28, overflow: 'hidden' }}>
          <div style={{ width: `${(placementStep / 4) * 100}%`, height: '100%', background: '#4338ca', transition: 'width 0.3s ease' }} />
        </div>

        <SCard style={{ padding: 32, borderRadius: 24 }}>

          {/* ── PLACEMENT STEP 1: COMPANY INPUT (Phase 1) ── */}
          {placementStep === 1 && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 8px' }}>
                🎯 PLACEMENT PREPARATION
              </h3>
              <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '0 0 24px' }}>
                Let’s build your preparation plan around the company you are targeting.
              </p>

              {/* Company Name Field */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-text)', display: 'block', marginBottom: 6 }}>
                  Target Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. TCS, Infosys, Amazon, Accenture, Zoho, Cognizant..."
                  style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid var(--s-border)', fontSize: 14 }}
                />

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                  <span style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>Popular Companies:</span>
                  {['TCS', 'Infosys', 'Accenture', 'Hexaware', 'Cognizant', 'Amazon', 'Comcast', 'Zoho'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setCompanyName(c)
                        handleResearchCompany(c)
                      }}
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '3px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Role Field */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-text)', display: 'block', marginBottom: 6 }}>
                  Target Role
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={e => setTargetRole(e.target.value)}
                  placeholder="e.g. Software Engineer, Graduate Engineer Trainee..."
                  style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid var(--s-border)', fontSize: 14 }}
                />

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                  {['Software Engineer', 'Graduate Engineer Trainee', 'Developer', 'Data Analyst', 'QA Engineer', 'AI/ML Engineer'].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setTargetRole(r)}
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '3px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hiring Type */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-text)', display: 'block', marginBottom: 8 }}>
                  Hiring Type:
                </label>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {['Campus Placement', 'Off Campus', 'Internship', 'Not Sure'].map(ht => (
                    <label
                      key={ht}
                      style={{
                        padding: '10px 18px', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 800,
                        border: hiringType === ht ? '2px solid #4338ca' : '1px solid var(--s-border)',
                        background: hiringType === ht ? '#e0e7ff' : '#fff',
                        color: hiringType === ht ? '#4338ca' : 'var(--s-text)'
                      }}
                    >
                      <input
                        type="radio"
                        name="hiringType"
                        checked={hiringType === ht}
                        onChange={() => setHiringType(ht)}
                        style={{ marginRight: 6 }}
                      />
                      {ht}
                    </label>
                  ))}
                </div>
              </div>

              <SBtn
                variant="primary"
                onClick={() => handleResearchCompany()}
                disabled={researchingCompany || !companyName.trim()}
                style={{ padding: '12px 30px', borderRadius: 14, fontSize: 15, fontWeight: 900 }}
              >
                <FiSearch size={16} style={{ marginRight: 8 }} /> {researchingCompany ? 'Researching Public Reports...' : '🔍 Research Company'}
              </SBtn>
            </div>
          )}

          {/* ── PLACEMENT STEP 2: COMPANY PREPARATION PROFILE & SOURCES (Phase 6) ── */}
          {placementStep === 2 && researchDoc && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <span style={{ background: '#d1fae5', color: '#047857', padding: '4px 12px', borderRadius: 12, fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>
                  🔎 Research Completed
                </span>
                <h3 style={{ fontSize: 22, fontWeight: 900, color: 'var(--s-text)', margin: '8px 0 4px' }}>
                  🏢 COMPANY PREPARATION PROFILE: {researchDoc.companyName}
                </h3>
                <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: 0 }}>
                  Role: <strong>{researchDoc.targetRole}</strong> • Hiring: <strong>{researchDoc.hiringType}</strong>
                </p>
              </div>

              {/* REPORTED SELECTION PROCESS TIMELINE */}
              <div style={{ background: '#f8fafc', padding: 24, borderRadius: 20, border: '1px solid #e2e8f0', marginBottom: 24 }}>
                <h4 style={{ fontSize: 15, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 16px' }}>
                  Reported Selection Process ({researchDoc.reportedRounds?.length} Rounds)
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {researchDoc.reportedRounds?.map((round, idx) => (
                    <div key={idx} style={{ background: '#fff', padding: 16, borderRadius: 16, border: '1px solid var(--s-border)', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 15, fontWeight: 900, color: '#4338ca' }}>
                          {idx + 1}. {round.roundName}
                        </span>
                        <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: 8, fontSize: 11, fontWeight: 800 }}>
                          {round.normalizedCategory}
                        </span>
                      </div>

                      <div style={{ fontSize: 13, color: 'var(--s-text2)', marginBottom: 8, lineHeight: 1.4 }}>
                        {round.candidateDetails}
                      </div>

                      {/* TOPICS CHIPS */}
                      {round.topics?.length > 0 && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b' }}>Reported Topics:</span>
                          {round.topics.map((topic, tIdx) => (
                            <span key={tIdx} style={{ background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                              • {topic}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* CONFLICT VARIATIONS NOTIFICATION (Phase 5) */}
              {researchDoc.conflicts?.hasVariations && (
                <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', padding: 16, borderRadius: 16, marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: '#92400e', marginBottom: 4 }}>
                    ⚠️ Reported processes vary across candidate reports
                  </div>
                  <div style={{ fontSize: 13, color: '#78350f', lineHeight: 1.5 }}>
                    {researchDoc.conflicts.note}
                  </div>
                </div>
              )}

              {/* EVIDENCE & SOURCES TRANSPARENCY (Phase 16) */}
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: 14, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 10px' }}>
                  🌐 Evidence & Public Experience Sources ({researchDoc.sources?.length})
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
                  {researchDoc.sources?.map((src, sIdx) => (
                    <div key={sIdx} style={{ background: '#fff', border: '1px solid var(--s-border)', padding: 12, borderRadius: 14 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-text)', marginBottom: 2 }}>{src.title}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Source: {src.website} ({src.date})</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DISCLAIMER */}
              <p style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic', marginBottom: 24 }}>
                * Reported interview process. Process may vary by role, hiring batch, location, and recruitment channel.
              </p>

              {/* CONFIRMATION ACTIONS (Phase 7) */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <SBtn variant="primary" onClick={() => setPlacementStep(3)} style={{ padding: '12px 26px', borderRadius: 14, fontSize: 14 }}>
                  <FiCheck size={16} style={{ marginRight: 6 }} /> Yes, create my preparation plan
                </SBtn>
                <button
                  type="button"
                  onClick={() => handleResearchCompany(companyName)}
                  style={{ background: 'var(--s-surface2)', border: '1px solid var(--s-border)', padding: '12px 20px', borderRadius: 14, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
                >
                  <FiRefreshCw size={14} style={{ marginRight: 6 }} /> Research again
                </button>
                <button
                  type="button"
                  onClick={() => setPlacementStep(1)}
                  style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  ✏️ Edit company / role
                </button>
              </div>
            </div>
          )}

          {/* ── PLACEMENT STEP 3: DATES & AVAILABILITY (Phases 8 & 9) ── */}
          {placementStep === 3 && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 8px' }}>
                Preparation Window & Daily Availability
              </h3>
              <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '0 0 20px' }}>
                Specify your expected assessment date and study availability.
              </p>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-text)', display: 'block', marginBottom: 6 }}>
                  When is your expected assessment / interview?
                </label>
                <input
                  type="date"
                  value={placementDeadlineStr}
                  onChange={e => setPlacementDeadlineStr(e.target.value)}
                  style={{ width: '100%', maxWidth: 300, padding: '10px 14px', borderRadius: 12, border: '1px solid var(--s-border)', fontSize: 14 }}
                />

                <div style={{ marginTop: 10, background: '#e0e7ff', color: '#4338ca', padding: '10px 16px', borderRadius: 12, fontSize: 13, fontWeight: 800, display: 'inline-block' }}>
                  Days Remaining to Prepare: <strong>{calculatedPlacementDays} Days</strong>
                </div>
              </div>

              {/* AVAILABILITY MODE */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-text)', display: 'block', marginBottom: 8 }}>
                  How much time can you realistically study?
                </label>

                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <button
                    type="button"
                    onClick={() => setPlacementAvailabilityMode('same')}
                    style={{
                      flex: 1, padding: 12, borderRadius: 14, fontSize: 13, fontWeight: 800,
                      border: placementAvailabilityMode === 'same' ? '2px solid #4338ca' : '1px solid var(--s-border)',
                      background: placementAvailabilityMode === 'same' ? '#e0e7ff' : '#fff',
                      color: placementAvailabilityMode === 'same' ? '#4338ca' : 'var(--s-text2)',
                      cursor: 'pointer'
                    }}
                  >
                    Same time every day
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlacementAvailabilityMode('custom')}
                    style={{
                      flex: 1, padding: 12, borderRadius: 14, fontSize: 13, fontWeight: 800,
                      border: placementAvailabilityMode === 'custom' ? '2px solid #4338ca' : '1px solid var(--s-border)',
                      background: placementAvailabilityMode === 'custom' ? '#e0e7ff' : '#fff',
                      color: placementAvailabilityMode === 'custom' ? '#4338ca' : 'var(--s-text2)',
                      cursor: 'pointer'
                    }}
                  >
                    Customize each day
                  </button>
                </div>

                {placementAvailabilityMode === 'same' ? (
                  <div style={{ background: '#f8fafc', padding: 18, borderRadius: 16, border: '1px solid #e2e8f0' }}>
                    <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-text)', display: 'block', marginBottom: 6 }}>
                      Daily Target Hours: <strong>{samePlacementHours} Hours / Day</strong>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="8"
                      step="0.5"
                      value={samePlacementHours}
                      onChange={e => setSamePlacementHours(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <div key={day} style={{ background: '#f8fafc', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text)', marginBottom: 4 }}>{day}</div>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.5"
                          value={customPlacementHours[day]}
                          onChange={e => setCustomPlacementHours({ ...customPlacementHours, [day]: parseFloat(e.target.value) || 0 })}
                          style={{ width: '100%', padding: '4px 8px', borderRadius: 8, border: '1px solid var(--s-border)', fontSize: 13, fontWeight: 800 }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* TIME SLOTS */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-text)', display: 'block', marginBottom: 8 }}>
                  Preferred Time Slots:
                </label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {['Morning', 'Afternoon', 'Evening', 'Night'].map(slot => {
                    const isSel = placementSlots.includes(slot)
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => togglePlacementSlot(slot)}
                        style={{
                          padding: '8px 18px', borderRadius: 12, fontSize: 13, fontWeight: 800,
                          border: isSel ? '2px solid #4338ca' : '1px solid var(--s-border)',
                          background: isSel ? '#4338ca' : '#fff',
                          color: isSel ? '#fff' : 'var(--s-text2)',
                          cursor: 'pointer'
                        }}
                      >
                        {slot}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
                <button
                  type="button"
                  onClick={() => setPlacementStep(2)}
                  style={{ background: 'var(--s-surface2)', border: '1px solid var(--s-border)', padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
                >
                  <FiArrowLeft style={{ marginRight: 6 }} /> Back
                </button>
                <SBtn variant="primary" onClick={() => setPlacementStep(4)} style={{ padding: '10px 24px', borderRadius: 12, fontSize: 14 }}>
                  Next Phase <FiArrowRight style={{ marginLeft: 6 }} />
                </SBtn>
              </div>
            </div>
          )}

          {/* ── PLACEMENT STEP 4: CURRENT SKILL PROFILE RATING (Phase 10) ── */}
          {placementStep === 4 && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 8px' }}>
                Phase 10: Current Skill Profile Assessment
              </h3>
              <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '0 0 20px' }}>
                Rate your current confidence level in key placement topics. High priority will be assigned to weak areas.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 28 }}>
                {[
                  'Aptitude', 'LogicalReasoning', 'Coding', 'DSA',
                  'DBMS', 'OOP', 'ComputerNetworks', 'OperatingSystems',
                  'Projects', 'Communication', 'TechnicalInterview', 'HR'
                ].map(skillKey => (
                  <div key={skillKey} style={{ background: '#f8fafc', padding: 14, borderRadius: 14, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--s-text)', marginBottom: 8 }}>
                      {skillKey.replace(/([A-Z])/g, ' $1').trim()}
                    </div>

                    <div style={{ display: 'flex', gap: 4 }}>
                      {['Strong', 'Moderate', 'Weak', 'Not Sure'].map(val => {
                        const isSel = skillProfile[skillKey] === val
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setSkillProfile({ ...skillProfile, [skillKey]: val })}
                            style={{
                              flex: 1, padding: '4px 0', borderRadius: 6, fontSize: 10, fontWeight: 800,
                              border: isSel ? '2px solid #4338ca' : '1px solid var(--s-border)',
                              background: isSel ? '#4338ca' : '#fff',
                              color: isSel ? '#fff' : 'var(--s-text2)',
                              cursor: 'pointer'
                            }}
                          >
                            {val}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  onClick={() => setPlacementStep(3)}
                  style={{ background: 'var(--s-surface2)', border: '1px solid var(--s-border)', padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
                >
                  <FiArrowLeft style={{ marginRight: 6 }} /> Back
                </button>
                <SBtn variant="primary" onClick={handleGeneratePlacementPlanSubmit} style={{ padding: '12px 30px', borderRadius: 14, fontSize: 15, fontWeight: 900 }}>
                  ✨ Generate Placement Preparation Plan
                </SBtn>
              </div>
            </div>
          )}

        </SCard>
      </div>
    )
  }

  // ── RENDER ACADEMIC WIZARD (Phases 2 – 11) ──
  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }} className="s-anim-up">
      {/* WIZARD STEP HEADER & PROGRESS BAR */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            AI STUDY PLAN CREATOR • STEP {wizardStep} OF 9
          </span>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--s-text)', margin: '2px 0 0' }}>
            {wizardStep === 1 && 'Phase 2: What do you want to achieve?'}
            {wizardStep === 2 && 'Phase 3: What would you like to study?'}
            {wizardStep === 3 && 'Phase 4: Schedule Duration & Target Deadline'}
            {wizardStep === 4 && 'Phase 5: Daily Study Time Availability'}
            {wizardStep === 5 && 'Phase 6: Preferred Time Slots'}
            {wizardStep === 6 && 'Phases 7 & 8: Subject Priority & Difficulty'}
            {wizardStep === 7 && 'Phase 9: Study Preference & Learning Style'}
            {wizardStep === 8 && 'Phase 10: Constraints & Avoidances'}
            {wizardStep === 9 && 'Phase 11: Review & Generate Your Plan'}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setViewMode('landing')}
          style={{ background: 'none', border: 'none', color: 'var(--s-text3)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          ✕ Cancel
        </button>
      </div>

      <div style={{ background: '#e2e8f0', height: 6, borderRadius: 99, marginBottom: 28, overflow: 'hidden' }}>
        <div style={{ width: `${(wizardStep / 9) * 100}%`, height: '100%', background: 'var(--s-primary)', transition: 'width 0.3s ease' }} />
      </div>

      <SCard style={{ padding: 32, borderRadius: 24 }}>

        {/* STEP 1: GOAL SELECTION */}
        {wizardStep === 1 && (
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 8px' }}>
              Select your primary study goal
            </h3>
            <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '0 0 20px' }}>
              Choose a goal card or describe what you want to accomplish in your own words.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
              {goalCatalog.map(card => {
                const isSelected = selectedGoalType === card.type
                return (
                  <div
                    key={card.type}
                    onClick={() => handleSelectGoalCard(card)}
                    style={{
                      padding: 18, borderRadius: 18, cursor: 'pointer',
                      background: isSelected ? '#eff6ff' : '#fff',
                      border: isSelected ? '2px solid var(--s-primary)' : '1px solid var(--s-border)',
                      boxShadow: isSelected ? '0 4px 12px rgba(37,99,235,0.12)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: isSelected ? 'var(--s-primary)' : 'var(--s-text)', marginBottom: 4 }}>
                      {card.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--s-text3)', lineHeight: 1.4 }}>
                      {card.desc}
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ background: '#f8fafc', padding: 20, borderRadius: 18, border: '1px solid #e2e8f0' }}>
              <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-text)', display: 'block', marginBottom: 6 }}>
                💬 Tell me in your own words (Optional AI Natural Language Input):
              </label>
              <textarea
                rows={2}
                value={userGoalText}
                onChange={e => setUserGoalText(e.target.value)}
                placeholder='e.g. "I want to prepare DBMS and DSA for my semester exam in 14 days."'
                style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid var(--s-border)', fontSize: 13, fontFamily: 'inherit', resize: 'vertical' }}
              />
              {userGoalText.length > 5 && (
                <button
                  type="button"
                  onClick={handleParseNlpGoal}
                  disabled={parsingNlp}
                  style={{ marginTop: 10, background: '#ede9fe', color: '#6d28d9', border: 'none', padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <FiZap size={14} /> {parsingNlp ? 'Extracting...' : '✨ Auto-Extract Goal & Subjects with AI'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: WHAT TO STUDY */}
        {wizardStep === 2 && (
          <div>
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px 18px', borderRadius: 14, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 900, color: '#1d4ed8' }}>🎯 Selected Goal:</span>
                <span style={{ fontSize: 14, fontWeight: 900, color: '#1e40af', background: '#dbeafe', padding: '4px 12px', borderRadius: 10 }}>{goalTitle}</span>
              </div>
              <span style={{ fontSize: 12, color: '#2563eb', fontWeight: 700 }}>✨ Tailored subjects & topics loaded ({selectedSubjects.length})</span>
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 8px' }}>
              What would you like to study?
            </h3>
            <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '0 0 20px' }}>
              Review subjects tailored to your goal, customize them, or add custom topics.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              {selectedSubjects.map(sub => (
                <div key={sub.name} style={{ background: '#f8fafc', padding: 16, borderRadius: 16, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--s-text)' }}>
                      ☑ {sub.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleSubjectSelect(sub.name)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                    >
                      Remove
                    </button>
                  </div>

                  {sub.topics && sub.topics.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                      {sub.topics.map((t, tIdx) => (
                        <span key={tIdx} style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 10px', borderRadius: 10, fontSize: 12, fontWeight: 700 }}>
                          ├── {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      placeholder={`Add subtopic to ${sub.name}`}
                      value={customTopicInput[sub.name] || ''}
                      onChange={e => setCustomTopicInput({ ...customTopicInput, [sub.name]: e.target.value })}
                      style={{ flex: 1, padding: '6px 12px', borderRadius: 10, border: '1px solid var(--s-border)', fontSize: 12 }}
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTopicToSubject(sub.name)}
                      style={{ background: 'var(--s-surface2)', border: '1px solid var(--s-border)', padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                    >
                      + Add Topic
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, background: '#fff', padding: 12, borderRadius: 14, border: '1px dashed var(--s-border)' }}>
              <input
                type="text"
                placeholder="Add custom subject"
                value={customSubjectInput}
                onChange={e => setCustomSubjectInput(e.target.value)}
                style={{ flex: 1, padding: '8px 14px', borderRadius: 10, border: '1px solid var(--s-border)', fontSize: 13 }}
              />
              <button
                type="button"
                onClick={handleAddCustomSubject}
                style={{ background: 'var(--s-primary)', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
              >
                + Add Subject
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DURATION & DATES */}
        {wizardStep === 3 && (
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 8px' }}>
              How many days do you want to study?
            </h3>
            <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '0 0 20px' }}>
              Select a duration preset or set your custom target deadline date.
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
              {['7', '14', '21', '30'].map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDurationPresetChange(d)}
                  style={{
                    padding: '10px 22px', borderRadius: 14, fontSize: 14, fontWeight: 800,
                    border: durationPreset === d ? '2px solid var(--s-primary)' : '1px solid var(--s-border)',
                    background: durationPreset === d ? 'var(--s-primary)' : '#fff',
                    color: durationPreset === d ? '#fff' : 'var(--s-text2)',
                    cursor: 'pointer'
                  }}
                >
                  📅 {d} Days Plan
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-text)', display: 'block', marginBottom: 6 }}>Start Date</label>
                <input
                  type="date"
                  value={startDateStr}
                  onChange={e => setStartDateStr(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid var(--s-border)', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-text)', display: 'block', marginBottom: 6 }}>Target Deadline Date</label>
                <input
                  type="date"
                  value={deadlineStr}
                  onChange={e => setDeadlineStr(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid var(--s-border)', fontSize: 14 }}
                />
              </div>
            </div>

            <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '12px 18px', borderRadius: 14, fontSize: 14, fontWeight: 800 }}>
              Calculated Study Period: <strong>{calculatedDays} Days</strong>
            </div>
          </div>
        )}

        {/* STEP 4: DAILY AVAILABILITY */}
        {wizardStep === 4 && (
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 8px' }}>
              How much time can you realistically study?
            </h3>
            <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '0 0 20px' }}>
              Set daily study hours.
            </p>

            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <button
                type="button"
                onClick={() => setAvailabilityMode('same')}
                style={{
                  flex: 1, padding: 12, borderRadius: 14, fontSize: 13, fontWeight: 800,
                  border: availabilityMode === 'same' ? '2px solid var(--s-primary)' : '1px solid var(--s-border)',
                  background: availabilityMode === 'same' ? '#eff6ff' : '#fff',
                  color: availabilityMode === 'same' ? 'var(--s-primary)' : 'var(--s-text2)',
                  cursor: 'pointer'
                }}
              >
                Same time every day
              </button>

              <button
                type="button"
                onClick={() => setAvailabilityMode('custom')}
                style={{
                  flex: 1, padding: 12, borderRadius: 14, fontSize: 13, fontWeight: 800,
                  border: availabilityMode === 'custom' ? '2px solid var(--s-primary)' : '1px solid var(--s-border)',
                  background: availabilityMode === 'custom' ? '#eff6ff' : '#fff',
                  color: availabilityMode === 'custom' ? 'var(--s-primary)' : 'var(--s-text2)',
                  cursor: 'pointer'
                }}
              >
                Customize each day
              </button>
            </div>

            {availabilityMode === 'same' ? (
              <div style={{ background: '#f8fafc', padding: 20, borderRadius: 18, border: '1px solid #e2e8f0' }}>
                <label style={{ fontSize: 14, fontWeight: 800, color: 'var(--s-text)', display: 'block', marginBottom: 8 }}>
                  Daily Target Hours: <strong>{sameDailyHours} Hours / Day</strong>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="8"
                  step="0.5"
                  value={sameDailyHours}
                  onChange={e => setSameDailyHours(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <div key={day} style={{ background: '#f8fafc', padding: 14, borderRadius: 14, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-text)', marginBottom: 6 }}>{day}</div>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={customDailyHours[day]}
                      onChange={e => setCustomDailyHours({ ...customDailyHours, [day]: parseFloat(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--s-border)', fontSize: 13, fontWeight: 800 }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 5: TIME SLOTS */}
        {wizardStep === 5 && (
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 8px' }}>
              When do you prefer to study?
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
              {[
                { slot: 'Morning', icon: '🌅', time: '7:00 AM – 10:00 AM' },
                { slot: 'Afternoon', icon: '☀️', time: '2:00 PM – 5:00 PM' },
                { slot: 'Evening', icon: '🌆', time: '6:00 PM – 9:00 PM' },
                { slot: 'Night', icon: '🌙', time: '8:00 PM – 11:00 PM' }
              ].map(item => {
                const isSel = selectedSlots.includes(item.slot)
                return (
                  <div
                    key={item.slot}
                    onClick={() => toggleSlot(item.slot)}
                    style={{
                      padding: 18, borderRadius: 16, cursor: 'pointer',
                      background: isSel ? '#eff6ff' : '#fff',
                      border: isSel ? '2px solid var(--s-primary)' : '1px solid var(--s-border)'
                    }}
                  >
                    <div style={{ fontSize: 24, marginBottom: 6 }}>{item.icon}</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: isSel ? 'var(--s-primary)' : 'var(--s-text)' }}>{item.slot}</div>
                    <div style={{ fontSize: 12, color: 'var(--s-text3)' }}>{item.time}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* STEP 6: PRIORITY & DIFFICULTY */}
        {wizardStep === 6 && (
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 8px' }}>
              Subject Priority & Difficulty Ratings
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {selectedSubjects.map(sub => (
                <div key={sub.name} style={{ background: '#f8fafc', padding: 18, borderRadius: 18, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--s-text)', marginBottom: 12 }}>
                    📚 {sub.name}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 800, color: '#64748b', display: 'block', marginBottom: 6 }}>Priority Level:</label>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {['High', 'Medium', 'Low', 'Auto'].map(p => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setSubjectPriorities({ ...subjectPriorities, [sub.name]: p })}
                            style={{
                              flex: 1, padding: '6px 0', borderRadius: 8, fontSize: 12, fontWeight: 800,
                              border: (subjectPriorities[sub.name] || 'Medium') === p ? '2px solid var(--s-primary)' : '1px solid var(--s-border)',
                              background: (subjectPriorities[sub.name] || 'Medium') === p ? 'var(--s-primary)' : '#fff',
                              color: (subjectPriorities[sub.name] || 'Medium') === p ? '#fff' : 'var(--s-text2)',
                              cursor: 'pointer'
                            }}
                          >
                            {p === 'Auto' ? "Don't Know" : p}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 800, color: '#64748b', display: 'block', marginBottom: 6 }}>Difficulty Rating:</label>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {['Easy', 'Moderate', 'Difficult', 'Very Difficult'].map(d => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setSubjectDifficulties({ ...subjectDifficulties, [sub.name]: d })}
                            style={{
                              flex: 1, padding: '6px 0', borderRadius: 8, fontSize: 11, fontWeight: 800,
                              border: (subjectDifficulties[sub.name] || 'Moderate') === d ? '2px solid #6d28d9' : '1px solid var(--s-border)',
                              background: (subjectDifficulties[sub.name] || 'Moderate') === d ? '#ede9fe' : '#fff',
                              color: (subjectDifficulties[sub.name] || 'Moderate') === d ? '#6d28d9' : 'var(--s-text2)',
                              cursor: 'pointer'
                            }}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 7: STUDY PREFERENCE */}
        {wizardStep === 7 && (
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 8px' }}>
              How do you prefer to study?
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              {['Theory', 'Coding Practice', 'Problem Solving', 'Videos', 'Notes', 'Practice Questions', 'Revision', 'Projects'].map(name => {
                const isSel = selectedPreferences.includes(name)
                return (
                  <div
                    key={name}
                    onClick={() => togglePreference(name)}
                    style={{
                      padding: '14px 16px', borderRadius: 14, cursor: 'pointer',
                      background: isSel ? '#eff6ff' : '#fff',
                      border: isSel ? '2px solid var(--s-primary)' : '1px solid var(--s-border)',
                      fontWeight: 800, fontSize: 14, color: isSel ? 'var(--s-primary)' : 'var(--s-text)'
                    }}
                  >
                    <span>{name}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* STEP 8: CONSTRAINTS */}
        {wizardStep === 8 && (
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 8px' }}>
              Is there anything I should avoid?
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['College hours (9 AM – 4 PM)', 'Travel time', 'Hostel restrictions', 'Work / internship', 'Weekend unavailable', 'No late-night sessions', 'Personal commitments'].map(item => {
                const isSel = selectedConstraints.includes(item)
                return (
                  <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 14, background: isSel ? '#fef2f2' : '#fff', border: isSel ? '1px solid #fca5a5' : '1px solid var(--s-border)', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                    <input type="checkbox" checked={isSel} onChange={() => toggleConstraint(item)} />
                    <span>🚫 {item}</span>
                  </label>
                )
              })}
            </div>
          </div>
        )}

        {/* STEP 9: SUMMARY */}
        {wizardStep === 9 && (
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 16px' }}>
              📋 YOUR STUDY PLAN REQUEST SUMMARY
            </h3>
            <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff', padding: 24, borderRadius: 20, marginBottom: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div><span style={{ fontSize: 11, color: '#38bdf8' }}>Goal</span><div style={{ fontSize: 16, fontWeight: 900 }}>{goalTitle}</div></div>
                <div><span style={{ fontSize: 11, color: '#38bdf8' }}>Duration</span><div style={{ fontSize: 16, fontWeight: 900 }}>{calculatedDays} Days</div></div>
                <div><span style={{ fontSize: 11, color: '#38bdf8' }}>Subjects</span><div style={{ fontSize: 14, fontWeight: 800 }}>{selectedSubjects.map(s => s.name).join(', ')}</div></div>
              </div>
            </div>
          </div>
        )}

        {/* WIZARD NAV BUTTONS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--s-border)' }}>
          {wizardStep > 1 ? (
            <button type="button" onClick={() => setWizardStep(wizardStep - 1)} style={{ background: 'var(--s-surface2)', border: '1px solid var(--s-border)', padding: '10px 20px', borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
              <FiArrowLeft style={{ marginRight: 6 }} /> Back
            </button>
          ) : <div />}

          {wizardStep < 9 ? (
            <SBtn variant="primary" onClick={() => setWizardStep(wizardStep + 1)} style={{ padding: '10px 24px', borderRadius: 12, fontSize: 14, fontWeight: 800 }}>
              Next Phase <FiArrowRight style={{ marginLeft: 6 }} />
            </SBtn>
          ) : (
            <SBtn variant="primary" onClick={handleGeneratePlanSubmit} style={{ padding: '12px 30px', borderRadius: 14, fontSize: 15, fontWeight: 900 }}>
              ✨ Generate My Study Plan
            </SBtn>
          )}
        </div>

      </SCard>
    </div>
  )
}
