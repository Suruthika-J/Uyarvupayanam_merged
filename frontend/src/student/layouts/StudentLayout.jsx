import React from 'react'
import { Outlet } from 'react-router-dom'
import StudentNavbar from '../components/common/StudentNavbar'
import StudentFooter from '../components/common/StudentFooter'

export default function StudentLayout() {
  return (
    <div className="student-root" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <StudentNavbar />
      <main style={{ flex: 1, paddingTop: 64 }}>
        <Outlet />
      </main>
      <StudentFooter />
    </div>
  )
}
