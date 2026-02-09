import express from "express";
import bodyParser from "body-parser";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/signin", (req, res) => {
  res.json("signing in");
});

app.listen(3000, () => {
  console.log("app is running on port 3000");
});
