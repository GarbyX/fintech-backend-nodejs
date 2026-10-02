# Fintech Backend Node js

A Node.js fintech service built with Express, PostgreSQL, Prisma ORM, JWT authentication and interactive Swagger API documentation.

## Features

- **Authentication:** JWT registration and login with bcrypt password hashing.
- **ACID Financial Transactions:** Safe money transfers using PostgreSQL transactions and `Decimal` data types.
- **Database ORM:** Prisma schema managing users, bank accounts, and transaction ledgers.
- **Interactive API Docs:** Built-in Swagger UI at `/api-docs`.

## Setup Instructions

1. **Install Dependencies:**
npm install

2. **Configure Environment Variables:**
Create`.env` and set your database connection string and secret key.

3. **Run Migrations:**
npx prisma migrate dev

4. **Start Application:**
npm run dev

5. **Access API Docs:**
Open `http://localhost:5000/api-docs` in your browser.

Script | Command | Purpose

- npm start
node src/index.js 
Runs the server in production mode

- npm run dev
nodemon src/index.js
Starts server in development with auto-reloading on code changes

- npm run db:migrate
prisma migrate dev
Applies database migrations locally

- npm run db:generate
prisma generate
Regenerates Prisma Client types after schema updates

- npm run db:studio
prisma studio
Opens Prisma's visual database GUI at http:/localhost:5555

## API Documentation

![Swagger API Documentation](docs/swagger-ui.png)

Access the interactive OpenAPI documentation at `http://localhost:5000/api-docs` when running the service locally.

EOF