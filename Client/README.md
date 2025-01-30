### JAR Переводчик

[Русская версия](https://github.com/MehanikTMYT/MineCraftModsTranslator/tree/main/Client/README-ru.md)

This client application allows you to process JAR files by translating the content from one language to another using various translators via the jsontt module

[Thanks to](https://github.com/mololab/json-translator)

## Installation

Python (version 3.x) is required for the application to work. It also requires the `requests` library to be installed if it is not already installed:

```bash
pip install requests
```
## Usage
## Start the application

The application can be run from the command line. Or by using VScode or any other editor that supports the Python environment
Go to the directory with the JAR files and run the following command:

```bash
python translator.py [options]
```

# Arguments [options] (optional)

* --fb (default: yes): Use the standby translator. Possible values: yes, no.
* --cl (default: 3): Maximum number of requests to be sent to the server.
* --m (default: bing): Select a translator. Possible values: google, google2, bing.
* --f (default: en): Source language. Available language codes can be seen below.
* --t (default: ru): Target language. Available language codes can be seen below.
* --output_dir (default: 1): A folder to store successfully translated JAR files.
* --output_invalid (default: 2): A folder to store inappropriate JAR files that do not contain the required directories.
* --output_corrupted (default: 3): A folder to store corrupted JAR files.

# Supported languages

The following language codes are supported in the application:

af, sq, am, ar, ar, hy, az, eu, be, bn, bs, bg, ca, ceb, ny,
zh-CN, zh-TW, co, hr, cs, da, nl, en, eo, et, tl, fi, fr,
fy, gl, ka, de, el, gu, ht, ha, haw, iw, hi, hmn, hu,
is, ig, id, ga, it, ja, jw, kn, kk, km, ko, ku, ky, lo,
la, lv, lt, lb, mk, mg, ms, ml, mt, mi, mr, mn, my, ne,
no, ps, fa, pl, pt, pa, ro, ro, ru, sm, gd, sr, st, sn, sd,
si, sk, sl, so, es, su, sw, sv, tg, ta, te, th, tr, uk,
ur, uz, vi, cy, xh, yi, yo, zu

[original list](https://github.com/mololab/json-translator/blob/master/docs/LANGUAGES.md)

# Example usage with all parameters 

```bash
python translator.py --fb yes --cl 3 --m bing --f en --t ru --output_dir translated --output_invalid invalid --output_corrupted corrupted
```
# Error handling

The following scenarios are possible when processing JAR files:

Successful processing: The file will be saved in the directory specified with the --output_dir argument.
Invalid files: If the file does not contain the required folders, it will be moved to the --output_invalid directory.
Corrupted files: If a file is corrupted, it will be moved to the --output_corrupted directory.

# Logging

All events and errors are logged using the logging module. Logs are output to the console.

### Conclusion

This application provides a simple way to translate JAR files and handle their errors. 
In case of usage problems, please check if the command line arguments are correct and make sure all dependent libraries are installed.