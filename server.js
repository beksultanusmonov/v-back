const express = require('express')
const cors = require('cors')
const { readDb, updateDb } = require('./database.js')

const app = express()
const PORT = process.env.PORT || 4000

const allowedOrigins = String("https://your-job-by-isroilov.netlify.app", "http://localhost:5173")
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean)

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true)
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return callback(null, true)
      return callback(new Error('CORS_NOT_ALLOWED'))
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'vacancy-backend' })
})

function normalizeSalary(value) {
  const digitsOnly = String(value ?? '').replace(/[^\d]/g, '')
  if (!digitsOnly) return null
  const amount = Number(digitsOnly)
  return Number.isFinite(amount) && amount > 0 ? amount : null
}

function buildSeedCourses() {
  const lessonsByCourse = [
    {
      id: 'frontend-react',
      name: 'Frontend React Mastery',
      category: 'Frontend',
      teacher: 'Jasur Toshmatov',
      level: 'O‘rta',
      price: 'Bepul',
      gradient: 'from-indigo-600 via-indigo-700 to-slate-900',
      icon: '💻',
      lessons: [
        ['React Asoslari 1', 'w7ejDZ8SWv8'],
        ['React Hooks', 'TNhaISOUy6Q'],
        ['React Router', 'Law7wfdg_ls'],
        ['Tailwind UI', 'dFgzHOX84xQ'],
        ['Mini Project', 'Rh3tobg7hEo'],
      ],
    },
    {
      id: 'backend-node',
      name: 'Backend Node.js API',
      category: 'Backend',
      teacher: 'Bekzod Ismoilov',
      level: 'O‘rta',
      price: 'Bepul',
      gradient: 'from-emerald-600 via-teal-700 to-slate-900',
      icon: '🛠️',
      lessons: [
        ['Node Intro', 'fBNz5xF-Kx4'],
        ['Express CRUD', 'l8WPWK9mS5M'],
        ['Middleware', 'SccSCuHhOw0'],
        ['Auth Basics', '2jqok-WgelI'],
        ['REST Project', 'Oe421EPjeBE'],
      ],
    },
    {
      id: 'mobile-react-native',
      name: 'React Native Starter',
      category: 'Mobile',
      teacher: 'Sardor Qodirov',
      level: 'Boshlang‘ich',
      price: 'Bepul',
      gradient: 'from-cyan-600 via-sky-700 to-slate-900',
      icon: '📱',
      lessons: [
        ['RN Setup', '0-S5a0eXPoc'],
        ['RN Components', 'qSRrxpdMpVc'],
        ['Navigation', 'VozPNrt-LfE'],
        ['State Management', 'j942wKiXFu8'],
        ['API Integration', 'ur6I5m2nTvk'],
      ],
    },
    {
      id: 'ui-ux-figma',
      name: 'UI/UX Figma Pro',
      category: 'Dizayn',
      teacher: 'Madina Akbarova',
      level: 'O‘rta',
      price: 'Bepul',
      gradient: 'from-violet-600 via-indigo-700 to-slate-900',
      icon: '🎨',
      lessons: [
        ['Figma Basics', 'FTFaQWZBqQ8'],
        ['Wireframe', '1pW_sk-2y40'],
        ['Design System', 'NnQr6s5Vn6U'],
        ['Prototype', 'S4Kf9J0f2XY'],
        ['Portfolio UI', 'wIuVvCuiJhU'],
      ],
    },
    {
      id: 'qa-automation',
      name: 'QA Automation',
      category: 'QA',
      teacher: 'Nodir Rahimov',
      level: 'Boshlang‘ich',
      price: 'Bepul',
      gradient: 'from-rose-600 via-pink-700 to-slate-900',
      icon: '🧪',
      lessons: [
        ['QA Fundamentals', '7Qf4A2u7Q7A'],
        ['Test Case', 'lYh7NQ4mF-E'],
        ['Playwright Intro', '3e1GHCA3GP0'],
        ['API Testing', 'VywxIQ2ZXw4'],
        ['CI for QA', 'R8_veQiYBjI'],
      ],
    },
    {
      id: 'data-python',
      name: 'Python Data Analysis',
      category: 'Data Science',
      teacher: 'Dilshod Ergashev',
      level: 'O‘rta',
      price: 'Bepul',
      gradient: 'from-amber-600 via-orange-700 to-slate-900',
      icon: '🐍',
      lessons: [
        ['Python Intro', 'rfscVS0vtbw'],
        ['NumPy', 'QUT1VHiLmmI'],
        ['Pandas', 'vmEHCJofslg'],
        ['Data Viz', 'GpQoQW9FQUM'],
        ['ML Intro', 'i_LwzRVP7bg'],
      ],
    },
    {
      id: 'devops-basics',
      name: 'DevOps Basics',
      category: 'DevOps',
      teacher: 'Azizbek Karimov',
      level: 'Boshlang‘ich',
      price: 'Bepul',
      gradient: 'from-slate-700 via-slate-800 to-slate-900',
      icon: '⚙️',
      lessons: [
        ['DevOps Intro', '0yWAtQ6wYNM'],
        ['Linux Basics', 'sWbUDq4S6Y8'],
        ['Docker', '3c-iBn73dDE'],
        ['CI/CD', 'scEDHsr3APg'],
        ['Deploy Demo', 'gAkwW2tuIqE'],
      ],
    },
    {
      id: 'product-management',
      name: 'Product Management',
      category: 'Product',
      teacher: 'Muhammad Aliyev',
      level: 'O‘rta',
      price: 'Bepul',
      gradient: 'from-fuchsia-600 via-purple-700 to-slate-900',
      icon: '📈',
      lessons: [
        ['PM Intro', 'H9ejj7N2F4I'],
        ['Discovery', 'jY8m5fW4xJ4'],
        ['Roadmap', '0I6Qvfi5N1I'],
        ['Metrics', 'M0L0adfM0yY'],
        ['Stakeholder Mgmt', 'RG4Lh5W6Qh0'],
      ],
    },
    {
      id: 'marketing-digital',
      name: 'Digital Marketing',
      category: 'Marketing',
      teacher: 'Malika Yusupova',
      level: 'Boshlang‘ich',
      price: 'Bepul',
      gradient: 'from-lime-600 via-green-700 to-slate-900',
      icon: '📣',
      lessons: [
        ['Marketing Intro', 'nU-IIXBWlS4'],
        ['SMM Basics', 'bixR-KIJKYM'],
        ['Targeting', '2N2nIkAB-0A'],
        ['Content Strategy', '4q7nV8J4v8U'],
        ['Analytics', 'f2G9wP2w48Q'],
      ],
    },
    {
      id: 'cyber-security',
      name: 'Cyber Security Basics',
      category: 'Security',
      teacher: 'Sherzod Nurmatov',
      level: 'Boshlang‘ich',
      price: 'Bepul',
      gradient: 'from-red-700 via-rose-800 to-slate-900',
      icon: '🔐',
      lessons: [
        ['Security Intro', 'inWWhr5tnEA'],
        ['OWASP', '3Kq1MIfTWCE'],
        ['Auth Security', '8ZtInClXe1Q'],
        ['SQLi/XSS', 'ciNHn38EyRc'],
        ['Best Practices', 'n3N0fYk6m3Q'],
      ],
    },
  ]

  return lessonsByCourse.map((course, idx) => ({
    id: idx + 1,
    slug: course.id,
    name: course.name,
    description: `${course.category} yo‘nalishi bo‘yicha amaliy video darslar.`,
    price: course.price,
    duration: '10 soat',
    lessons: `${course.lessons.length} dars`,
    level: course.level,
    teacher: course.teacher,
    rating: '4.9',
    reviews: '1,000+',
    progress: 0,
    status: 'Faol',
    icon: course.icon,
    gradient: course.gradient,
    category: course.category,
    videoLessons: course.lessons.map(([title, youtubeId], lessonIdx) => ({
      id: `${idx + 1}-${lessonIdx + 1}`,
      title,
      youtubeUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
      youtubeId,
    })),
  }))
}

