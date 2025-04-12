const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const fs = require("fs");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const APP_ID = process.env.APP_ID;
const SUB = process.env.SUB;
const KEY_ID = process.env.KEY_ID;
const privateKey = fs.readFileSync("./private.key", "utf8");

app.post("/get-token", (req, res) => {
  const { name, email, room, isModerator } = req.body;

  if (!name || !room) {
    return res.status(400).send("Missing name or room");
  }

  const payload = {
    aud: "jitsi",
    iss: APP_ID,
    sub: SUB,
    room: `${SUB}/${room}`,
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
    context: {
      user: {
        name,
        email: email || "",
        moderator: isModerator || false
      }
    }
  };

  const token = jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    keyid: KEY_ID
  });

  res.json({ token });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Token server running on port ${PORT}`);
});
