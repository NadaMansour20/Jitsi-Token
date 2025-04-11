const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const APP_ID = process.env.APP_ID;       // يحتوي على البادئة الكاملة
const APP_SECRET = process.env.APP_SECRET;
const SUB = process.env.SUB;             // يحتوي على البادئة الكاملة

app.post("/get-token", (req, res) => {
  const { name, email, room, isModerator } = req.body;

  if (!name || !room) {
    return res.status(400).send("Missing name or room");
  }

  const payload = {
    aud: "jitsi",
    iss: APP_ID,          // ✅ نفس .env
    sub: SUB,             // ✅ نفس .env
    room: room,           // ✅ بدون أي بريفكس، التوكن فيه البادئة بالفعل
    exp: Math.floor(Date.now() / 1000) + 3600,
    context: {
      user: {
        name: name,
        email: email || "",
        moderator: isModerator || false,
      },
    },
  };

  const token = jwt.sign(payload, APP_SECRET, {
    algorithm: "HS256",
    header: {
      kid: APP_ID          // ✅ نفس .env
    }
  });

  res.json({ token });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