async function ensureCourseCatalog() {
  await updateDb((db) => {
    const existingCourses = Array.isArray(db.courses) ? db.courses : []
    const needsSeed = existingCourses.length < 10 || existingCourses.some((item) => !Array.isArray(item.videoLessons) || item.videoLessons.length < 5)
    const courses = needsSeed ? buildSeedCourses() : existingCourses
    return {
      ...db,
      courses,
      courseProgress: Array.isArray(db.courseProgress) ? db.courseProgress : [],
      certificates: Array.isArray(db.certificates) ? db.certificates : [],
    }
  })
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'vacancy-backend' })
})

app.get('/api/vacancies', async (_req, res) => {
  const db = await readDb()
  res.json(db.vacancies || [])
})

app.get('/api/vacancies/:id', async (req, res) => {
  const db = await readDb()
  const vacancy = (db.vacancies || []).find((item) => String(item.id) === String(req.params.id))
  if (!vacancy) return res.status(404).json({ message: 'Vacancy topilmadi' })
  return res.json(vacancy)
})

app.post('/api/vacancies', async (req, res) => {
  const payload = req.body || {}
  const normalizedSalary = normalizeSalary(payload.salary)
  let newVacancy = null
  await updateDb((db) => {
    const vacancies = db.vacancies || []
    const maxId = vacancies.reduce((max, item) => {
      const numericId = Number(item.id)
      if (Number.isFinite(numericId)) return Math.max(max, numericId)
      return max
    }, 0)
    newVacancy = {
      ...payload,
      salary: normalizedSalary,
      id: maxId + 1,
      ownerUserId: payload.ownerUserId || null,
      applicantsList: Array.isArray(payload.applicantsList) ? payload.applicantsList : [],
      updatedAt: new Date().toISOString(),
    }
    return {
      ...db,
      vacancies: [newVacancy, ...vacancies],
    }
  })

  res.status(201).json(newVacancy)
})

