//app.js
const {express, router, upload } = require('./utils');

const app = express();
const PORT = process.env.PORT || 8150;

// Middleware для обработки JSON
app.use(express.json());

// Маршруты обработки JAR-файлов
app.use('/process', upload.single('jarFile'), router);

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});