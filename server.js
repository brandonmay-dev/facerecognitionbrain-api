import express from "express";

const app = express();
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
  res.json("signing in");
});

app.listen(3000, () => {
  console.log("app is running on port 3000");
});
