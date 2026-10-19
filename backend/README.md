# inCTRL - Backend & MySQL via Docker

## 1. Start MySQL with Docker Compose (from the root folder)

```bash
docker compose up -d
```

This starts the MySQL 8.0 container (`inctrl-mysql`) and automatically runs `docker/init.sql`, which creates the database `inctrl_db` with tables for quiz questions, users, categories, shortcuts and results.

## 2. Install backend dependencies

```bash
cd backend
npm install
```

## 3. Start the backend server

```bash
npm start
```

(or `npm run dev` for live reload with `node --watch`)

## 4. API endpoints

- Health check: `GET http://localhost:3000/api/health`
- Quiz questions: `GET http://localhost:3000/api/questions`
- Shortcuts: `GET http://localhost:3000/api/shortcuts`
- Users: `GET http://localhost:3000/api/users`
- Categories: `GET http://localhost:3000/api/categories`
- Leaderboard: `GET http://localhost:3000/api/quiz/leaderboard`
- Submit answers/result: `POST http://localhost:3000/api/quiz/attempts`

  Body:

```json
  { "answers": { "sc-1": "opt-1" }, "formatFilter": "all", "timeSpentSeconds": 30 }
```

## 5. Troubleshooting in Windows PowerShell

If you get the error "running scripts is disabled on this system" when running `npm`:

- Allow scripts for your user account in PowerShell:

```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

- Or use the `.cmd` version:

```powershell
  npm.cmd install
  npm.cmd run dev    # or: node app.js
```