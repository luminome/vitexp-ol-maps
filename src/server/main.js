import express from "express";
import ViteExpress from "vite-express";

const app = express();

app.get("/hello", (req, res) => {
  res.send("Hello Vite!");
});

const port = Number(process.env.PORT) || 8000;

ViteExpress.listen(app, port, () =>
  console.log(`Server is listening on port ${port}...`),
);
