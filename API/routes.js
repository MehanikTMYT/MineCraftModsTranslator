//routes.js
const {express, processJarFile } = require('./utils');

const router = express.Router();

// Основной маршрут для обработки JAR-файлов
router.post('/', processJarFile);

module.exports = router;