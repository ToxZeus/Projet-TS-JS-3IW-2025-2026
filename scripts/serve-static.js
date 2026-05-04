import express from "express";
import path from "node:path";

const app = express();
const port = Number(process.env.WEB_PORT || 5500);
const rootDir = process.cwd();

// Serve project files so browser modules work over HTTP.
app.use(express.static(rootDir));

// Send index.html on the root route.
app.get("/", (_request, response) => {
  response.sendFile(path.join(rootDir, "index.html"));
});

// Start the local web server.
app.listen(port, () => {
  console.log(`Frontend disponible sur http://localhost:${port}`);
});
