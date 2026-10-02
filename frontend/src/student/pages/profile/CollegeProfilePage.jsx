import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStudentAuth } from '../../context/StudentAuthContext'
import { useCollegeTheme } from '../../context/CollegeThemeContext'
import axiosInstance from '../../../config/axios'
import { SBtn, SCard, SBadge, SLoader, SInput, SSelect } from '../../components/ui'
import {
  FiUser, FiUsers, FiBook, FiBriefcase, FiGlobe, FiFileText,
  FiEdit2, FiCheckCircle, FiMapPin, FiAward, FiTarget, FiZap,
  FiCalendar, FiArrowRight, FiX, FiCheck, FiPlus, FiTrash2,
  FiPhone, FiFolder, FiStar, FiMail, FiPrinter, FiDownload, FiExternalLink,
  FiLinkedin, FiGithub, FiTwitter, FiInstagram, FiFacebook, FiVideo, FiImage
} from 'react-icons/fi'

export default function CollegeProfilePage() {
  const { student } = useStudentAuth()
  const { theme, themeKey } = useCollegeTheme()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [activeTab, setActiveTab] = useState('personal') // 'personal', 'parent', 'education', 'academic', 'social', 'resume'
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState('')

  // ── Personal Info State ──
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [dob, setDob] = useState('')
  const [address, setAddress] = useState('')
  const [profilePhoto, setProfilePhoto] = useState('')
  const [introVideo, setIntroVideo] = useState('')
  const [careerObjective, setCareerObjective] = useState('')

  // ── Parent Info State ──
  const [parentName, setParentName] = useState('')
  const [parentPhone, setParentPhone] = useState('')
  const [parentOccupation, setParentOccupation] = useState('')
  const [parentEmail, setParentEmail] = useState('')

  // ── Education State ──
  // Class 10
  const [school10, setSchool10] = useState('')
  const [cgpa10, setCgpa10] = useState('')
  const [startDate10, setStartDate10] = useState('')
  const [endDate10, setEndDate10] = useState('')

  // Class 12 / Diploma
  const [institution12, setInstitution12] = useState('')
  const [cgpa12, setCgpa12] = useState('')
  const [branch12, setBranch12] = useState('')
  const [startDate12, setStartDate12] = useState('')
  const [endDate12, setEndDate12] = useState('')
  const [isDiploma, setIsDiploma] = useState(false)

  // UG Degree
  const [collegeName, setCollegeName] = useState('')
  const [degreeProgramme, setDegreeProgramme] = useState('')
  const [branchUg, setBranchUg] = useState('')
  const [cgpaUg, setCgpaUg] = useState('')
  const [startDateUg, setStartDateUg] = useState('')
  const [endDateUg, setEndDateUg] = useState('')

  // ── Academic Work State ──
  const [projectsList, setProjectsList] = useState([])
  const [certsList, setCertsList] = useState([])
  const [achievementsList, setAchievementsList] = useState([])
  const [skillsText, setSkillsText] = useState('')

  // Modals for Academic Work
  const [showAddProject, setShowAddProject] = useState(false)
  const [projTitle, setProjTitle] = useState('')
  const [projDesc, setProjDesc] = useState('')
  const [projTechStack, setProjTechStack] = useState('')
  const [projYear, setProjYear] = useState('')

  const [showAddCert, setShowAddCert] = useState(false)
  const [certTitle, setCertTitle] = useState('')

  const [showAddAchievement, setShowAddAchievement] = useState(false)
  const [achieveTitle, setAchieveTitle] = useState('')
  const [achieveDesc, setAchieveDesc] = useState('')

  // ── Social Profiles State ──
  const [linkedIn, setLinkedIn] = useState('')
  const [github, setGithub] = useState('')
  const [hackerEarth, setHackerEarth] = useState('')
  const [leetcode, setLeetcode] = useState('')
  const [codechef, setCodechef] = useState('')
  const [geeksforgeeks, setGeeksforgeeks] = useState('')
  const [twitter, setTwitter] = useState('')
  const [instagram, setInstagram] = useState('')
  const [facebook, setFacebook] = useState('')

  const isGamified = themeKey === 'gamified'

  // Fetch profile on load
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('studentToken')
      if (!token) { setLoading(false); return }
      const res = await axiosInstance.get('/college-profile/my-profile')
      if (res.data?.success && res.data.profile) {
        const p = res.data.profile
        setProfile(p)

        // Populate fields
        setFirstName(p.firstName || student?.name?.split(' ')[0] || '')
        setLastName(p.lastName || student?.name?.split(' ').slice(1).join(' ') || '')
        setPhone(p.phone || '')
        setDob(p.dob || '')
        setAddress(p.address || '')
        setProfilePhoto(p.profilePhoto || '')
        setIntroVideo(p.introVideo || '')
        setCareerObjective(p.careerObjective || '')

        setParentName(p.parentName || '')
        setParentPhone(p.parentPhone || '')
        setParentOccupation(p.parentOccupation || '')
        setParentEmail(p.parentEmail || '')

        setSchool10(p.school10 || '')
        setCgpa10(p.cgpa10 || '')
        setStartDate10(p.startDate10 || '')
        setEndDate10(p.endDate10 || '')

        setInstitution12(p.institution12 || '')
        setCgpa12(p.cgpa12 || '')
        setBranch12(p.branch12 || '')
        setStartDate12(p.startDate12 || '')
        setEndDate12(p.endDate12 || '')
        setIsDiploma(Boolean(p.isDiploma))

        setCollegeName(p.institution || '')
        setDegreeProgramme(p.degreeProgramme || '')
        setBranchUg(p.domain || p.specialization || '')
        setCgpaUg(p.cgpa || '')
        setStartDateUg(p.startDateUg || '')
        setEndDateUg(p.endDateUg || '')

        setProjectsList(p.projects || [])
        setCertsList((p.certifications || []).map(c => typeof c === 'string' ? { title: c } : c))
        setAchievementsList(p.achievements || [])
        setSkillsText((p.skills || []).join(', '))

        if (p.socialProfiles) {
          setLinkedIn(p.socialProfiles.linkedIn || '')
          setGithub(p.socialProfiles.github || '')
          setHackerEarth(p.socialProfiles.hackerEarth || '')
          setLeetcode(p.socialProfiles.leetcode || '')
          setCodechef(p.socialProfiles.codechef || '')
          setGeeksforgeeks(p.socialProfiles.geeksforgeeks || '')
          setTwitter(p.socialProfiles.twitter || '')
          setInstagram(p.socialProfiles.instagram || '')
          setFacebook(p.socialProfiles.facebook || '')
        }
      }
    } catch (err) {
      console.error('Failed to load profile:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  // Universal Save handler
  const handleSaveSection = async (e) => {
    if (e) e.preventDefault()
    setSaving(true)
    setSaveSuccess('')

    try {
      const parsedSkills = skillsText
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)

      const formattedCerts = certsList.map(c => typeof c === 'string' ? c : (c.title || ''))

      const payload = {
        firstName,
        lastName,
        phone,
        dob,
        address,
        profilePhoto,
        introVideo,
        careerObjective,

        parentName,
        parentPhone,
        parentOccupation,
        parentEmail,

        school10,
        cgpa10,
        startDate10,
        endDate10,

        institution12,
        cgpa12,
        branch12,
        startDate12,
        endDate12,
        isDiploma,

        institution: collegeName,
        degreeProgramme,
        domain: branchUg,
        cgpa: cgpaUg,
        startDateUg,
        endDateUg,

        projects: projectsList,
        certifications: formattedCerts,
        achievements: achievementsList,
        skills: parsedSkills,

        socialProfiles: {
          linkedIn,
          github,
          hackerEarth,
          leetcode,
          codechef,
          geeksforgeeks,
          twitter,
          instagram,
          facebook
        }
      }

      const res = await axiosInstance.post('/college-profile/save', payload)
      if (res.data?.success && res.data.profile) {
        setProfile(res.data.profile)
        setSaveSuccess('Profile section saved successfully to MongoDB!')
        setTimeout(() => setSaveSuccess(''), 2500)
      }
    } catch (err) {
      alert('Failed to save profile details. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Academic Work Actions
  const handleAddProject = async (e) => {
    e.preventDefault()
    if (!projTitle.trim()) return
    const newProj = {
      title: projTitle.trim(),
      description: projDesc.trim(),
      techStack: projTechStack.trim(),
      year: projYear.trim() || new Date().getFullYear().toString()
    }
    const updated = [...projectsList, newProj]
    setProjectsList(updated)
    setShowAddProject(false)
    setProjTitle(''); setProjDesc(''); setProjTechStack(''); setProjYear('')
    
    // Auto save to DB
    await axiosInstance.post('/college-profile/save', { projects: updated })
  }

  const handleDeleteProject = async (idx) => {
    const updated = projectsList.filter((_, i) => i !== idx)
    setProjectsList(updated)
    await axiosInstance.post('/college-profile/save', { projects: updated })
  }

  const handleAddCert = async (e) => {
    e.preventDefault()
    if (!certTitle.trim()) return
    const newCert = { title: certTitle.trim() }
    const updated = [...certsList, newCert]
    setCertsList(updated)
    setShowAddCert(false)
    setCertTitle('')
    const formattedCerts = updated.map(c => c.title)
    await axiosInstance.post('/college-profile/save', { certifications: formattedCerts })
  }

  const handleDeleteCert = async (idx) => {
    const updated = certsList.filter((_, i) => i !== idx)
    setCertsList(updated)
    const formattedCerts = updated.map(c => c.title)
    await axiosInstance.post('/college-profile/save', { certifications: formattedCerts })
  }

  const handleAddAchievement = async (e) => {
    e.preventDefault()
    if (!achieveTitle.trim()) return
    const newAchieve = { title: achieveTitle.trim(), description: achieveDesc.trim() }
    const updated = [...achievementsList, newAchieve]
    setAchievementsList(updated)
    setShowAddAchievement(false)
    setAchieveTitle(''); setAchieveDesc('')
    await axiosInstance.post('/college-profile/save', { achievements: updated })
  }

  const handleDeleteAchievement = async (idx) => {
    const updated = achievementsList.filter((_, i) => i !== idx)
    setAchievementsList(updated)
    await axiosInstance.post('/college-profile/save', { achievements: updated })
  }

  if (loading) {
    return <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><SLoader /></div>
  }

  const sidebarTabs = [
    { id: 'personal', label: 'Personal Info', icon: FiUser },
    { id: 'parent', label: 'Parent Info', icon: FiUsers },
    { id: 'education', label: 'Education', icon: FiBook },
    { id: 'academic', label: 'Academic Work', icon: FiBriefcase },
    { id: 'social', label: 'Social Profiles', icon: FiGlobe },
    { id: 'resume', label: 'View Resume', icon: FiFileText },
  ]

  const fullName = [firstName, lastName].filter(Boolean).join(' ') || student?.name || 'Student Name'

  return (
    <div className="s-anim-up" style={{ maxWidth: 1120, margin: '0 auto', paddingBottom: 60 }}>

      {/* Page Title & Notification Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 900, fontSize: 26, color: 'var(--s-text)', margin: '0 0 6px' }}>
            Profile Management
          </h1>
          <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: 0 }}>
            Enter your personal, educational, project, and social profile details. All data is saved directly in MongoDB to generate your automated Resume.
          </p>
        </div>

        {saveSuccess && (
          <div style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '8px 16px', borderRadius: 12, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiCheckCircle size={16} /> {saveSuccess}
          </div>
        )}
      </div>

      {/* Main Layout: Left Sidebar + Right Form Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 28 }} className="s-grid-1col">

        {/* ── LEFT SIDEBAR TABS ── */}
        <div>
          <SCard style={{ padding: 12, borderRadius: 18, background: '#fff', border: '1px solid var(--s-border)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {sidebarTabs.map(tab => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      borderRadius: 12,
                      border: 'none',
                      fontSize: 14,
                      fontWeight: isActive ? 800 : 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                      background: isActive
                        ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
                        : 'transparent',
                      color: isActive ? '#fff' : 'var(--s-text2)'
                    }}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                    {isActive && <FiArrowRight size={16} style={{ marginLeft: 'auto' }} />}
                  </button>
                )
              })}
            </div>
          </SCard>
        </div>

        {/* ── RIGHT MAIN PANEL ── */}
        <div>

          {/* 1. PERSONAL INFO TAB */}
          {activeTab === 'personal' && (
            <SCard style={{ padding: 32, borderRadius: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 20, color: 'var(--s-text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <FiUser color="#ea580c" /> Personal Info
              </h2>

              <form onSubmit={handleSaveSection}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                  <SInput
                    label="First Name"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                  />
                  <SInput
                    label="Last Name"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Enter last name"
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <SInput
                    label="Email Address"
                    value={student?.email || ''}
                    disabled
                    readOnly
                    placeholder="Email Address"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                  <SInput
                    label="Phone Number"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                  />
                  <SInput
                    type="date"
                    label="Date of Birth"
                    value={dob}
                    onChange={e => setDob(e.target.value)}
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--s-text)', marginBottom: 6 }}>
                    Address
                  </label>
                  <textarea
                    rows={3}
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Door No, Street Name, City, Pincode"
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--s-border)', fontSize: 14, fontFamily: 'inherit' }}
                  />
                </div>

                {/* Photo & Intro Video */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                  <SInput
                    label="Profile Photo URL"
                    value={profilePhoto}
                    onChange={e => setProfilePhoto(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                  />
                  <SInput
                    label="Introduction Video Link"
                    value={introVideo}
                    onChange={e => setIntroVideo(e.target.value)}
                    placeholder="http://www.gracious.com or YouTube link"
                  />
                </div>

                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--s-text)', marginBottom: 6 }}>
                    Career Objective
                  </label>
                  <textarea
                    rows={4}
                    value={careerObjective}
                    onChange={e => setCareerObjective(e.target.value)}
                    placeholder="Enter professional career objective for your resume..."
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--s-border)', fontSize: 14, fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <SBtn variant="primary" type="submit" disabled={saving} style={{ background: '#ea580c', borderRadius: 12, padding: '10px 24px' }}>
                    {saving ? 'Saving...' : 'Save Personal Info'}
                  </SBtn>
                </div>
              </form>
            </SCard>
          )}

          {/* 2. PARENT INFO TAB */}
          {activeTab === 'parent' && (
            <SCard style={{ padding: 32, borderRadius: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 20, color: 'var(--s-text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <FiUsers color="#ea580c" /> Parent Info
              </h2>

              <form onSubmit={handleSaveSection}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                  <SInput
                    label="Parent / Guardian Name"
                    value={parentName}
                    onChange={e => setParentName(e.target.value)}
                    placeholder="Enter parent's full name"
                  />
                  <SInput
                    label="Parent Contact Phone"
                    value={parentPhone}
                    onChange={e => setParentPhone(e.target.value)}
                    placeholder="Enter parent's phone number"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
                  <SInput
                    label="Parent Occupation"
                    value={parentOccupation}
                    onChange={e => setParentOccupation(e.target.value)}
                    placeholder="e.g. Engineer / Teacher / Business"
                  />
                  <SInput
                    label="Parent Email Address"
                    value={parentEmail}
                    onChange={e => setParentEmail(e.target.value)}
                    placeholder="parent@example.com"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <SBtn variant="primary" type="submit" disabled={saving} style={{ background: '#ea580c', borderRadius: 12, padding: '10px 24px' }}>
                    {saving ? 'Saving...' : 'Save Parent Info'}
                  </SBtn>
                </div>
              </form>
            </SCard>
          )}

          {/* 3. EDUCATION TAB */}
          {activeTab === 'education' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* Class 10 Card */}
              <SCard style={{ padding: 28, borderRadius: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                  🎓 Class 10
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
                  <SInput
                    label="School Name"
                    value={school10}
                    onChange={e => setSchool10(e.target.value)}
                    placeholder="e.g. St Ann's Matric Higher Secondary School"
                  />
                  <SInput
                    label="CGPA / Percentage"
                    value={cgpa10}
                    onChange={e => setCgpa10(e.target.value)}
                    placeholder="e.g. 8.0 or 80%"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <SInput
                    type="date"
                    label="Start Date"
                    value={startDate10}
                    onChange={e => setStartDate10(e.target.value)}
                  />
                  <SInput
                    type="date"
                    label="End Date"
                    value={endDate10}
                    onChange={e => setEndDate10(e.target.value)}
                  />
                </div>
              </SCard>

              {/* Class 12 / Diploma Card */}
              <SCard style={{ padding: 28, borderRadius: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
                    🎓 Class 12 / Diploma
                  </h3>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={isDiploma}
                      onChange={e => setIsDiploma(e.target.checked)}
                      style={{ width: 16, height: 16 }}
                    />
                    I have done diploma
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
                  <SInput
                    label="Institution Name"
                    value={institution12}
                    onChange={e => setInstitution12(e.target.value)}
                    placeholder="e.g. St Ann's Matric Higher Secondary School"
                  />
                  <SInput
                    label="CGPA / Percentage"
                    value={cgpa12}
                    onChange={e => setCgpa12(e.target.value)}
                    placeholder="e.g. 8.7 or 87%"
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <SInput
                    label="Branch / Stream"
                    value={branch12}
                    onChange={e => setBranch12(e.target.value)}
                    placeholder="e.g. PCMCs, Bio-Math, Diploma in ECE"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <SInput
                    type="date"
                    label="Start Date"
                    value={startDate12}
                    onChange={e => setStartDate12(e.target.value)}
                  />
                  <SInput
                    type="date"
                    label="End Date"
                    value={endDate12}
                    onChange={e => setEndDate12(e.target.value)}
                  />
                </div>
              </SCard>

              {/* Undergraduate Degree Card */}
              <SCard style={{ padding: 28, borderRadius: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)', marginBottom: 18 }}>
                  🎓 Undergraduate Degree
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
                  <SInput
                    label="College Name"
                    value={collegeName}
                    onChange={e => setCollegeName(e.target.value)}
                    placeholder="e.g. National Engineering College"
                  />
                  <SInput
                    label="CGPA"
                    value={cgpaUg}
                    onChange={e => setCgpaUg(e.target.value)}
                    placeholder="e.g. 8.38"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <SInput
                    label="Degree Programme"
                    value={degreeProgramme}
                    onChange={e => setDegreeProgramme(e.target.value)}
                    placeholder="e.g. B.E. (Bachelor of Engineering)"
                  />
                  <SInput
                    label="Branch / Specialization"
                    value={branchUg}
                    onChange={e => setBranchUg(e.target.value)}
                    placeholder="e.g. Computer Science and Engineering"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <SInput
                    type="date"
                    label="Start Date"
                    value={startDateUg}
                    onChange={e => setStartDateUg(e.target.value)}
                  />
                  <SInput
                    type="date"
                    label="End Date"
                    value={endDateUg}
                    onChange={e => setEndDateUg(e.target.value)}
                  />
                </div>
              </SCard>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <SBtn variant="primary" onClick={handleSaveSection} disabled={saving} style={{ background: '#ea580c', borderRadius: 12, padding: '10px 24px' }}>
                  {saving ? 'Saving...' : 'Save Education Info'}
                </SBtn>
              </div>

            </div>
          )}

          {/* 4. ACADEMIC WORK TAB */}
          {activeTab === 'academic' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Projects Section */}
              <SCard style={{ padding: 28, borderRadius: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
                    🛠️ Projects
                  </h3>
                  <SBtn variant="secondary" onClick={() => setShowAddProject(true)} style={{ borderRadius: 10, fontSize: 13 }}>
                    + Add Project
                  </SBtn>
                </div>

                {/* Add Project Form Modal / Inline */}
                {showAddProject && (
                  <form onSubmit={handleAddProject} style={{ padding: 20, background: '#f8fafc', borderRadius: 16, border: '1px solid #cbd5e1', marginBottom: 20 }}>
                    <h4 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 800 }}>New Project Details</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 14 }}>
                      <SInput label="Project Title *" value={projTitle} onChange={e => setProjTitle(e.target.value)} placeholder="e.g. Smart Incident Tracker" required />
                      <SInput label="Year / Date" value={projYear} onChange={e => setProjYear(e.target.value)} placeholder="e.g. 2025" />
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <SInput label="Tech Stack" value={projTechStack} onChange={e => setProjTechStack(e.target.value)} placeholder="e.g. React, Node.js, Express, MongoDB, Python" />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Description / Bullet points</label>
                      <textarea rows={3} value={projDesc} onChange={e => setProjDesc(e.target.value)} placeholder="Describe your project, features built, and technologies utilized..." style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid var(--s-border)', fontSize: 13 }} />
                    </div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                      <SBtn type="button" variant="secondary" onClick={() => setShowAddProject(false)}>Cancel</SBtn>
                      <SBtn type="submit" variant="primary" style={{ background: '#ea580c' }}>Save Project</SBtn>
                    </div>
                  </form>
                )}

                {/* List of projects */}
                {projectsList.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {projectsList.map((proj, idx) => (
                      <div key={idx} style={{ padding: '16px 20px', borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--s-text)' }}>{proj.title}</div>
                          {proj.techStack && <div style={{ fontSize: 12, color: '#0284c7', fontWeight: 700, marginTop: 2 }}>Tech Stack: {proj.techStack}</div>}
                          {proj.description && <div style={{ fontSize: 13, color: 'var(--s-text2)', marginTop: 6, lineHeight: 1.5 }}>{proj.description}</div>}
                        </div>
                        <button type="button" onClick={() => handleDeleteProject(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 6 }}>
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--s-text3)', fontSize: 14 }}>No projects added yet. Click "+ Add Project" to add your academic work.</p>
                )}
              </SCard>

              {/* Certificates Section */}
              <SCard style={{ padding: 28, borderRadius: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
                    📜 Certificates
                  </h3>
                  <SBtn variant="secondary" onClick={() => setShowAddCert(true)} style={{ borderRadius: 10, fontSize: 13 }}>
                    + Add Certificate
                  </SBtn>
                </div>

                {showAddCert && (
                  <form onSubmit={handleAddCert} style={{ padding: 16, background: '#f8fafc', borderRadius: 14, border: '1px solid #cbd5e1', marginBottom: 16, display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                      <SInput label="Certificate Title" value={certTitle} onChange={e => setCertTitle(e.target.value)} placeholder="e.g. AWS Certified Cloud Practitioner / NPTEL Java" required />
                    </div>
                    <SBtn type="button" variant="secondary" onClick={() => setShowAddCert(false)}>Cancel</SBtn>
                    <SBtn type="submit" variant="primary" style={{ background: '#ea580c' }}>Add</SBtn>
                  </form>
                )}

                {certsList.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {certsList.map((c, idx) => (
                      <div key={idx} style={{ padding: '8px 14px', borderRadius: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>📜 {c.title || c}</span>
                        <button type="button" onClick={() => handleDeleteCert(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}>
                          <FiX size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--s-text3)', fontSize: 14 }}>No certifications added yet.</p>
                )}
              </SCard>

              {/* Achievements Section */}
              <SCard style={{ padding: 28, borderRadius: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
                    🏆 Achievements
                  </h3>
                  <SBtn variant="secondary" onClick={() => setShowAddAchievement(true)} style={{ borderRadius: 10, fontSize: 13 }}>
                    + Add Achievement
                  </SBtn>
                </div>

                {showAddAchievement && (
                  <form onSubmit={handleAddAchievement} style={{ padding: 16, background: '#f8fafc', borderRadius: 14, border: '1px solid #cbd5e1', marginBottom: 16 }}>
                    <div style={{ marginBottom: 12 }}>
                      <SInput label="Achievement Title" value={achieveTitle} onChange={e => setAchieveTitle(e.target.value)} placeholder="e.g. 1st Place in Smart India Hackathon" required />
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <SInput label="Description / Details" value={achieveDesc} onChange={e => setAchieveDesc(e.target.value)} placeholder="Brief details about your award or rank..." />
                    </div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                      <SBtn type="button" variant="secondary" onClick={() => setShowAddAchievement(false)}>Cancel</SBtn>
                      <SBtn type="submit" variant="primary" style={{ background: '#ea580c' }}>Save Achievement</SBtn>
                    </div>
                  </form>
                )}

                {achievementsList.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {achievementsList.map((a, idx) => (
                      <div key={idx} style={{ padding: '12px 16px', borderRadius: 12, background: '#fdf4ff', border: '1px solid #f5d0fe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 14, color: '#86198f' }}>🏆 {a.title}</div>
                          {a.description && <div style={{ fontSize: 13, color: 'var(--s-text2)', marginTop: 2 }}>{a.description}</div>}
                        </div>
                        <button type="button" onClick={() => handleDeleteAchievement(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--s-text3)', fontSize: 14 }}>No achievements added yet.</p>
                )}
              </SCard>

              {/* Skills Card */}
              <SCard style={{ padding: 28, borderRadius: 20 }}>
                <h3 style={{ fontSize: 17, fontWeight: 900, color: 'var(--s-text)', marginBottom: 14 }}>
                  ⚡ Technical Skills
                </h3>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Skills (Comma Separated)</label>
                  <input
                    type="text"
                    value={skillsText}
                    onChange={e => setSkillsText(e.target.value)}
                    placeholder="React.js, Node.js, Python, Java, AI/ML, MongoDB, MySQL"
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--s-border)', fontSize: 14 }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <SBtn variant="primary" onClick={handleSaveSection} disabled={saving} style={{ background: '#ea580c', borderRadius: 12, padding: '10px 24px' }}>
                    {saving ? 'Saving...' : 'Save Academic Work'}
                  </SBtn>
                </div>
              </SCard>

            </div>
          )}

          {/* 5. SOCIAL PROFILES TAB */}
          {activeTab === 'social' && (
            <SCard style={{ padding: 32, borderRadius: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 20, color: 'var(--s-text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <FiGlobe color="#ea580c" /> Social & Coding Profiles
              </h2>

              <form onSubmit={handleSaveSection}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 28 }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#0a66c2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiLinkedin size={18} /></div>
                    <div style={{ flex: 1 }}>
                      <SInput label="LinkedIn Profile URL" value={linkedIn} onChange={e => setLinkedIn(e.target.value)} placeholder="https://www.linkedin.com/in/username" />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#24292e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiGithub size={18} /></div>
                    <div style={{ flex: 1 }}>
                      <SInput label="GitHub Profile URL" value={github} onChange={e => setGithub(e.target.value)} placeholder="https://github.com/username" />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#2c3e50', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13 }}>H</div>
                    <div style={{ flex: 1 }}>
                      <SInput label="HackerEarth URL" value={hackerEarth} onChange={e => setHackerEarth(e.target.value)} placeholder="https://www.hackerearth.com/@username" />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f59e0b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13 }}>LC</div>
                    <div style={{ flex: 1 }}>
                      <SInput label="LeetCode URL" value={leetcode} onChange={e => setLeetcode(e.target.value)} placeholder="https://leetcode.com/username" />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#5b4538', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13 }}>CC</div>
                    <div style={{ flex: 1 }}>
                      <SInput label="CodeChef URL" value={codechef} onChange={e => setCodechef(e.target.value)} placeholder="https://www.codechef.com/users/username" />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#2f9e44', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13 }}>GFG</div>
                    <div style={{ flex: 1 }}>
                      <SInput label="GeeksforGeeks URL" value={geeksforgeeks} onChange={e => setGeeksforgeeks(e.target.value)} placeholder="https://auth.geeksforgeeks.org/user/username" />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#1da1f2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiTwitter size={18} /></div>
                    <div style={{ flex: 1 }}>
                      <SInput label="Twitter / X URL" value={twitter} onChange={e => setTwitter(e.target.value)} placeholder="https://twitter.com/username" />
                    </div>
                  </div>

                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <SBtn variant="primary" type="submit" disabled={saving} style={{ background: '#ea580c', borderRadius: 12, padding: '10px 24px' }}>
                    {saving ? 'Saving...' : 'Save Social Profiles'}
                  </SBtn>
                </div>
              </form>
            </SCard>
          )}

          {/* 6. VIEW RESUME TAB (Live Resume View matching Reference Screenshot 5) */}
          {activeTab === 'resume' && (
            <div>
              {/* Top Resume Export Action Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 900, margin: 0, color: 'var(--s-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiFileText color="#ea580c" /> Live Resume View
                </h2>
                <div style={{ display: 'flex', gap: 10 }}>
                  <SBtn variant="primary" onClick={() => window.print()} style={{ background: '#ea580c', borderRadius: 10, fontSize: 13 }}>
                    <FiPrinter size={15} style={{ marginRight: 6 }} /> Print / Save PDF
                  </SBtn>
                </div>
              </div>

              {/* Render Document Container matching reference screenshot */}
              <div style={{
                background: '#fff',
                padding: '40px 48px',
                borderRadius: 16,
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                border: '1px solid #e2e8f0',
                color: '#1e293b',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}>

                {/* Resume Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ea580c', paddingBottom: 24, marginBottom: 24 }}>
                  <div>
                    <h1 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 8px', color: '#0f172a', letterSpacing: '-0.02em' }}>
                      {fullName}
                    </h1>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 13, color: '#475569', fontWeight: 600 }}>
                      {phone && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FiPhone size={14} color="#ea580c" /> {phone}</span>}
                      {student?.email && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FiMail size={14} color="#ea580c" /> {student.email}</span>}
                      {linkedIn && <a href={linkedIn} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#0a66c2', textDecoration: 'none' }}><FiLinkedin size={14} /> LinkedIn</a>}
                      {github && <a href={github} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#24292e', textDecoration: 'none' }}><FiGithub size={14} /> GitHub</a>}
                    </div>
                  </div>

                  {/* Profile Photo Avatar */}
                  <div style={{ width: 84, height: 84, borderRadius: '50%', overflow: 'hidden', border: '3px solid #ea580c', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {profilePhoto ? (
                      <img src={profilePhoto} alt={fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: 32, fontWeight: 900, color: '#ea580c' }}>{fullName[0]?.toUpperCase()}</span>
                    )}
                  </div>
                </div>

                {/* CAREER OBJECTIVE SECTION */}
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ea580c', margin: '0 0 8px' }}>
                    Career Objective
                  </h3>
                  <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.6, margin: 0 }}>
                    {careerObjective || `Motivated ${branchUg || degreeProgramme || 'undergraduate'} student with hands-on technical skills seeking entry-level opportunities to apply engineering software and problem-solving abilities.`}
                  </p>
                </div>

                {/* EDUCATION SECTION */}
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ea580c', margin: '0 0 12px' }}>
                    Education
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    
                    {/* UG */}
                    {collegeName && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>{collegeName}</div>
                          <div style={{ fontSize: 13, color: '#475569' }}>{degreeProgramme || 'Undergraduate'} {branchUg ? `• ${branchUg}` : ''}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          {cgpaUg && <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>CGPA: {cgpaUg} / 10.0</div>}
                        </div>
                      </div>
                    )}

                    {/* Class 12 */}
                    {institution12 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>{institution12}</div>
                          <div style={{ fontSize: 13, color: '#475569' }}>{isDiploma ? 'Diploma' : 'Class 12'} {branch12 ? `• ${branch12}` : ''}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          {cgpa12 && <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>CGPA / Score: {cgpa12}</div>}
                        </div>
                      </div>
                    )}

                    {/* Class 10 */}
                    {school10 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>{school10}</div>
                          <div style={{ fontSize: 13, color: '#475569' }}>Class 10 High School</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          {cgpa10 && <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>CGPA / Score: {cgpa10}</div>}
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* PROJECTS SECTION */}
                {projectsList.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ea580c', margin: '0 0 12px' }}>
                      Projects
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {projectsList.map((p, idx) => (
                        <div key={idx}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <span style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>{p.title}</span>
                            {p.year && <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{p.year}</span>}
                          </div>
                          {p.techStack && <div style={{ fontSize: 12, color: '#ea580c', fontWeight: 700, margin: '2px 0 4px' }}>Tech: {p.techStack}</div>}
                          {p.description && <p style={{ fontSize: 13, color: '#334155', margin: 0, lineHeight: 1.5 }}>{p.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CERTIFICATES & ACHIEVEMENTS */}
                {(certsList.length > 0 || achievementsList.length > 0) && (
                  <div style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ea580c', margin: '0 0 12px' }}>
                      Certifications & Achievements
                    </h3>
                    <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#334155', lineHeight: 1.6 }}>
                      {certsList.map((c, idx) => (
                        <li key={`c-${idx}`}><strong>Certification:</strong> {c.title || c}</li>
                      ))}
                      {achievementsList.map((a, idx) => (
                        <li key={`a-${idx}`}><strong>{a.title}:</strong> {a.description}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* TECHNICAL SKILLS */}
                {skillsText && (
                  <div>
                    <h3 style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ea580c', margin: '0 0 8px' }}>
                      Technical Skills
                    </h3>
                    <div style={{ fontSize: 13, color: '#334155', fontWeight: 600 }}>
                      {skillsText}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  )
}
