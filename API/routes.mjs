// routes.mjs
import express from 'express';
import { processJarFile } from './controllers.mjs';

const router = express.Router();

// Основной маршрут для обработки JAR-файлов
router.post('/', processJarFile);

export default router;