//utils.js
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

function validateParams(params) {
  const validFbValues = ['yes', 'no'];
  const validMValues = ['google', 'google2', 'bing'];
  const validLangCodes = [
    // Все поддерживаемые языковые коды
    'af', 'sq', 'am', 'ar', 'hy', 'az', 'eu', 'be', 'bn', 'bs', 'bg', 'ca', 'ceb', 'ny',
    'zh-CN', 'zh-TW', 'co', 'hr', 'cs', 'da', 'nl', 'en', 'eo', 'et', 'tl', 'fi', 'fr',
    'fy', 'gl', 'ka', 'de', 'el', 'gu', 'ht', 'ha', 'haw', 'iw', 'hi', 'hmn', 'hu',
    'is', 'ig', 'id', 'ga', 'it', 'ja', 'jw', 'kn', 'kk', 'km', 'ko', 'ku', 'ky', 'lo',
    'la', 'lv', 'lt', 'lb', 'mk', 'mg', 'ms', 'ml', 'mt', 'mi', 'mr', 'mn', 'my', 'ne',
    'no', 'ps', 'fa', 'pl', 'pt', 'pa', 'ro', 'ru', 'sm', 'gd', 'sr', 'st', 'sn', 'sd',
    'si', 'sk', 'sl', 'so', 'es', 'su', 'sw', 'sv', 'tg', 'ta', 'te', 'th', 'tr', 'uk',
    'ur', 'uz', 'vi', 'cy', 'xh', 'yi', 'yo', 'zu'
  ];

  if (!validFbValues.includes(params.fb)) {
    throw new Error('Invalid value for fb: must be "yes" or "no"');
  }
  
  if (params.cl !== undefined && (isNaN(params.cl) || params.cl < 0)) {
    throw new Error('Invalid value for cl: must be a non-negative number');
  }

  if (!validMValues.includes(params.m)) {
    throw new Error('Invalid value for m: must be "google", "google2", or "bing"');
  }

  if (!validLangCodes.includes(params.f)) {
    throw new Error(`Invalid value for f: must be one of the supported language codes`);
  }

  if (!validLangCodes.includes(params.t)) {
    throw new Error(`Invalid value for t: must be one of the supported language codes`);
  }
}

function loadAndProcessJson(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}

/**
 * Проверяет и очищает JSON файл от комментариев.
 * @param {string} filePath Путь к JSON файлу.
 * @returns {Promise<boolean>} Возвращает true, если файл валидный, или выбрасывает ошибку.
 */
function validateAndCleanJson(filePath) {
  return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
              return reject(new Error(`Ошибка чтения файла: ${err.message}`));
          }

          try {
              // Удаление комментариев и пробелов
              const cleanedData = data.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '').trim();
              
              // Проверка валидности JSON
              JSON.parse(cleanedData);
              
              // Перезапись файла очищенными данными
              fs.writeFile(filePath, cleanedData, 'utf8', (writeErr) => {
                  if (writeErr) {
                      return reject(new Error(`Ошибка записи файла: ${writeErr.message}`));
                  }
                  resolve(true);
              });
          } catch (parseErr) {
              reject(new Error(`Ошибка парсинга JSON: ${parseErr.message}`));
          }
      });
  });
}

function translate(filePath, options) {
  return new Promise((resolve, reject) => {
      // Сначала проверяем и очищаем JSON файл
      validateAndCleanJson(filePath)
          .then(() => {
              const command = `jsontt ${filePath} --fallback ${options.fb} --concurrencylimit ${options.cl} --module ${options.m} --from ${options.f} --to ${options.t} --name ru`;

              exec(command, (error) => {
                  if (error) {
                      console.error(`Ошибка при запуске команды: ${error.message}`);
                      return reject(error);
                  }

                  const originalFileName = 'ru.ru.json';
                  const newFileName = 'ru_ru.json';
                  const dir = path.dirname(filePath);

                  const originalFilePath = path.join(dir, originalFileName);
                  const newFilePath = path.join(dir, newFileName);

                  // Переименование файла
                  fs.rename(originalFilePath, newFilePath, (renameError) => {
                      if (renameError) {
                          console.error(`Ошибка переименования файла: ${renameError.message}`);
                          return reject(renameError);
                      }

                      console.log(`Файл переименован в: ${newFilePath}`);
                      
                      try {
                          const translatedData = loadAndProcessJson(newFilePath);
                          resolve(translatedData);
                      } catch (processError) {
                          reject(new Error(`Ошибка обработки переведенного JSON: ${processError.message}`));
                      }
                  });
              });
          })
          .catch((validationError) => {
              console.error(`Ошибка в JSON файле: ${validationError.message}`);
              reject(validationError);
          });
  });
}

module.exports = {
  validateParams,
  translate,
};