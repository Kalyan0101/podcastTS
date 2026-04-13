# Podcast Backend API 🎙️

A robust and modern Node.js backend API built with TypeScript, Express, and Prisma ORM. Currently functioning as an authentication and user management service, providing secure JWT-based authentication mechanisms out of the box.

## 🚀 Tech Stack

- **Runtime:** [Bun](https://bun.sh/) (Fast all-in-one JavaScript runtime)
- **Framework:** [Express](https://expressjs.com/) (Web framework for Node.js)
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** [Prisma](https://www.prisma.io/)
- **Authentication:** `jsonwebtoken` (JWT), `cookie-parser` & `bcrypt`

## ✨ Features

- **Secure User Authentication**: Full user signup and login flows.
- **JWT Implementation**: Utilizing both short-lived Access Tokens and long-lived Refresh Tokens.
- **Cookie Based Auth**: Tokens are stored securely in `httpOnly` secure cookies to prevent XSS attacks.
- **Automated Token Refresh**: Endpoint dedicated to seamlessly generating new access tokens without forcing the user to log in again.
- **Modern ESM Module System**: Project written in modular ESNext structure.

## 🛠️ Prerequisites

Before you begin, ensure you have met the following requirements:
- **[Bun](https://bun.sh/)** installed on your machine.
- **PostgreSQL** installed and running locally, or a remote Postgres connection string.

## ⚙️ Environment Variables

Create a `.env` file in the root directory and add the necessary environment variables:

```env
# Server
PORT=4000

# Database
DATABASE_URL="postgres://username:password@localhost:5432/podcastDB"

# JWT configuration
JWT_SECRET="your_secure_jwt_secret_key"
JWT_EXPIRE="7d"

REFRESH_TOKEN_SECRET="your_secure_refresh_token_secret"
REFRESH_TOKEN_EXPIRE="30d"
```

## 🏁 Getting Started

**1. Install dependencies**
Using Bun for incredibly fast dependency resolution:
```bash
bun install
```

**2. Setup Prisma Database**
Run migrations and generate the Prisma Client for type safety:
```bash
npx prisma migrate dev
npx prisma generate
```

**3. Run the Development Server**
Start the application in watch mode:
```bash
bun run dev
```

The server should now be running, typically at `http://localhost:4000`.

## 📌 API Routes (Current)

### Authentication `/api/v1/user`
| Method | Endpoint | Description | Auth Required? |
|--------|----------|-------------|----------------|
| `POST` | `/register` | Register a new user | No |
| `POST` | `/login`    | Login user & return cookies | No |
| `GET`  | `/refresh`  | Hit to get a new Access token using refresh cookie | No |
| `GET`  | `/logout`   | Clear cookies & logout user | Yes |

## 🏗️ Structure

```text
src/
├── controller/    # Route controllers (e.g. auth.controller.ts)
├── middlewares/   # Custom Express middlewares (e.g. auth.middleware.ts)
├── routes/        # Route declarations & groupings
├── utils/         # Helper functions and global wrappers
├── app.ts         # Express server configuration
└── index.ts       # Application entry point & Database connection
```

## 📜 Scripts

- `bun run dev`: Starts the dev server with hot-reload via Bun.
- `bun run build`: Compiles TypeScript down to JavaScript in the `dist` folder.
- `bun run start`: Runs the built production files.
