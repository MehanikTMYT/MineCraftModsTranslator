### JAR File Translator
[Русская версия](https://github.com/MehanikTMYT/MineCraftModsTranslator/tree/main/API/README-ru.md)

This server-side API application allows you to process JAR files by translating the content from one language to another using various translators via the jsontt module
[Thanks to this repo](https://github.com/mololab/json-translator)

## Installation

The application requires node.js (at the time of creation, the current version is v22.9.0). To check if it is available, you can use the command:

```bash
node --version
```
To initialize the API, the following command is required to install the required dependencies in the folder:

```bash
npm i
```
## Startup

You can use the following command to start up:

```bash
node app.js
```

## API Structure

The application API consists of the following files:

* app.js - the main file for server initialization.
* controllers.js - controllers that process requests.
* fileProcessor.js - logic of JAR-files processing.
* routes.js - API routing.
* utils.js - utility functions such as parameter validation and file processing.

## Main components

## app.js.

This file configures the Express server and sets up the basic routes.

# controllers.js

Contains controller functions for processing JAR files and customizing downloads.

# fileProcessor.js

Handles decompression and translation of JAR file content.

# routes.js.

Routes for processing API requests.

# utils.js

Contains utility functions including parameter validation and file processing.

## Developers
API Developers: [MehanikTM_YT](https://github.com/MehanikTMYT)