import React, { useState, useEffect } from 'react'
import { StatCard, Card, CardHeader, ProgressBar, ActivityDot } from '../../components/UI'
import { adminService } from '../../../services/adminService'

const levelColors = {
  '12th': 'var(--accent2)',
  '10th': 'var(--primary)',
  '8th': 'var(--accent)',
  '5th': 'var(--primary-d)',
  'Graduate': 'var(--accent3)',
}

const activityColors = {
  registration: '#22c55e',
  exam: '#f59e0b',
  scholarship: '#2d9e5f',
  cutoff: '#ef4444',
  course: '#3b82f6',
}

const careerColors = ['var(--primary)', 'var(--accent)', 'var(--accent2)', 'var(--accent3)', 'var(--primary-d)']

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getDashboardStats()
        setStats(data)
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading dashboard...</div>
  }

  if (!stats) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Failed to load dashboard data.</div>
  }

  const months = stats.monthlyRegistrations.map(r => r.month)
  const values = stats.monthlyRegistrations.map(r => r.count)
  const maxV = Math.max(...values, 1)
  const topCareerCount = stats.popularCareers.length > 0 ? stats.popularCareers[0].count : 1

  return (
    <div style={{ animation:'fadeUp 0.4s ease both' }}>
      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <StatCard icon="👨‍🎓" value={stats.totalStudents.toLocaleString()} label="Total Students" color="var(--primary)" />
        <StatCard icon="📘" value={stats.activeCourses} label="Active Courses" color="var(--accent3)" />
        <StatCard icon="📝" value={stats.examsCount} label="Exams Listed" color="var(--accent)" />
        <StatCard icon="🎓" value={stats.scholarshipsCount} label="Scholarships" color="var(--accent2)" />
      </div>

      {/* Charts row */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, marginBottom:24 }}>
        {/* Bar chart */}
        <Card>
          <CardHeader title="📈 Registration Growth" />
          {months.length > 0 ? (
            <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:140, paddingBottom:4 }}>
              {months.map((m, i) => (
                <div key={m} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                  <span style={{ fontSize:11, fontWeight:700, color: i === months.length - 1 ? 'var(--primary)' : 'var(--text3)' }}>{values[i]}</span>
                  <div style={{ flex:1, width:'100%', display:'flex', alignItems:'flex-end' }}>
                    <div style={{ width:'100%', borderRadius:'6px 6px 0 0',
                      height:`${(values[i] / maxV) * 100}%`,
                      background: i === months.length - 1 ? 'var(--primary)' : 'var(--surface2)',
                      border: i === months.length - 1 ? 'none' : '1.5px solid var(--border)',
                      transition:'height 1s ease' }} />
                  </div>
                  <span style={{ fontSize:10, color:'var(--text3)' }}>{m}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color:'var(--text3)', fontSize:13, padding:20, textAlign:'center' }}>No registration data yet</div>
          )}
        </Card>

        {/* Level distribution */}
        <Card>
          <CardHeader title="🎯 Level Distribution" />
          {stats.levelDistribution.length > 0 ? (
            stats.levelDistribution.map(l => (
              <ProgressBar key={l.level} label={`Class ${l.level}`} pct={l.percentage} color={levelColors[l.level] || '#2d9e5f'} />
            ))
          ) : (
            <div style={{ color:'var(--text3)', fontSize:13, padding:20, textAlign:'center' }}>No level data yet</div>
          )}
        </Card>
      </div>

      {/* Bottom row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {/* Activity */}
        <Card>
          <CardHeader title="⚡ Recent Activity" actionLabel="View All" action={() => {}} />
          {stats.recentActivities.length > 0 ? (
            stats.recentActivities.map((a, i) => (
              <div key={a._id} style={{ display:'flex', alignItems:'flex-start', gap:12,
                padding:'10px 0', borderBottom: i < stats.recentActivities.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <ActivityDot color={activityColors[a.type] || '#22c55e'} />
                <div>
                  <div style={{ fontSize:13, color:'var(--text2)' }}>{a.text}</div>
                  <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{timeAgo(a.createdAt)}</div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ color:'var(--text3)', fontSize:13, padding:20, textAlign:'center' }}>No recent activity</div>
          )}
        </Card>

        {/* Popular Careers */}
        <Card>
          <CardHeader title="🏆 Popular Careers" />
          {stats.popularCareers.length > 0 ? (
            stats.popularCareers.map((c, i) => (
              <ProgressBar key={c.name} label={c.name} value={c.count} max={topCareerCount} color={careerColors[i] || '#2d9e5f'} />
            ))
          ) : (
            <div style={{ color:'var(--text3)', fontSize:13, padding:20, textAlign:'center' }}>No career data yet</div>
          )}
        </Card>
      </div>
    </div>
  )
}
