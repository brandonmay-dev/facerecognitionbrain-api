import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import knex from "knex";
import bcrypt from "bcryptjs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

const ALLOWED = new Set(["http://localhost:5173", "http://127.0.0.1:5173"]);

const corsOptions = {
  origin: (origin, cb) => {
    // allow Postman/curl (no Origin header)
    if (!origin) return cb(null, true);

    if (ALLOWED.has(origin)) return cb(null, true);

    // IMPORTANT: don't throw here; respond as "not allowed"
    return cb(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.options(
  "*",
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      return ALLOWED.has(origin)
        ? cb(null, true)
        : cb(new Error("Blocked by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

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

    const user = await db.transaction(async (trx) => {
      // Insert into login table
      await trx("login").insert({
        email,
        hash,
      });

      // Insert into users table
      const [newUser] = await trx("users")
        .insert({
          name,
          email,
          hash,
          joined: new Date(),
        })
        .returning(["id", "name", "email", "entries", "joined"]);

      return newUser;
    });

    return res.json(user);
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

    if (!email || !password) {
      return res.status(400).json("missing email or password");
    }

    const user = await db("users")
      .select("id", "name", "email", "entries", "joined", "hash")
      .where({ email })
      .first();

    if (!user) {
      return res.status(400).json("error logging in");
    }

    const valid = await bcrypt.compare(password, user.hash);
    if (!valid) {
      return res.status(400).json("error logging in");
    }

    // don't send hash back to frontend
    const { hash, ...safeUser } = user;

    return res.json(safeUser);
  } catch (err) {
    console.error("signin error:", err);
    return res.status(500).json("unable to signin");
  }
});

app.post("/imageurl", async (req, res) => {
  try {
    const { input } = req.body;
    if (!input) return res.status(400).json("missing input");

    const PAT = process.env.CLARIFAI_PAT;
    if (!PAT)
      return res.status(500).json("Missing CLARIFAI_PAT in backend .env");

    const MODEL_ID = "face-detection";

    const clarifaiRes = await fetch(
      `https://api.clarifai.com/v2/models/${MODEL_ID}/outputs`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Key ${PAT}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_app_id: { user_id: "clarifai", app_id: "main" },
          inputs: [{ data: { image: { url: input } } }],
        }),
      },
    );

    const data = await clarifaiRes.json();

    if (!clarifaiRes.ok) return res.status(clarifaiRes.status).json(data);

    return res.json(data);
  } catch (err) {
    console.error("imageurl error:", err);
    return res.status(500).json("unable to work with api");
  }
});

app.put("/image", async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json("missing user id");

    const updated = await db("users")
      .where({ id })
      .increment("entries", 1)
      .returning(["entries"]);

    if (!updated || updated.length === 0) {
      return res.status(404).json("user not found");
    }

    return res.json(updated[0]); // { entries: <number> }
  } catch (err) {
    console.error("image PUT error:", err);
    return res.status(500).json("unable to update entries");
  }
});

app.get("/profile/:id", (req, res) => {
  const { id } = req.params;
  db.select("*")
    .from("users")
    .where({ id })
    .then((user) => {
      if (user.length) {
        res.json(user[0]);
      } else {
        res.status(400).json("Not found");
      }
    })
    .catch((err) => res.status(400).json("error getting user"));
});

app.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`);
});
