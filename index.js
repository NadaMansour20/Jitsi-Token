require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());

const privateKey = fs.readFileSync(path.join(__dirname, 'private_key.pem'), 'utf8');
const appId = process.env.APP_ID;
const tenant = process.env.TENANT_ID;
const roomPrefix = `${appId}/d49a69`; // لازم تبدّل d49a69 بالقيمة اللي ظهرالك في الـ API Key ID

app.get('/token', (req, res) => {
  try {
    const userName = req.query.name || 'Guest';
    const userEmail = req.query.email || 'guest@example.com';
    const roomName = req.query.room || 'default';
    const isModerator = req.query.moderator === 'true';

    const room = `${roomPrefix}/${roomName}`;

    const payload = {
      aud: 'jitsi',
      iss: appId,
      sub: tenant,
      room,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 3,
      iat: Math.floor(Date.now() / 1000),
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

    const token = jwt.sign(payload, privateKey, {
      algorithm: 'RS256',
      keyid: 'd49a69' // لازم تكون هي نفسها اللي في رابط الـ API Key
    });

    res.send({ token });

  } catch (error) {
    console.error('❌ Error generating token:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`✅ Token server running`);
});
