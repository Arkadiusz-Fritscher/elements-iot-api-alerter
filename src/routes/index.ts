import express from "express";
// Interfaces
import MessageResponse from "../interfaces/MessageResponse";
// Routes
import auth from "./auth";
import signup from "./signup";
import users from "./users";

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

export default router;