import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'
export const useManagementStore = defineStore('management', () => {
  const students = ref([]), courses = ref([]), enrollments = ref([])
  const loading = ref(false)
  async function loadStudents(search = '') { loading.value = true; try { students.value = (await api.get('/students', { params: search ? { search } : {} })).data } finally { loading.value = false } }
  async function loadCourses() { courses.value = (await api.get('/courses')).data }
  async function loadEnrollments(courseId = '') { enrollments.value = (await api.get('/enrollments', { params: courseId ? { courseId } : {} })).data }
  async function addStudent(data) { const result = (await api.post('/students', data)).data; await loadStudents(); return result }
  async function deleteStudent(id) { await api.delete(`/students/${id}`); await Promise.all([loadStudents(), loadEnrollments()]) }
  async function addCourse(data) { const result = (await api.post('/courses', data)).data; await loadCourses(); return result }
  async function deleteCourse(id) { await api.delete(`/courses/${id}`); await Promise.all([loadCourses(), loadEnrollments()]) }
  async function addEnrollment(data) { const result = (await api.post('/enrollments', data)).data; await loadEnrollments(); return result }
  async function deleteEnrollment(id) { await api.delete(`/enrollments/${id}`); await loadEnrollments() }
  return { students, courses, enrollments, loading, loadStudents, loadCourses, loadEnrollments, addStudent, deleteStudent, addCourse, deleteCourse, addEnrollment, deleteEnrollment }
})