app.post('/api/vacancies/:id/apply', async (req, res) => {
  const payload = req.body || {}
  const applicantUserId = String(payload.userId || '').trim()
  const applicantEmail = String(payload.email || '').trim().toLowerCase()
  if (!applicantUserId && !applicantEmail) return res.status(400).json({ message: 'User ID yoki email majburiy.' })

  let appliedCandidate = null
  let foundVacancy = false

  await updateDb((db) => {
    const resumes = db.resumes || []
    const resumeIndex = resumes.findIndex((item) => {
      if (applicantUserId && String(item.userId || '') === applicantUserId) return true
      return String(item.email || '').toLowerCase() === applicantEmail
    })
    if (resumeIndex < 0) return db
    const existingResume = resumes[resumeIndex]
    const resumeId = existingResume.id || `res-${Date.now()}`
    const resume = existingResume.id ? existingResume : { ...existingResume, id: resumeId }
    if (!existingResume.id) resumes[resumeIndex] = resume

    const vacancies = (db.vacancies || []).map((item) => {
      if (String(item.id) !== String(req.params.id)) return item
      foundVacancy = true

      const applicantsList = Array.isArray(item.applicantsList) ? item.applicantsList : []
      const existingIndex = applicantsList.findIndex((candidate) => {
        if (applicantUserId && String(candidate.userId || '') === applicantUserId) return true
        return String(candidate.email || '').toLowerCase() === applicantEmail
      })
      if (existingIndex >= 0) {
        appliedCandidate = { ...applicantsList[existingIndex], alreadyApplied: true }
        return item
      }

      const candidatePayload = {
        id: `cand-${Date.now()}`,
        fullName: payload.fullName || resume.fullName || 'Nomalum nomzod',
        userId: applicantUserId || resume.userId || null,
        email: applicantEmail || String(resume.email || '').toLowerCase(),
        resumeId,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      }

      applicantsList.unshift(candidatePayload)
      appliedCandidate = candidatePayload

      return {
        ...item,
        applicantsList,
        updatedAt: new Date().toISOString(),
      }
    })

    return { ...db, resumes, vacancies }
  })

  if (!foundVacancy) return res.status(404).json({ message: 'Vacancy topilmadi.' })
  if (!appliedCandidate) return res.status(400).json({ message: 'Avval resume ni saqlang.' })
  if (appliedCandidate.alreadyApplied) {
    return res.status(409).json({ message: 'Siz bu vakansiyaga avval topshirgansiz.' })
  }

  return res.json(appliedCandidate)
})

