//app.js
const express = require('express');
const routes = require('./routes');
const { upload } = require('./controllers');

const app = express();
const PORT = process.env.PORT || 8150;

// Middleware для обработки JSON
app.use(express.json());

// Маршруты обработки JAR-файлов
app.use('/process', upload.single('jarFile'), routes);

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
