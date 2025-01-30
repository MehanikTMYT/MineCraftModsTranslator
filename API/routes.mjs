// routes.mjs
import express from 'express';
import { processJarFile } from './controllers.js';

const router = express.Router();

// Основной маршрут для обработки JAR-файлов
router.post('/', processJarFile);

export default router;