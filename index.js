import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import cors from 'cors'

const app = express()
app.use(cors())

// 📁 إنشاء فولدر files لو مش موجود
if (!fs.existsSync('files')) {
  fs.mkdirSync('files')
}

// 🔥 توليد اسم عشوائي
function randomName(ext) {
  return crypto.randomBytes(4).toString('hex') + ext
}

// ⚙️ إعداد التخزين
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'files/')
  },
  filename: (req, file, cb) => {
    let ext = path.extname(file.originalname)

    // 💣 لو مفيش امتداد (زي واتساب)
    if (!ext) {
      ext = '.bin'
    }

    cb(null, randomName(ext))
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 } // 200MB
})

// 🚀 API رفع
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.json({ status: false, message: 'no file' })
  }

  const url = `${req.protocol}://${req.get('host')}/${req.file.filename}`

  res.json({
    status: true,
    url
  })
})

// 📂 عرض الملفات
app.use('/', express.static('files'))

// 🏠 عرض الموقع
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/index.html')
})

// ❌ Error handling
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.json({ status: false, message: 'حجم الملف كبير (200MB max)' })
  }
  res.json({ status: false, message: 'خطأ في السيرفر' })
})

// ▶️ تشغيل السيرفر
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})