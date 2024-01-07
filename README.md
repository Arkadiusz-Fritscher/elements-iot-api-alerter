# Express API Starter with Typescript

## Documentation

### Grundlegende Ordnerstruktur:

**Routes:**

- Trenne Routen in verschiedene Dateien oder Ordner, um die Lesbarkeit und Wartbarkeit zu verbessern. Zum Beispiel könntest du einen Ordner routes erstellen und darin separate Dateien für verschiedene Routengruppen haben (z. B. users.js, posts.js).

**Controller:**

- Halte die Logik für jede Route sauber und trenne sie von den Routendefinitionen. Die Logik kann in Controllern organisiert werden, die in der Regel Funktionen für verschiedene Routen enthalten.

**Middlewares:**

- Wenn du benutzerdefinierte Middlewares hast, können diese in einem separaten Ordner gespeichert werden, um die Wiederverwendbarkeit zu erleichtern und den Code sauber zu halten.

**Models:**

- Wenn du mit einer Datenbank arbeitest, können die Modelle oder Schemas für die Datenbankzugriffe in einem Ordner wie models organisiert werden.

**Services/Utilities:**

- Für Dienste oder Hilfsfunktionen, die in mehreren Teilen der Anwendung verwendet werden, könntest du einen Ordner services oder utils haben.

## Includes API Server utilities:

- [morgan](https://www.npmjs.com/package/morgan)
  - HTTP request logger middleware for node.js
- [helmet](https://www.npmjs.com/package/helmet)
  - Helmet helps you secure your Express apps by setting various HTTP headers. It's not a silver bullet, but it can help!
- [dotenv](https://www.npmjs.com/package/dotenv)
  - Dotenv is a zero-dependency module that loads environment variables from a `.env` file into `process.env`
- [cors](https://www.npmjs.com/package/cors)
  - CORS is a node.js package for providing a Connect/Express middleware that can be used to enable CORS with various options.
- [express-validator](https://express-validator.github.io/docs)
  - express-validator is a set of express.js middlewares that wraps the extensive collection of validators and sanitizers offered by validator.js.
  - It allows you to combine them in many ways so that you can validate and sanitize your express requests, and offers tools to determine if the request is valid or not, which data was matched according to your validators, and so on.

Development utilities:

- [typescript](https://www.npmjs.com/package/typescript)
  - TypeScript is a language for application-scale JavaScript.
- [ts-node](https://www.npmjs.com/package/ts-node)
  - TypeScript execution and REPL for node.js, with source map and native ESM support.
- [nodemon](https://www.npmjs.com/package/nodemon)
  - nodemon is a tool that helps develop node.js based applications by automatically restarting the node application when file changes in the directory are detected.
- [eslint](https://www.npmjs.com/package/eslint)
  - ESLint is a tool for identifying and reporting on patterns found in ECMAScript/JavaScript code.
- [typescript-eslint](https://typescript-eslint.io/)
  - Tooling which enables ESLint to support TypeScript.
- [jest](https://www.npmjs.com/package/jest)
  - Jest is a delightful JavaScript Testing Framework with a focus on simplicity.
- [supertest](https://www.npmjs.com/package/supertest)
  - HTTP assertions made easy via superagent.

## Setup

```
npm install
```

## Lint

```
npm run lint
```

## Test

```
npm run test
```

## Development

```
npm run dev
```
