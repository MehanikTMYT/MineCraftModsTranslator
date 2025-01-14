//fileProcessor.js
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const { translate } = require('./utils');

async function processJar(jarPath, uniqueTempDir, options, originalFileName) {
    try {
        let zip;

        // Попытка распаковки JAR файла
        try {
            zip = new AdmZip(jarPath);
            zip.extractAllTo(uniqueTempDir, true); // true для перезаписи существующих файлов
        } catch (err) {
            const errorMessage = `Ошибка: архив повреждён или не может быть распознан (${originalFileName}). ${err.message}. Пропускается.`;
            console.error(errorMessage);
            safeDelete(jarPath);
            return { success: false, error: errorMessage, fileName: originalFileName };
        }

        console.log(`Файлы успешно извлечены в ${uniqueTempDir}`);

        // Проверка наличия папки assets
        const assetsDir = path.join(uniqueTempDir, 'assets');
        if (!fs.existsSync(assetsDir)) {
            const errorMessage = `Ошибка: отсутствует папка "assets" в архиве (${originalFileName}). Пропускается.`;
            console.error(errorMessage);
            safeDelete(jarPath);
            safeDelete(uniqueTempDir, true);
            return { success: false, error: errorMessage, fileName: originalFileName };
        }

        // Поиск и обработка папок lang
        const langDirs = findLangDirectories(assetsDir);
        if (langDirs.length === 0) {
            const errorMessage = `Ошибка: отсутствует папка "lang" в архиве (${originalFileName}). Пропускается.`;
            console.error(errorMessage);
            safeDelete(jarPath);
            safeDelete(uniqueTempDir, true);
            return { success: false, error: errorMessage, fileName: originalFileName };
        }

        for (const langDir of langDirs) {
            console.log(`Обработка папки: ${langDir}`);
            const enUsFile = path.join(langDir, 'en_us.json');
            const ruRuFile = path.join(langDir, 'ru_ru.json');

            if (fs.existsSync(enUsFile)) {
                try {
                    const translatedDict = await translate(enUsFile, options);
                    if (translatedDict) {
                        fs.writeFileSync(ruRuFile, JSON.stringify(translatedDict, null, 4), 'utf8');
                        console.log(`Файл сохранён: ${ruRuFile}`);
                    }
                } catch (translationErr) {
                    const errorMessage = `Ошибка при переводе файла ${enUsFile}: ${translationErr.message}`;
                    console.error(errorMessage);
                    return { success: false, error: errorMessage, fileName: originalFileName };
                }
            } else {
                console.warn(`Файл "en_us.json" отсутствует в папке ${langDir}`);
                return { success: false, error: 'Файл "en_us.json" не найден.', fileName: originalFileName };
            }
        }

        // Создание нового JAR файла
        const newJarName = `${path.basename(originalFileName, path.extname(originalFileName))}_modified.jar`;
        const newJarPath = path.join(__dirname, newJarName);

        try {
            await createJar(uniqueTempDir, newJarPath);
        } catch (err) {
            const errorMessage = `Ошибка при создании нового JAR файла: ${err.message}`;
            console.error(errorMessage);
            return { success: false, error: errorMessage, fileName: originalFileName };
        }

        // Удаление исходного файла и временной директории
        safeDelete(jarPath);
        safeDelete(uniqueTempDir, true);

        console.log(`Обработка завершена. Новый JAR файл: ${newJarPath}`);
        return { success: true, finalJarPath: newJarPath, fileName: originalFileName };

    } catch (err) {
        const errorMessage = `Ошибка при обработке JAR: ${err.message}`;
        console.error(errorMessage);
        return { success: false, error: errorMessage, fileName: originalFileName };
    }
}

/**
 * Безопасное удаление файла или директории
 * @param {string} targetPath - Путь к файлу или директории
 * @param {boolean} [isDirectory=false] - Указывает, является ли путь директорией
 */
function safeDelete(targetPath, isDirectory = false) {
    try {
        if (isDirectory) {
            fs.rmSync(targetPath, { recursive: true, force: true });
        } else {
            fs.unlinkSync(targetPath);
        }
        console.log(`Удалено: ${targetPath}`);
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.warn(`Не найдено для удаления: ${targetPath}`);
        } else {
            console.error(`Ошибка при удалении ${targetPath}: ${err.message}`);
        }
    }
}

function findLangDirectories(dir) {
    const langDirs = [];
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const itemPath = path.join(dir, item);
        if (fs.statSync(itemPath).isDirectory()) {
            if (item === 'lang') {
                langDirs.push(itemPath);
            } else {
                langDirs.push(...findLangDirectories(itemPath));
            }
        }
    }
    return langDirs;
}

function createJar(sourceDir, outPath) {
    return new Promise((resolve, reject) => {
        try {
            const zip = new AdmZip();
            function addFilesToZip(dir, baseDir) {
                const files = fs.readdirSync(dir);
                for (const file of files) {
                    const filePath = path.join(dir, file);
                    const relativePath = path.relative(baseDir, filePath);
                    if (fs.statSync(filePath).isDirectory()) {
                        addFilesToZip(filePath, baseDir);
                    } else {
                        zip.addLocalFile(filePath, path.dirname(relativePath));
                    }
                }
            }
            addFilesToZip(sourceDir, sourceDir);
            zip.writeZip(outPath);
            console.log(`JAR архив создан: ${outPath}`);
            resolve();
        } catch (err) {
            console.error(`Ошибка при создании архива: ${err.message}`);
            reject(err);
        }
    });
}

module.exports = {
    processJar,
};
