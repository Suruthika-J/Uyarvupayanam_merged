import React, { useState, useEffect } from 'react'
import { SBtn, SBadge } from '../ui'
import { FiCheckCircle, FiCircle, FiZap, FiTarget } from 'react-icons/fi'
import { userActionService } from '../../../services/userActionService'
import { useStudentAuth } from '../../context/StudentAuthContext'

const DEFAULT_HABITS = [
  'Read 20 mins',
  'Practice Maths',
  'Help at Home',
  'Drink Water',
  'Daily Question'
]

export default function HabitTracker({ onAuthRequired }) {
  const [habitsData, setHabitsData] = useState([])
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = useStudentAuth()
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (isAuthenticated) fetchHabits()
  }, [isAuthenticated])

  const fetchHabits = async () => {
    try {
      setLoading(true)
      const res = await userActionService.getHabits()
      if (res.success) setHabitsData(res.data)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (title) => {
    if (!isAuthenticated) {
      onAuthRequired && onAuthRequired(`Please sign in to start tracking your daily habits!`)
      return
    }

    try {
      const res = await userActionService.toggleHabit(title, today)
      if (res.success) {
        // Optimistic update or refetch
        fetchHabits()
      }
    } catch (err) { console.error('Habit error', err) }
  }

  const isCompleted = (title) => {
    const h = habitsData.find(h => h.title === title)
    return h?.daysCompleted?.includes(today)
  }

  const getStreak = (title) => {
    const h = habitsData.find(h => h.title === title)
    return h?.streak || 0
  }

  return (
    <div style={{ 
      marginTop: 60, padding: 48, borderRadius: 48, background: '#fff', 
      border: '1px solid var(--s-border)', boxShadow: '0 10px 40px rgba(0,0,0,0.03)'
    }}>
       <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: 'var(--s-text)', marginBottom: 12 }}>Daily Superpower Habits ⚡️</h2>
          <p style={{ fontSize: 18, color: 'var(--s-text3)', maxWidth: 640, margin: '0 auto', fontWeight: 500 }}>
             Mark your wins every day to build your streak and unlock rewards!
          </p>
       </div>

       <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
          {DEFAULT_HABITS.map(h => {
             const active = isCompleted(h)
             const streak = getStreak(h)
             return (
               <button
                 key={h}
                 onClick={() => handleToggle(h)}
                 style={{
                   background: active ? '#6366f111' : '#fff',
                   border: `2px solid ${active ? '#6366f1' : 'var(--s-border)'}`,
                   padding: '20px 32px',
                   borderRadius: 24,
                   display: 'flex',
                   flexDirection: 'column',
                   alignItems: 'center',
                   gap: 12,
                   cursor: 'pointer',
                   transition: 'all 0.25s',
                   minWidth: 160,
                   boxShadow: active ? '0 10px 20px rgba(99, 102, 241, 0.1)' : '0 4px 6px rgba(0,0,0,0.02)',
                   transform: active ? 'translateY(-2px)' : 'none'
                 }}
               >
                 {active ? <FiCheckCircle size={32} color="#6366f1" /> : <FiCircle size={32} color="var(--s-border)" />}
                 <span style={{ fontWeight: 800, color: active ? '#4338ca' : 'var(--s-text2)', fontSize: 16 }}>{h}</span>
                 {streak > 0 && (
                   <SBadge color="gold" style={{ marginTop: 4 }}>
                      <FiZap size={12} fill="#fbbf24" /> {streak} Day Streak
                   </SBadge>
                 )}
               </button>
             )
          })}
       </div>

       {!isAuthenticated && (
         <div style={{ marginTop: 40, textAlign: 'center' }}>
            <SBadge color="gray">Log in to save your progress permanently</SBadge>
         </div>
       )}
    </div>
  )
}
