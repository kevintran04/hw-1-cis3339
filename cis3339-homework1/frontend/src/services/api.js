import axios from 'axios'
const api = axios.create({ baseURL: '/api', headers: { 'Content-Type': 'application/json' } })
api.interceptors.response.use(r => r, error => {
  const message = error.response?.data?.error || 'Unable to connect to the server. Check that the backend and MongoDB are running.'
  return Promise.reject(new Error(message))
})
export default api
