//controllers.js
const { processJar, validateParams, path } = require('./utils');

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

        const result = await processJar(jarPath, options);

        if (result.success) {
            return res.download(result.finalJarPath, path.basename(result.finalJarPath), (err) => {
                if (err) {
                    console.error(`Ошибка при отправке файла: ${err.message}`);
                    return res.status(500).json({ success: false, error: 'Ошибка при отправке файла.' });
                }
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
};