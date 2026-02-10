import express from "express";
import { log } from "node:console";
import bcrypt from "bcrypt-nodejs";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

const database = {
  users: [
    {
      id: "123",
      name: "John",
      email: "john@example.com",
      entries: 0,
      joined: new Date(),
    },
    {
      id: "124",
      name: "Sally",
      email: "sally@example.com",
      entries: 0,
      joined: new Date(),
    },
  ],
  login: [
    {
      id: "987",
      hash: "",
      email: "john@example.com",
    },
  ],
};

app.get("/", (req, res) => {
  res.send(database.users);
});

app.post("/signin", (req, res) => {
  const { email, password } = req.body;

  const user = database.users.find(
    (u) => u.email === email && u.password === password,
  );

  if (user) {
    res.json("success");
  } else {
    res.status(400).json("error logging in");
  }
});

app.post("/register", (req, res) => {
  const { email, name, password } = req.body;

  const newUser = {
    id: String(database.users.length + 1),
    name,
    email,
    password,
    entries: 0,
    joined: new Date(),
  };

  database.users.push(newUser);
  res.json(newUser);
});

app.get("/profile/:id", (req, res) => {
  const { id } = req.params;

  const user = database.users.find((u) => u.id === id);

  if (user) {
    res.json(user);
  } else {
    res.status(400).json("user not found");
  }
});

app.put("/image", (req, res) => {
  const { id } = req.body;

  const user = database.users.find((u) => u.id === id);

  if (user) {
    user.entries++;
    res.json(user.entries);
  } else {
    res.status(400).json("user not found");
  }
});

app.listen(PORT, () => {
  console.log(`app is running on port ${PORT}`);
});

bcrypt.hash("bacon", null, null, function (err, hash) {
  // Store hash in your password DB.
});

// Load hash from your password DB.
bcrypt.compare("bacon", hash, function (err, res) {
  // res == true
});
bcrypt.compare("veggies", hash, function (err, res) {
  // res = false
});