app.delete('/api/vacancies/:id/apply', async (req, res) => {
  const payload = req.body || {}
  const applicantUserId = String(payload.userId || '').trim()
  const applicantEmail = String(payload.email || '').trim().toLowerCase()
  if (!applicantUserId && !applicantEmail) {
    return res.status(400).json({ message: 'User ID yoki email majburiy.' })
  }

  let foundVacancy = false
  let removed = false

  await updateDb((db) => {
    const vacancies = (db.vacancies || []).map((item) => {
      if (String(item.id) !== String(req.params.id)) return item
      foundVacancy = true
      const applicantsList = Array.isArray(item.applicantsList) ? item.applicantsList : []
      const nextApplicants = applicantsList.filter((candidate) => {
        const sameByUserId = applicantUserId && String(candidate.userId || '') === applicantUserId
        const sameByEmail = String(candidate.email || '').toLowerCase() === applicantEmail
        const shouldRemove = sameByUserId || sameByEmail
        if (shouldRemove) removed = true
        return !shouldRemove
      })
      if (!removed) return item
      return {
        ...item,
        applicantsList: nextApplicants,
        updatedAt: new Date().toISOString(),
      }
    })
    return { ...db, vacancies }
  })

  if (!foundVacancy) return res.status(404).json({ message: 'Vacancy topilmadi.' })
  if (!removed) return res.status(404).json({ message: 'Topshirilgan ariza topilmadi.' })

  return res.json({ ok: true })
})

app.put('/api/vacancies/:id', async (req, res) => {
  const payload = req.body || {}
  const normalizedSalary = Object.prototype.hasOwnProperty.call(payload, 'salary')
    ? normalizeSalary(payload.salary)
    : undefined
  let found = false

  await updateDb((db) => {
    const vacancies = (db.vacancies || []).map((item) => {
      if (String(item.id) !== String(req.params.id)) return item
      found = true
      return {
        ...item,
        ...payload,
        ...(normalizedSalary !== undefined ? { salary: normalizedSalary } : {}),
        id: item.id,
        updatedAt: new Date().toISOString(),
      }
    })
    return { ...db, vacancies }
  })

  if (!found) return res.status(404).json({ message: 'Vacancy topilmadi' })
  return res.json({ ok: true })
})

app.get('/api/courses', async (_req, res) => {
  const db = await readDb()
  res.json(db.courses || [])
})

app.get('/api/courses/:id', async (req, res) => {
  const db = await readDb()
  const course = (db.courses || []).find((item) => String(item.id) === String(req.params.id))
  if (!course) return res.status(404).json({ message: 'Kurs topilmadi.' })
  return res.json(course)
})

app.get('/api/courses/:id/progress', async (req, res) => {
  const userId = String(req.query.userId || '').trim()
  if (!userId) return res.status(400).json({ message: 'userId majburiy.' })
  const db = await readDb()
  const progress = (db.courseProgress || []).find(
    (item) => String(item.userId) === userId && String(item.courseId) === String(req.params.id)
  )
  return res.json(progress || { userId, courseId: req.params.id, completedLessonIds: [], completed: false })
})

