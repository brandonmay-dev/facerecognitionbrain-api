import express from "express";
import bcrypt from "bcryptjs";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

const database = {
  users: [
    {
      id: "123",
      name: "John",
      email: "john@example.com",
      hash: bcrypt.hashSync("cookies", 10),
      entries: 0,
      joined: new Date(),
    },
    {
      id: "124",
      name: "Sally",
      email: "sally@example.com",
      hash: bcrypt.hashSync("bananas", 10),
      entries: 0,
      joined: new Date(),
    },
  ],
};

const sanitizeUser = (user) => {
  if (!user) return null;
  const { hash, ...safeUser } = user;
  return safeUser;
};

app.get("/", (req, res) => {
  res.json(database.users.map(sanitizeUser));
});

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json("missing email or password");
  }

  const user = database.users.find((u) => u.email === email);
  if (!user) {
    return res.status(400).json("error logging in");
  }

  const isValid = await bcrypt.compare(password, user.hash);
  if (isValid) {
    return res.json(sanitizeUser(user));
  }

  return res.status(400).json("error logging in");
});

app.post("/register", async (req, res) => {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json("missing name, email, or password");
  }

  const exists = database.users.some((u) => u.email === email);
  if (exists) {
    return res.status(400).json("email already registered");
  }

  const hash = await bcrypt.hash(password, 10);

  const newUser = {
    id: String(database.users.length + 1),
    name,
    email,
    hash,
    entries: 0,
    joined: new Date(),
  };

  database.users.push(newUser);
  return res.json(sanitizeUser(newUser));
});

app.get("/profile/:id", (req, res) => {
  const { id } = req.params;

  const user = database.users.find((u) => u.id === id);
  if (user) return res.json(sanitizeUser(user));

  return res.status(404).json("user not found");
});

app.put("/image", (req, res) => {
  const { id } = req.body;

  if (!id) return res.status(400).json("missing id");

  const user = database.users.find((u) => u.id === id);
  if (!user) return res.status(404).json("user not found");

  user.entries += 1;
  return res.json(user.entries);
});

app.listen(PORT, () => {
  console.log(`app is running on port ${PORT}`);
});
