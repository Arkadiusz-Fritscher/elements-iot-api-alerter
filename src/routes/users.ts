import express from "express";

const router = express.Router();

// type EmojiResponse = string[];

// router.get<{}, EmojiResponse>('/', (req, res) => {
//   res.json(['😀', '😳', '🙄']);
// });

router.get("/", (req, res) => {
  res.json({
    message: "Protected API - USERS!",
  });
});

export default router;
