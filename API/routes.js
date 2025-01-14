//routes.js

const express = require('express');
const router = express.Router();
const { processJarFile } = require('./controllers');

// Основной маршрут для обработки JAR-файлов
router.post('/', processJarFile);

module.exports = router;