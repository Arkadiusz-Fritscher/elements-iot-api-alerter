import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
// Middlewares
import { protectedRoute } from "./middlewares/protectedMiddleware";
import { errorHandler, notFound } from "./middlewares/errorMiddlewares";
// Routes
import api from "./routes";
// App Logic
import handleDevices from "./services/deviceModule";

dotenv.config();

handleDevices();

// App
const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.type("html").send(`<h1>Hello world!</h1>`);
});
// Before API Route

// app.use(protectedRoute);
// API Routes
app.use("/api/v1", api);

// After API Route
app.use(notFound);
app.use(errorHandler);

export default app;
