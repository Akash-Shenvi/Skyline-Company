# SprachWeg Backend

This is the backend server for the SprachWeg language learning platform. It is built with Node.js, Express, and TypeScript, using MongoDB as the database.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- [MongoDB](https://www.mongodb.com/) (Local instance or Atlas cluster)

## Installation

1.  Clone the repository (if you haven't already):
    ```bash
    git clone <repository-url>
    ```

2.  Navigate to the backend directory:
    ```bash
    cd Backend
    ```

3.  Install dependencies:
    ```bash
    npm install
    ```

## Configuration

Create a `.env` file in the root of the `Backend` directory. You can use the example below as a template:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/sprachweg
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=30d

# SMTP Configuration (for emails)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

> **Note:** For Gmail, you may need to use an "App Password" if 2-Step Verification is enabled.

## Running the Application

The available scripts are defined in `package.json`:

-   **Development Mode:** Runs the server with `nodemon` for auto-reloading.
    ```bash
    npm run dev
    ```

-   **Build:** Compiles TypeScript code to JavaScript in the `dist` folder.
    ```bash
    npm run build
    ```

-   **Production Start:** Runs the compiled JavaScript code (ensure you have run `npm run build` first).
    ```bash
    npm start
    ```

## Project Structure

The source code is located in the `src` directory:

```
src/
├── config/         # Configuration files (DB connection, etc.)
├── controllers/    # Request handlers for API endpoints
├── dtos/           # Data Transfer Objects
├── middlewares/    # Express middlewares (Auth, Error handling, etc.)
├── models/         # Mongoose models (Schema definitions)
├── routes/         # API route definitions
├── types/          # TypeScript type definitions
├── utils/          # Utility functions (Email service, etc.)
├── app.ts          # Express app setup
└── server.ts       # Application entry point
```

## API Documentation

The API routes are prefixed (usually with `/api` - check `src/app.ts` for exact mounting).

Common endpoints include:
-   Auth: `/auth/register`, `/auth/login`
-   Users: `/users`
-   Courses: `/courses`

(Refer to `src/routes` for specific endpoint paths and methods.)
