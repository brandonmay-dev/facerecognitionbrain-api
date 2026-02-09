import express from "express";

const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.json());

const database = {
  users: [
    {
      id: "123",
      name: "John",
      email: "john@example.com",
      password: "cookies",
      entries: 0,
      joined: new Date(),
    },
    {
      id: "124",
      name: "Sally",
      email: "sally@example.com",
      password: "bananas",
      entries: 0,
      joined: new Date(),
    },
  ],
};

app.get("/", (req, res) => {
  res.send("Hello World");
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

app.listen(PORT, () => {
  console.log("app is running on port 3000");
});
