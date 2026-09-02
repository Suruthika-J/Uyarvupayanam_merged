import studentApi from './studentApi'

export const authService = {
  signup:        (data) => studentApi.post('/student/auth/signup', data).then(r => r.data),
  login:         (data) => studentApi.post('/student/auth/login',  data).then(r => r.data),
  getProfile:    ()     => studentApi.get('/student/profile').then(r => r.data),
  updateProfile: (data) => studentApi.put('/student/profile', data).then(r => r.data),
}

export const notificationService = {
  getAll:                ()   => studentApi.get('/notifications').then(r => r.data),
  getUserNotifications:  (userId) => studentApi.get(`/notifications/user/${userId}`).then(r => r.data),
  markRead:              (id) => studentApi.put(`/notifications/${id}/read`).then(r => r.data),
  markAllRead:           ()   => studentApi.put('/notifications/read-all').then(r => r.data),
}

export const collegeService = {
  getAll:  (params) => studentApi.get('/colleges', { params }).then(r => r.data),
  getById: (id)     => studentApi.get(`/colleges/${id}`).then(r => r.data),
  getOfferedCourses: (id) => studentApi.get(`/colleges/${id}/offered-courses`).then(r => r.data),
}

export const careerService = {
  getAll:     (params) => studentApi.get('/career-paths', { params }).then(r => r.data),
  getByLevel: (level) => studentApi.get('/career-paths', { params: { level } }).then(r => r.data),
  getById:    (id) => studentApi.get(`/career-paths/${id}`).then(r => r.data),
}

export const courseService = {
  getAll:        (params) => studentApi.get('/courses', { params }).then(r => r.data),
  getByCategory: (cat)    => studentApi.get('/courses', { params: { category: cat } }).then(r => r.data),
  getByLevel:    (level)  => studentApi.get('/courses', { params: { level } }).then(r => r.data),
  getStudentCourseDetails: (courseId) => studentApi.get(`/student/courses/${courseId}`).then(r => r.data),
}

export const examService = {
  getAll: (params) => studentApi.get('/exams', { params }).then(r => r.data),
}

export const scholarshipService = {
  getAll: (params) => studentApi.get('/scholarships', { params }).then(r => r.data),
  getById: (id) => {
    console.log("Service: scholarshipService.getById called, API URL:", `http://localhost:5000/api/scholarships/${id}`);
    return studentApi.get(`/scholarships/${id}`).then(r => r.data);
  },
}

export { mentorRequestService } from './mentorRequestService'
