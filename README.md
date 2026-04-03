# Smart Brain API (Backend)

A Node.js + Express API that powers the Smart Brain application.
Handles user authentication, database interactions, and AI image processing.

---

## Live API

https://safe-dawn-54877-2bdeb01ab080.herokuapp.com/

---

## Tech Stack

* Node.js
* Express.js
* PostgreSQL
* bcrypt (password hashing)
* Knex.js (query builder)
* REST API
* Deployed on Heroku

---

## Features

* User registration
* Secure password hashing
* User sign-in authentication
* Profile retrieval
* Image entry tracking
* AI face detection integration (Clarifai)

---

## API Endpoints

### Authentication

#### POST `/register`

Registers a new user

```json id="e0a2v6"
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123"
}
```

---

#### POST `/signin`

Signs in an existing user

```json id="2yks9p"
{
  "email": "john@example.com",
  "password": "123"
}
```

---

### User

#### GET `/profile/:id`

Returns user profile

---

### Image Processing

#### PUT `/image`

Updates user's entry count

#### POST `/imageurl`

Sends image to Clarifai API for face detection

---

## Installation

Clone the repo:

```bash id="q9y6md"
git clone https://github.com/brandonmay-dev/facerecognitionbrain-api/tree/main
cd facerecognitionbrain_api
```

Install dependencies:

```bash id="2fwy6m"
npm install
```

---

## Environment Variables

Create a `.env` file:

```env id="qg0o6d"
PORT=3001

DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=smart-brain
DB_USER=postgres
DB_PASSWORD=yourpassword

FRONTEND_ORIGIN=http://localhost:5173

CLARIFAI_PAT=your_clarifai_api_key
```

---

## Database Setup

Make sure PostgreSQL is running.

Create database:

```sql id="ux1vxt"
CREATE DATABASE smart-brain;
```

Create tables:

```sql id="t9nqv8"
CREATE TABLE login (
  id serial PRIMARY KEY,
  hash varchar(100) NOT NULL,
  email text UNIQUE NOT NULL
);

CREATE TABLE users (
  id serial PRIMARY KEY,
  name varchar(100),
  email text UNIQUE NOT NULL,
  entries bigint DEFAULT 0,
  joined timestamp NOT NULL
);
```

---

## Running Locally

```bash id="0b38rk"
npm start
```

Server runs at:

```text id="yk1x8w"
http://localhost:3001
```

---

## Deployment (Heroku)

Set environment variables:

```bash id="b2x1hx"
heroku config:set FRONTEND_ORIGIN=https://smart-brain-app-32fac457676f.herokuapp.com
heroku config:set CLARIFAI_PAT=your_key
```

Heroku automatically provides:

```text id="m8q1zz"
DATABASE_URL
```

---

## Troubleshooting

### ECONNREFUSED 127.0.0.1:5432

You're trying to connect to local DB on Heroku → use `DATABASE_URL`

---

### 403 Forbidden (CORS)

Make sure frontend URL is allowed in backend

---

### Sign-in failing

Check:

* user exists in DB
* password matches hashed value

---

## Project Structure

```bash id="2gfy7m"
controllers/
  signin.js
  register.js
  image.js

server.js
database.js
```

---

## Future Improvements

* JWT authentication
* Rate limiting
* Input validation (Joi/Zod)
* Logging & monitoring
* Docker support

---

## Author

Brandon May

---

## License

MIT
