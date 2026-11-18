require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const Student = require('./models/Student');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');

const app = express();
app.use(cors());
app.use(express.json());
const router = express.Router();

const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
const duplicateMessage = (error, label) => error?.code === 11000 ? `${label} already exists.` : null;

router.get('/health', (req, res) => res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));

// Students
router.get('/students', asyncRoute(async (req, res) => {
  const filter = req.query.search ? { $or: [
    { name: { $regex: req.query.search, $options: 'i' } },
    { studentId: { $regex: req.query.search, $options: 'i' } }
  ] } : {};
  res.json(await Student.find(filter).sort({ name: 1 }));
}));
router.get('/students/:id', asyncRoute(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found.' });
  res.json(student);
}));
router.post('/students', asyncRoute(async (req, res) => {
  const { name, studentId, phone, zip } = req.body;
  if (![name, studentId, phone, zip].every(v => typeof v === 'string' && v.trim())) return res.status(400).json({ error: 'Name, student ID, phone, and ZIP code are required.' });
  try { res.status(201).json(await Student.create({ name, studentId, phone, zip })); }
  catch (error) { if (duplicateMessage(error, 'Student ID')) return res.status(409).json({ error: duplicateMessage(error, 'Student ID') }); throw error; }
}));
router.delete('/students/:id', asyncRoute(async (req, res) => {
  const student = await Student.findByIdAndDelete(req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found.' });
  await Enrollment.deleteMany({ student: student._id });
  res.json({ message: 'Student and related enrollments deleted.', student });
}));
router.post('/find-student', asyncRoute(async (req, res) => {
  const name = String(req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Student name is required.' });
  const student = await Student.findOne({ name: { $regex: `^${name.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}$`, $options: 'i' } });
  if (!student) return res.status(404).json({ error: 'Student not found.' });
  res.json(student);
}));

// Courses
router.get('/courses', asyncRoute(async (req, res) => res.json(await Course.find().sort({ courseId: 1 }))));
router.post('/courses', asyncRoute(async (req, res) => {
  const { courseId, courseName } = req.body;
  if (![courseId, courseName].every(v => typeof v === 'string' && v.trim())) return res.status(400).json({ error: 'Course ID and course name are required.' });
  try { res.status(201).json(await Course.create({ courseId, courseName })); }
  catch (error) { if (duplicateMessage(error, 'Course ID')) return res.status(409).json({ error: duplicateMessage(error, 'Course ID') }); throw error; }
}));
router.delete('/courses/:id', asyncRoute(async (req, res) => {
  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found.' });
  await Enrollment.deleteMany({ course: course._id });
  res.json({ message: 'Course and related enrollments deleted.', course });
}));

// Enrollments
router.get('/enrollments', asyncRoute(async (req, res) => {
  const filter = {};
  if (req.query.courseId) filter.course = req.query.courseId;
  res.json(await Enrollment.find(filter).populate('student').populate('course').sort({ createdAt: -1 }));
}));
router.post('/enrollments', asyncRoute(async (req, res) => {
  const { studentId, courseId } = req.body;
  if (!studentId || !courseId) return res.status(400).json({ error: 'Select both a student and a course.' });
  const [student, course] = await Promise.all([Student.findById(studentId), Course.findById(courseId)]);
  if (!student) return res.status(404).json({ error: 'Selected student does not exist.' });
  if (!course) return res.status(404).json({ error: 'Selected course does not exist.' });
  try { const enrollment = await Enrollment.create({ student: student._id, course: course._id }); res.status(201).json(await enrollment.populate(['student', 'course'])); }
  catch (error) { if (error.code === 11000) return res.status(409).json({ error: 'This student is already enrolled in that course.' }); throw error; }
}));
router.delete('/enrollments/:id', asyncRoute(async (req, res) => {
  const enrollment = await Enrollment.findByIdAndDelete(req.params.id);
  if (!enrollment) return res.status(404).json({ error: 'Enrollment not found.' });
  res.json({ message: 'Enrollment removed.' });
}));

app.use('/api', router);
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));
app.get(/.*/, (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
});
app.use((error, req, res, next) => {
  console.error(error);
  if (error.name === 'ValidationError' || error.name === 'CastError') return res.status(400).json({ error: error.message });
  res.status(500).json({ error: 'An unexpected server error occurred.' });
});

const PORT = process.env.PORT || 3000;
async function start() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing from the root .env file.');
  await mongoose.connect(process.env.MONGODB_URI);
  await Promise.all([Student.init(), Course.init(), Enrollment.init()]);
  app.listen(PORT, () => console.log(`Student Management System running at http://localhost:${PORT}`));
}
start().catch(error => { console.error('Unable to start application:', error.message); process.exit(1); });
