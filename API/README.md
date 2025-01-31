### JAR File Translator
[Русская версия](https://github.com/MehanikTMYT/MineCraftModsTranslator/tree/main/API/README-ru.md)

This server-side API application allows you to process JAR files by translating the content from one language to another using various translators via the jsontt module
[Thanks to this repo](https://github.com/mololab/json-translator)

## Installation

The application requires node.mjs (at the time of creation, the current version is v22.9.0). To check if it is available, you can use the command:

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
node app.mjs
```

To build the application, use the following command, but note that Electron Builder is used, which only compiles for the target OS. For example, if you run the build on Linux, it will only build an AppImage, and only an EXE on Windows.

```bash
npm run build
```

**WIP**
Building on GitHub (not implemented yet)

## API Structure

The application API consists of the following files:

* app.mjs - the main file for server initialization.
* controllers.mjs - controllers that process requests.
* fileProcessor.mjs - logic of JAR-files processing.
* routes.mjs - API routing.
* utils.mjs - utility functions such as parameter validation and file processing.
* .env - hidden variables with the address and token for the openroute model **must be created**

## Main components

## app.mjs.

This file configures the Express server and sets up the basic routes.

# controllers.mjs

Contains controller functions for processing JAR files and customizing downloads.

# fileProcessor.mjs

Handles decompression and translation of JAR file content.

# routes.mjs.

Routes for processing API requests.

# utils.mjs

Contains utility functions including parameter validation and file processing.

## Developers
API Developers: [MehanikTM_YT](https://github.com/MehanikTMYT)