import { createApp } from "./app";
import { config } from "./config";

const app = createApp();

app.listen(config.port, () => {
  console.log(`Stocks API running on http://localhost:${config.port}`);
});
console.log("Projet TS/JS 3IW prêt pour l'API stocks.");
