    //fileProcessor.js
    const { fs, path, tempDir, AdmZip, translate, safeDelete } = require('./utils');

    async function processJar(jarPath, options) {
        const uniqueTempDir = path.join(tempDir, path.basename(jarPath, path.extname(jarPath)) + '_' + Date.now());
        fs.mkdirSync(uniqueTempDir, { recursive: true });

        try {
            const zip = new AdmZip(jarPath);
            zip.extractAllTo(uniqueTempDir, true);

            const assetsDir = path.join(uniqueTempDir, 'assets');
            if (!fs.existsSync(assetsDir)) {
                const errorMessage = 'Ошибка: отсутствует папка "assets" в архиве. Перевод файла будет пропущен';
                console.error(errorMessage);
                safeDelete(jarPath);
                safeDelete(uniqueTempDir, true);
                return { success: false, error: errorMessage };
            }

            const langDirs = findLangDirectories(assetsDir);
            if (langDirs.length === 0) {
                const errorMessage = 'Ошибка: отсутствует папка "lang" в архиве. Перевод файла будет пропущен';
                console.error(errorMessage);
                safeDelete(jarPath);
                safeDelete(uniqueTempDir, true);
                return { success: false, error: errorMessage };
            }

            for (const langDir of langDirs) {
                const enUsFile = path.join(langDir, 'en_us.json');
                const ruRuFile = path.join(langDir, 'ru_ru.json');
                if (fs.existsSync(enUsFile)) {
                    try {
                        const translatedDict = await translate(enUsFile, options);
                        if (translatedDict) {                          
                            fs.writeFileSync(ruRuFile, JSON.stringify(translatedDict, null, 4), 'utf8');
                        }
                    } catch (err) {
                        const errorMessage = `Ошибка при переводе файла ${enUsFile}: ${err.message}`;
                        console.error(errorMessage);
                        return { success: false, error: errorMessage };
                    }
                }
            }

            const newJarName = `${path.basename(jarPath, path.extname(jarPath))}_modified.jar`;
            const newJarPath = path.join(__dirname, newJarName);
            
            await createJar(uniqueTempDir, newJarPath);
            safeDelete(jarPath);
            safeDelete(uniqueTempDir, true);

            return { success: true, finalJarPath: newJarPath };
        } catch (err) {
            const errorMessage = `Ошибка при обработке JAR: ${err.message}`;
            console.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    }

    function findLangDirectories(dir) {
        const langDirs = [];
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const itemPath = path.join(dir, item);
            if (fs.statSync(itemPath).isDirectory() && item === 'lang') {
                langDirs.push(itemPath);
            }
        }
        return langDirs;
    }

    function createJar(sourceDir, outPath) {
        return new Promise((resolve, reject) => {
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
        });
    }

    module.exports = {
        processJar,
    };