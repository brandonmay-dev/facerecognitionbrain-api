import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import knex from "knex";
import bcrypt from "bcryptjs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ THIS must be the FRONTEND origin (Vite)
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

console.log("✅ Running server.js");
console.log("✅ FRONTEND_ORIGIN =", FRONTEND_ORIGIN);

app.use(express.json());

// ✅ CORS: allow ONLY your frontend
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ✅ Preflight
app.options("*", cors({ origin: FRONTEND_ORIGIN }));

// ✅ Knex / Postgres
const db = knex({
  client: "pg",
  connection: process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_HOST || "127.0.0.1",
        port: Number(process.env.DB_PORT || 5432),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      },
  pool: { min: 0, max: 10 },
});

// ✅ sanity endpoints
app.get("/", (req, res) => res.json({ ok: true }));
app.get("/health/whoami", async (req, res) => {
  const r = await db.raw(
    "select current_database() as db, current_user as user",
  );
  res.json(r.rows[0]);
});

// ✅ Register (matches your table: users.hash)
app.post("/register", async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json("missing name, email, or password");
    }

    const existing = await db("users").select("id").where({ email }).first();
    if (existing) return res.status(400).json("email already registered");

    const hash = await bcrypt.hash(password, 10);

    const inserted = await db("users")
      .insert({
        name,
        email,
        hash,
        joined: new Date(),
      })
      .returning(["id", "name", "email", "entries", "joined"]);

    return res.json(inserted[0]);
  } catch (err) {
    console.error("register error:", err);
    return res.status(500).json({
      error: err.message,
      code: err.code,
      detail: err.detail,
    });
  }
});

// ✅ Signin (reads users.hash)
app.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json("missing email or password");

    const user = await db("users")
      .select("id", "name", "email", "entries", "joined", "hash")
      .where({ email })
      .first();

    if (!user) return res.status(400).json("error logging in");

    const valid = await bcrypt.compare(password, user.hash);
    if (!valid) return res.status(400).json("error logging in");

    const { hash: _hash, ...safeUser } = user;
    return res.json(safeUser);
  } catch (err) {
    console.error("signin error:", err);
    return res.status(500).json("unable to signin");
  }
});

app.post("/image", async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json("missing user id");

    const updated = await db("users")
      .where({ id })
      .increment("entries", 1)
      .returning("entries");

    if (updated.length === 0) return res.status(400).json("user not found");

    return res.json(updated[0]);
  } catch (err) {
    console.error("image error:", err);
    return res.status(500).json("unable to update entries");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`);
});
