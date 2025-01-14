// controllers.js

const { processJar } = require('./fileProcessor');
const { validateParams } = require('./utils');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Директории для загрузки и обработки файлов
const tempUploadDir = 'uploads';
const tempDir = 'temp_processing';
fs.mkdirSync(tempDir, { recursive: true });
fs.mkdirSync(tempUploadDir, { recursive: true });

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
        if (path.extname(file.originalname) !== '.jar') {
            return cb(new Error('Допускаются только файлы с расширением .jar'));
        }
        cb(null, true);
    }
});

// Обработка загруженного JAR-файла
async function processJarFile(req, res) {
    const options = {
        fb: req.body.fb || 'no',
        cl: req.body.cl || 3,
        m: req.body.m || 'google',
        f: req.body.f || 'en',
        t: req.body.t || 'ru',
    };

    try {
        // Валидация входных параметров
        validateParams(options);

        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Необходимо загрузить файл .jar.' });
        }

        const jarPath = req.file.path;

        if (path.extname(jarPath) !== '.jar') {
            return res.status(400).json({ success: false, error: 'Файл должен иметь расширение .jar.' });
        }

        const uniqueTempDir = path.join(tempDir, path.basename(jarPath, path.extname(jarPath)) + '_' + Date.now());
        fs.mkdirSync(uniqueTempDir, { recursive: true });

        console.log(`jarPath: ${jarPath}, uniqueTempDir: ${uniqueTempDir}`);

        const result = await processJar(jarPath, uniqueTempDir, options, req.file.originalname);

        // Обработка результата
        if (result.success) {
            return res.download(result.finalJarPath, path.basename(result.finalJarPath), (err) => {
                if (err) {
                    console.error(`Ошибка при отправке файла: ${err.message}`);
                    return res.status(500).json({ success: false, error: 'Ошибка при отправке файла.' });
                }

                // Удаление файла после отправки
                fs.unlink(result.finalJarPath, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error(`Ошибка при удалении файла: ${unlinkErr.message}`);
                    } else {
                        console.log(`Файл ${result.finalJarPath} успешно удалён.`);
                    }
                });
            });
        } else {
            console.error(`Ошибка обработки файла: ${result.error}`);
            return res.status(400).json({ success: false, error: result.error });
        }
    } catch (err) {
        console.error(`Ошибка обработки: ${err.message}`);
        return res.status(500).json({ success: false, error: `Системная ошибка: ${err.message}` });
    }
}

module.exports = {
    processJarFile,
    upload,
};