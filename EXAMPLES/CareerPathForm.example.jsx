import React, { useState } from 'react'
import { careerPathService } from '../services/careerPathService'

export default function AddCareerPathForm() {
  const [formData, setFormData] = useState({
    title: '',
    ageGroup: '',
    level: '',
    careerDirections: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      // Convert comma-separated string to array
      const careerDirectionsArray = formData.careerDirections
        .split(',')
        .map(item => item.trim())
        .filter(item => item !== '')

      const payload = {
        title: formData.title,
        ageGroup: formData.ageGroup,
        level: formData.level,
        careerDirections: careerDirectionsArray,
        description: formData.description
      }

      const result = await careerPathService.createCareerPath(payload)

      if (result.success) {
        setMessage({ type: 'success', text: 'Career path added successfully!' })
        // Reset form
        setFormData({
          title: '',
          ageGroup: '',
          level: '',
          careerDirections: '',
          description: ''
        })
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to add career path' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2>Add Career Path</h2>

      {message.text && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '20px',
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24',
          borderRadius: '4px'
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Age Group</label>
          <input
            type="text"
            name="ageGroup"
            value={formData.ageGroup}
            onChange={handleChange}
            placeholder="e.g., 14-16 years"
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Level</label>
          <select
            name="level"
            value={formData.level}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="">Select Level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Career Directions (comma-separated)</label>
          <input
            type="text"
            name="careerDirections"
            value={formData.careerDirections}
            onChange={handleChange}
            placeholder="e.g., Engineering, Medicine, Arts"
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Adding...' : 'Add Career Path'}
        </button>
      </form>
    </div>
  )
}

// ============================================
// EXAMPLE: Fetch all career paths
// ============================================
export function CareerPathList() {
  const [careerPaths, setCareerPaths] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCareerPaths()
  }, [])

  const fetchCareerPaths = async () => {
    try {
      const result = await careerPathService.getAllCareerPaths()
      if (result.success) {
        setCareerPaths(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch career paths:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this career path?')) {
      return
    }

    try {
      const result = await careerPathService.deleteCareerPath(id)
      if (result.success) {
        setCareerPaths(careerPaths.filter(cp => cp._id !== id))
        alert('Career path deleted successfully')
      }
    } catch (error) {
      alert('Failed to delete career path')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h2>Career Paths</h2>
      {careerPaths.map(path => (
        <div key={path._id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '10px' }}>
          <h3>{path.title}</h3>
          <p><strong>Age Group:</strong> {path.ageGroup}</p>
          <p><strong>Level:</strong> {path.level}</p>
          <p><strong>Career Directions:</strong> {path.careerDirections.join(', ')}</p>
          <p>{path.description}</p>
          <button onClick={() => handleDelete(path._id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}
