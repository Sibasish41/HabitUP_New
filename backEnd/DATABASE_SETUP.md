# HabitUP Database Setup

The backend now uses Sequelize with either MySQL or Postgres.

## 1. Create Environment File

Copy `.env.example` to `.env` and fill in the database credentials.

```bash
PORT=3000
CLIENT_URL=http://localhost:5173
JWT_SECRET=change-this-to-a-long-random-secret
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=habitup
DB_USER=root
DB_PASSWORD=
DB_SYNC_ALTER=true
BOOTSTRAP_ADMIN_KEY=replace-this-bootstrap-key
```

For hosted Postgres, use:

```bash
DB_DIALECT=postgres
DATABASE_URL=postgres://user:password@host:5432/habitup
```

## 2. Tables Created

On startup, Sequelize creates or updates:

- `users`
- `provider_profiles`
- `habits`
- `consultations`
- `subscription_plans`
- `user_subscriptions`
- `thoughts`
- `admin_actions`

`subscription_plans` is initialized with the default Free, Premium, and Care Plus plans if it is empty.

## 3. Create First Admin

After the server starts, call:

```http
POST /setup/admin
Content-Type: application/json

{
  "name": "HabitUP Admin",
  "email": "admin@habitup.app",
  "password": "password123",
  "setupKey": "replace-this-bootstrap-key"
}
```

This only works while no admin account exists.

## 4. Main Persistent Modules

- Users: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- Provider profiles: `GET /providers`, `PATCH /providers/me`, `PATCH /admin/providers/:id`
- Habits: `GET /habits`, `POST /habits`, `PATCH /habits/:id`
- Consultations: `GET /consultations`, `POST /consultations`
- Subscriptions: `GET /subscriptions`, `POST /subscriptions`
- Content approval: `GET /content/thoughts`, `POST /content/thoughts`, `PATCH /content/thoughts/:id/review`
- Admin actions: `GET /admin/actions`
