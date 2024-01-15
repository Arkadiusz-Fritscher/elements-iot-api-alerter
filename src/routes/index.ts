import express from "express";
// Interfaces
import MessageResponse from "../interfaces/MessageResponse";
// Routes
import auth from "./auth";
import signup from "./signup";
import users from "./users";
import statistics from "./statistics";
import devices from "./devices";
import readings from "./readings";

const router = express.Router();

// Routes
router.get<{}, MessageResponse>("/", (req, res) => {
  res.json({
    message: "API - Hello World!",
  });
});

router.use("/auth", auth);
router.use("/signup", signup);
router.use("/users", users);
router.use("/statistics", statistics);
router.use("/devices", devices);
router.use("/readings", readings);

export default router;
