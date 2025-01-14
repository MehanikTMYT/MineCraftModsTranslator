import requests
import argparse
import os
import json
import shutil
import logging

# Поддерживаемые языковые коды
supported_languages = [
    'af', 'sq', 'am', 'ar', 'hy', 'az', 'eu', 'be', 'bn', 'bs', 'bg', 'ca', 'ceb', 'ny',
    'zh-CN', 'zh-TW', 'co', 'hr', 'cs', 'da', 'nl', 'en', 'eo', 'et', 'tl', 'fi', 'fr',
    'fy', 'gl', 'ka', 'de', 'el', 'gu', 'ht', 'ha', 'haw', 'iw', 'hi', 'hmn', 'hu',
    'is', 'ig', 'id', 'ga', 'it', 'ja', 'jw', 'kn', 'kk', 'km', 'ko', 'ku', 'ky', 'lo',
    'la', 'lv', 'lt', 'lb', 'mk', 'mg', 'ms', 'ml', 'mt', 'mi', 'mr', 'mn', 'my', 'ne',
    'no', 'ps', 'fa', 'pl', 'pt', 'pa', 'ro', 'ru', 'sm', 'gd', 'sr', 'st', 'sn', 'sd',
    'si', 'sk', 'sl', 'so', 'es', 'su', 'sw', 'sv', 'tg', 'ta', 'te', 'th', 'tr', 'uk',
    'ur', 'uz', 'vi', 'cy', 'xh', 'yi', 'yo', 'zu'
]

# Настройка логирования
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def move_file(file_path, target_dir):
    """Перемещает файл в указанную директорию."""
    if not os.path.exists(target_dir):
        os.makedirs(target_dir)
    target_path = os.path.join(target_dir, os.path.basename(file_path))
    
    logging.info(f"Перемещение файла {file_path} в {target_path}")
    shutil.move(file_path, target_path)

def handle_request(file_path, output_dir, output_invalid, output_corrupted, fb, cl, m, f, t):
    """Обрабатывает запрос на перевод JAR-файла."""
    url = "http://mehhost.ru:8150/process"

    try:
        with open(file_path, 'rb') as jarFile:
            files = {'jarFile': jarFile}
            data = {
                'fb': fb,
                'cl': cl,
                'm': m,
                'f': f,
                't': t,
            }

            response = requests.post(url, files=files, data=data)
            response.raise_for_status()

            output_file_name = f"{os.path.splitext(os.path.basename(file_path))[0]}.jar"
            output_file_path = os.path.join(output_dir, output_file_name)
            with open(output_file_path, 'wb') as output_file:
                output_file.write(response.content)
            logging.info(f"Файл успешно обработан и сохранен как: {output_file_path}")

    except requests.exceptions.RequestException as e:
        handle_error(e, file_path, output_invalid, output_corrupted)

def handle_error(e, file_path, output_invalid, output_corrupted):
    """Обрабатывает ошибки при запросе."""
    error_text = getattr(e.response, 'text', '')

    try:
        error_data = json.loads(error_text)
        error_message = error_data.get("error", "")
    except json.JSONDecodeError:
        error_message = error_text

    # Проверяем конкретные ошибки и перемещаем файлы в соответствующие директории
    if "архив повреждён" in error_message:
        logging.error(f"Ошибка: {error_message}, файл поврежден: {file_path}")
        move_file(file_path, output_corrupted)
    elif "отсутствует папка \"assets\"" in error_message or "отсутствует папка \"lang\"" in error_message:
        logging.error(f"{error_message}, перемещение файла в недопустимый: {file_path}")
        move_file(file_path, output_invalid)
    else:
        logging.error(f"Неизвестная ошибка обработки: {error_message}")

def process_jar(file_path, output_dir, output_invalid, output_corrupted, fb='yes', cl=3, m='bing', f='en', t='ru'):
    """Обрабатывает JAR файл."""
    if cl < 1:
        raise ValueError("Параметр 'cl' должен быть положительным числом.")

    if not os.path.exists(file_path):
        logging.error(f"Ошибка: Файл {file_path} не найден.")
        return

    handle_request(file_path, output_dir, output_invalid, output_corrupted, fb, cl, m, f, t)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Перевод JAR файлов.')
    parser.add_argument('--fb', type=str, default='yes', choices=['yes', 'no'], help='Использовать резервный переводчик (default: yes).')
    parser.add_argument('--cl', type=int, default=3, help='Максимальное число запросов (default: 3).')
    parser.add_argument('--m', type=str, default='bing', choices=['google', 'google2', 'bing'], help='Выбор переводчика (default: bing).')
    parser.add_argument('--f', type=str, default='en', choices=supported_languages, help='Исходный язык (default: en).')
    parser.add_argument('--t', type=str, default='ru', choices=supported_languages, help='Целевой язык (default: ru).')
    parser.add_argument('--output_dir', type=str, default='1', help='Директория для переведённых JAR-файлов (default: 1).')
    parser.add_argument('--output_invalid', type=str, default='2', help='Директория для неподходящих JAR-файлов (default: 2).')
    parser.add_argument('--output_corrupted', type=str, default='3', help='Директория для повреждённых JAR-файлов (default: 3).')

    args = parser.parse_args()

    current_directory = os.getcwd()
    jar_files = [f for f in os.listdir(current_directory) if f.endswith('.jar')]

    if not jar_files:
        logging.warning("JAR файлы не найдены в текущей директории.")
    else:
        for jar_file in jar_files:
            logging.info(f"Обработка файла: {jar_file}")
            process_jar(jar_file, args.output_dir, args.output_invalid, args.output_corrupted, fb=args.fb, cl=args.cl, m=args.m, f=args.f, t=args.t)
