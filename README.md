# InCtrl

A web application to learn Windows shortcuts in a fun and interactive way.

## Tech Stack

* **Frontend:** HTML, CSS, JavaScript, Vue.js
* **Backend:** Node.js
* **Database:** MySQL (Docker)

## Features

* [ ] User accounts (registration)
* [ ] User accounts (login)
* [ ] Interactive quizzes with instant visual feedback
* [ ] Searchable directory of all Windows shortcuts
* [ ] Quiz history and statistics
* [ ] Reward system, streaks, and leaderboard

## Get Started

Follow these instructions to run the project locally on your machine.

### 1. Start the database

```bash
docker compose up -d
```

MySQL runs in Docker on port 3306. The database is called `inctrl_db` and is initialized automatically from `docker/init.sql` (schema plus data for shortcuts, quiz questions, users and scores).

### 2. Start the backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev        
```

Open `.env` and set your own `JWT_SECRET`. Generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

The backend runs on http://localhost:3000. Check it at http://localhost:3000/api/health.

### 3. Start the frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on http://localhost:5173. Requests to `/api` are proxied to the backend, so the backend must be running for sign up and login. The quiz works without it.

### Updating an existing database

`docker/init.sql` only runs when the database is created. If you pulled a schema change (for example the new `first_name` and `last_name` columns on `users`), either recreate the database (this deletes all data):

```bash
docker compose down -v
docker compose up -d
```

or add the columns manually:

```sql
ALTER TABLE users
  ADD COLUMN first_name VARCHAR(50) NULL AFTER email,
  ADD COLUMN last_name VARCHAR(50) NULL AFTER first_name;
```

## Testing

Both test suites report a coverage summary.

```bash
cd backend
npm test
```

```bash
cd frontend
npm test
```

## Troubleshooting (Windows PowerShell)

If you get the error "running scripts is disabled on this system" when running `npm`, either run this once:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

or use the `.cmd` version: `npm.cmd install` and `npm.cmd run dev`.

## Contributors

*