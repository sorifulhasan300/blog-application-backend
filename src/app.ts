import express, { Router } from "express";
import router from "./route";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors";
import { NotFoundMiddleware } from "./middlewares/not-found";
import { errorHandler } from "./middlewares/error.middleware";

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      process.env.BETTER_AUTH_URL || "http://localhost:5000",
    ],
    credentials: true,
  }),
);
app.use(express.json());
router.all("/api/auth/*splat", toNodeHandler(auth));
app.use("/", router);
app.get("/", (req, res) => {
  res.send("hello world");
});
app.use(NotFoundMiddleware);
app.use(errorHandler);

export default app;
