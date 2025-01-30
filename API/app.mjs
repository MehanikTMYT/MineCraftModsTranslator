// app.mjs
import express from 'express';
import multer from 'multer';
import path from 'path';
import { tempUploadDir } from './utils.mjs';
import router from './routes.mjs';

const app = express();
const PORT = process.env.PORT || 8250;

// Настройка Multer для обработки загрузок
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempUploadDir);
  },
  filename: (req, file, cb) => {
    const originalFileName = file.originalname;
    const uniqueFileName = `${path.basename(originalFileName, path.extname(originalFileName))}_${Date.now()}_${Math.floor(Math.random() * 10000)}.jar`;
    cb(null, uniqueFileName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() !== '.jar') {
      return cb(new Error('Допускаются только файлы с расширением .jar'));
    }
    cb(null, true);
  }
});

// Middleware для обработки JSON
app.use(express.json());

// Middleware для обработки multipart/form-data (для загрузки файлов)
app.use(express.urlencoded({ extended: true }));

// Маршруты обработки JAR-файлов
app.use('/process', upload.single('jarFile'), router);

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});