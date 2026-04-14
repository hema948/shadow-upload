import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import cors from 'cors'

const app = express()
app.use(cors())

// إنشاء مجلد files لو مش موجود
if (!fs.existsSync('files')) {
  fs.mkdirSync('files')
}

// اسم عشوائي زي catbox
function randomName(ext) {
  return crypto.randomBytes(3).toString('hex') + ext
}

// إعداد multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'files/')
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, randomName(ext))
  }
})

const upload = multer({ storage })

// API رفع
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.json({ status: false })

  const url = `http://shadow-gardem.duckdns.org:3000/${req.file.filename}`

  res.json({
    status: true,
    url
  })
})

// عرض الملفات
app.use('/', express.static('files'))

// الصفحة الرئيسية
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/index.html')
})

// تشغيل السيرفر
app.listen(process.env.PORT || 3000, () => {
  console.log('🔥 Shadow Upload شغال')
})