app.post('/api/courses/:id/complete-lesson', async (req, res) => {
  const payload = req.body || {}
  const userId = String(payload.userId || '').trim()
  const lessonId = String(payload.lessonId || '').trim()
  const providedFullName = String(payload.fullName || '').trim()
  if (!userId || !lessonId) return res.status(400).json({ message: 'userId va lessonId majburiy.' })

  let updatedProgress = null
  let certificate = null
  await updateDb((db) => {
    const courses = db.courses || []
    const course = courses.find((item) => String(item.id) === String(req.params.id))
    if (!course) return db

    const allLessonIds = (course.videoLessons || []).map((lesson) => String(lesson.id))
    if (!allLessonIds.includes(lessonId)) return db

    const courseProgress = Array.isArray(db.courseProgress) ? [...db.courseProgress] : []
    const index = courseProgress.findIndex((item) => String(item.userId) === userId && String(item.courseId) === String(req.params.id))
    const current = index >= 0 ? courseProgress[index] : { userId, courseId: course.id, completedLessonIds: [], completed: false }
    const mergedLessons = [...new Set([...(current.completedLessonIds || []), lessonId])]
    const completed = mergedLessons.length === allLessonIds.length
    updatedProgress = { ...current, completedLessonIds: mergedLessons, completed, updatedAt: new Date().toISOString() }
    if (index >= 0) courseProgress[index] = updatedProgress
    else courseProgress.unshift(updatedProgress)

    const certificates = Array.isArray(db.certificates) ? [...db.certificates] : []
    if (completed) {
      const existingCert = certificates.find(
        (item) => String(item.userId) === userId && String(item.courseId) === String(course.id)
      )
      if (!existingCert) {
        const user = (db.users || []).find((item) => String(item.id) === userId)
        certificate = {
          id: `cert-${Date.now()}`,
          userId,
          courseId: course.id,
          fullName: user?.fullName || providedFullName || 'Foydalanuvchi',
          courseName: course.name,
          issuedAt: new Date().toISOString(),
        }
        certificates.unshift(certificate)
      }
    }

    return {
      ...db,
      courseProgress,
      certificates,
    }
  })

  if (!updatedProgress) return res.status(404).json({ message: 'Kurs yoki dars topilmadi.' })
  return res.json({ progress: updatedProgress, certificate })
})

app.get('/api/certificates', async (req, res) => {
  const userId = String(req.query.userId || '').trim()
  if (!userId) return res.status(400).json({ message: 'userId majburiy.' })
  const db = await readDb()
  const certificates = (db.certificates || []).filter((item) => String(item.userId) === userId)
  return res.json(certificates)
})

app.get('/api/faqs', async (_req, res) => {
  const db = await readDb()
  res.json(db.faqs || [])
})

app.get('/api/stats', async (_req, res) => {
  const db = await readDb()
  const vacancies = db.vacancies || []
  const courses = db.courses || []
  const activeVacancies = vacancies.filter((item) => item.status !== 'inactive').length
  const registeredCandidates = vacancies.reduce((sum, item) => {
    if (Array.isArray(item.applicantsList)) return sum + item.applicantsList.length
    return sum + (item.applicants || 0)
  }, 0)
  const partnerCompanies = new Set(vacancies.map((item) => item.company).filter(Boolean)).size
  const courseDirections = new Set(courses.map((item) => item.category).filter(Boolean)).size

  res.json({
    activeVacancies,
    registeredCandidates,
    partnerCompanies,
    courseDirections,
  })
})

app.post('/api/auth/register', async (req, res) => {
  const payload = req.body || {}
  if (!payload.email || !payload.password) {
    return res.status(400).json({ message: 'Email va parol majburiy.' })
  }

  let createdUser = null
  await updateDb((db) => {
    const users = db.users || []
    const exists = users.some((item) => item.email === payload.email)
    if (exists) return db
    const maxUserId = users.reduce((max, item) => {
      const numericId = Number(item.id)
      if (Number.isFinite(numericId)) return Math.max(max, numericId)
      return max
    }, 0)
    createdUser = {
      id: maxUserId + 1,
      role: payload.role || 'employee',
      fullName: payload.fullName || '',
      companyName: payload.companyName || '',
      email: payload.email,
      password: payload.password,
      createdAt: new Date().toISOString(),
    }
    return { ...db, users: [createdUser, ...users] }
  })

  if (!createdUser) return res.status(409).json({ message: 'Bu email allaqachon mavjud.' })
  const { password, ...safeUser } = createdUser
  return res.status(201).json(safeUser)
})

