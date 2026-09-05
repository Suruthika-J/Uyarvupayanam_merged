import React, { useState, useEffect } from 'react'
import axiosInstance from '../../../config/axios'
import styles from '../AdminLayout.module.css'
import { FiEye, FiTrash2, FiEdit3, FiUser, FiCalendar, FiPhone, FiMail, FiCheckCircle, FiClock, FiXCircle, FiAlertCircle } from 'react-icons/fi'

export default function MentorRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReq, setSelectedReq] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)

  // Edit fields
  const [status, setStatus] = useState('')
  const [assignedMentor, setAssignedMentor] = useState('')
  const [adminNotes, setAdminNotes] = useState('')

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const res = await axiosInstance.get('/mentor-requests')
      setRequests(res.data.data || [])
    } catch (err) {
      console.error('Failed to fetch requests', err)
    } finally {
      setLoading(false)
    }
  }

  const handleView = (req) => {
    setSelectedReq(req)
    setStatus(req.status)
    setAssignedMentor(req.assignedMentor || '')
    setAdminNotes(req.adminNotes || '')
    setIsModalOpen(true)
  }

  const handleUpdate = async () => {
    setUpdateLoading(true)
    try {
      await axiosInstance.put(`/mentor-requests/${selectedReq._id}`, {
        status,
        assignedMentor,
        adminNotes
      })
      fetchRequests()
      setIsModalOpen(false)
    } catch (err) {
      alert('Failed to update request')
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return
    try {
      await axiosInstance.delete(`/mentor-requests/${id}`)
      fetchRequests()
    } catch (err) {
      alert('Failed to delete')
    }
  }

  const getStatusIcon = (s) => {
    switch (s) {
      case 'Completed': return <FiCheckCircle color="#10b981" />
      case 'In Progress': return <FiClock color="#3b82f6" />
      case 'Rejected': return <FiXCircle color="#ef4444" />
      default: return <FiAlertCircle color="#f59e0b" />
    }
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading Requests...</div>

  return (
    <div style={{ padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px 20px', fontSize: 13, color: '#64748b' }}>STUDENT</th>
              <th style={{ padding: '16px 20px', fontSize: 13, color: '#64748b' }}>CLASS</th>
              <th style={{ padding: '16px 20px', fontSize: 13, color: '#64748b' }}>INTEREST</th>
              <th style={{ padding: '16px 20px', fontSize: 13, color: '#64748b' }}>CONTACT</th>
              <th style={{ padding: '16px 20px', fontSize: 13, color: '#64748b' }}>STATUS</th>
              <th style={{ padding: '16px 20px', fontSize: 13, color: '#64748b' }}>DATE</th>
              <th style={{ padding: '16px 20px', fontSize: 13, color: '#64748b' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr><td colSpan="7" style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No guidance requests found</td></tr>
            ) : requests.map((req) => (
              <tr key={req._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>{req.studentName}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{req.email}</div>
                </td>
                <td style={{ padding: '16px 20px', fontSize: 14 }}>{req.classLevel}</td>
                <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 500 }}>{req.interest}</td>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: 13 }}>{req.phone}</div>
                  <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>via {req.preferredContact}</div>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
                    {getStatusIcon(req.status)}
                    {req.status}
                  </div>
                </td>
                <td style={{ padding: '16px 20px', fontSize: 13, color: '#64748b' }}>
                  {new Date(req.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => handleView(req)} style={{ background: '#f1f5f9', border: 'none', padding: 8, borderRadius: 6, cursor: 'pointer' }}><FiEye color="#475569" /></button>
                    <button onClick={() => handleDelete(req._id)} style={{ background: '#fef2f2', border: 'none', padding: 8, borderRadius: 6, cursor: 'pointer' }}><FiTrash2 color="#ef4444" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Request Details</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>&times;</button>
            </div>
            
            <div style={{ padding: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Student Name</label>
                  <div style={{ fontWeight: 600 }}>{selectedReq.studentName}</div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Class / Level</label>
                  <div style={{ fontWeight: 600 }}>{selectedReq.classLevel}</div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Contact Method</label>
                  <div style={{ fontWeight: 600 }}>{selectedReq.preferredContact}: {selectedReq.phone}</div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Email</label>
                  <div style={{ fontWeight: 600 }}>{selectedReq.email}</div>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Interest</label>
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, fontWeight: 600 }}>{selectedReq.interest}</div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Message</label>
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, fontSize: 14, lineHeight: 1.6 }}>{selectedReq.message}</div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '24px 0' }} />

              <h4 style={{ marginBottom: 16 }}>Update Status & Assignment</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Current Status</label>
                  <select 
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Assigned Mentor</label>
                  <input 
                    type="text" 
                    placeholder="Enter mentor name"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                    value={assignedMentor}
                    onChange={(e) => setAssignedMentor(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Admin Notes (Visible to Student)</label>
                <textarea 
                  rows="3"
                  placeholder="Add notes or feedback for the student..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', resize: 'none' }}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button 
                  onClick={handleUpdate}
                  disabled={updateLoading}
                  style={{ flex: 1, padding: '12px', borderRadius: 8, border: 'none', background: '#1e293b', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                >
                  {updateLoading ? 'Updating...' : 'Save Changes'}
                </button>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
