require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const app = express();
app.use(cors());

const privateKey = process.env.PRIVATE_KEY.replace(/\\n/g, '\n');
const appId = process.env.APP_ID;
const tenant = process.env.TENANT_ID;

app.get('/token', (req, res) => {
  const userName = req.query.name || 'Guest';
  const userEmail = req.query.email || 'guest@example.com';
  const room = req.query.room || '*';
  const isModerator = req.query.moderator === 'true';

  const payload = {
    aud: 'jitsi',
    iss: appId,
    sub: tenant,
    room,
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
    context: {
      user: {
        name: userName,
        email: userEmail,
        moderator: isModerator
      },
      features: {
        livestreaming: true,
        outbound_call: true,
        transcribing: true
      }
    }
  };

  const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
  res.send({ token });
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`✅ Token server running`);
});