app.post('/api/auth/login', async (req, res) => {
  const payload = req.body || {}
  const db = await readDb()
  const user = (db.users || []).find((item) => item.email === payload.email && item.password === payload.password)
  if (!user) return res.status(401).json({ message: 'Email yoki parol noto‘g‘ri.' })
  const { password, ...safeUser } = user
  return res.json(safeUser)
})

app.post('/api/auth/change-password', async (req, res) => {
  const payload = req.body || {}
  const email = String(payload.email || '').trim().toLowerCase()
  const currentPassword = String(payload.currentPassword || '')
  const newPassword = String(payload.newPassword || '')

  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Email, joriy parol va yangi parol majburiy.' })
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'Yangi parol kamida 8 ta belgidan iborat bo‘lishi kerak.' })
  }
  if (currentPassword === newPassword) {
    return res.status(400).json({ message: 'Yangi parol avvalgisidan farq qilishi kerak.' })
  }

  let isUpdated = false
  let userExists = false
  let currentPasswordValid = false

  await updateDb((db) => {
    const users = (db.users || []).map((item) => {
      if (String(item.email || '').toLowerCase() !== email) return item
      userExists = true
      if (item.password !== currentPassword) return item
      currentPasswordValid = true
      isUpdated = true
      return {
        ...item,
        password: newPassword,
      }
    })
    return { ...db, users }
  })

  if (!userExists) return res.status(404).json({ message: 'Foydalanuvchi topilmadi.' })
  if (!currentPasswordValid) return res.status(401).json({ message: 'Joriy parol noto‘g‘ri.' })
  if (!isUpdated) return res.status(500).json({ message: 'Parolni yangilashda xatolik.' })

  return res.json({ ok: true, message: 'Parol muvaffaqiyatli yangilandi.' })
})

app.get('/api/resume', async (req, res) => {
  const userId = String(req.query.userId || '').trim()
  const email = String(req.query.email || '').trim().toLowerCase()
  if (!email && !userId) return res.status(400).json({ message: 'Email yoki userId majburiy.' })
  const db = await readDb()
  const resumes = db.resumes || []
  const resume = resumes.find((item) => {
    if (userId && String(item.userId || '') === userId) return true
    return String(item.email || '').toLowerCase() === email
  })
  return res.json(resume || null)
})

app.get('/api/resumes/:id', async (req, res) => {
  const resumeId = String(req.params.id || '').trim()
  if (!resumeId) return res.status(400).json({ message: 'Resume ID majburiy.' })
  const db = await readDb()
  const resume = (db.resumes || []).find((item) => String(item.id || '') === resumeId)
  if (!resume) return res.status(404).json({ message: 'Resume topilmadi.' })
  return res.json(resume)
})

app.post('/api/resume', async (req, res) => {
  const payload = req.body || {}
  const userId = String(payload.userId || '').trim()
  const email = String(payload.email || '').trim().toLowerCase()
  if (!email && !userId) return res.status(400).json({ message: 'Email yoki userId majburiy.' })

  let savedResume = null
  await updateDb((db) => {
    const resumes = db.resumes || []
    const next = {
      ...payload,
      id: payload.id || `res-${Date.now()}`,
      userId: userId || null,
      email,
      updatedAt: new Date().toISOString(),
    }
    const existingIndex = resumes.findIndex((item) => {
      if (userId && String(item.userId || '') === userId) return true
      return String(item.email || '').toLowerCase() === email
    })
    if (existingIndex >= 0) {
      resumes[existingIndex] = { ...resumes[existingIndex], ...next, id: resumes[existingIndex].id || next.id }
      savedResume = resumes[existingIndex]
    } else {
      resumes.unshift(next)
      savedResume = next
    }
    return { ...db, resumes }
  })

  return res.json(savedResume)
})

;(async () => {
  await ensureCourseCatalog()
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend server running on http://localhost:${PORT}`)
  })
})()
