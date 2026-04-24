import express from "express";
import path from "node:path";

const app = express();
const port = Number(process.env.WEB_PORT || 5500);
const rootDir = process.cwd();

app.use(express.static(rootDir));

app.get("/", (_request, response) => {
  response.sendFile(path.join(rootDir, "index.html"));
});

app.listen(port, () => {
  console.log(`Frontend disponible sur http://localhost:${port}`);
});
