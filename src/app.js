import express from "express";
import dotenv from "dotenv";
import router from "./router.js";
import { requestLogger } from "./utils/loggers.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use((req, res, next) => {
  requestLogger(req);
  next();
});

app.use(router);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
