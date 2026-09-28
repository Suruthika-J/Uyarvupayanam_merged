import axios from 'axios'

const studentApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 12000,
})

studentApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('studentToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

studentApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('studentToken')
      localStorage.removeItem('studentData')
      window.location.href = '/student/signin'
    }
    return Promise.reject(err)
  }
)

export default studentApi
