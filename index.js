require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const app = express();
app.use(cors());

// 🟢 اقرأ المفتاح الخاص من الملف
const privateKey = fs.readFileSync('./private_key.pem', 'utf8');

// 🟢 بيانات JaaS
const appId = process.env.APP_ID;
const tenant = process.env.TENANT_ID;

// 🟢 Prefix ثابت لكل الغرف على JaaS
const roomPrefix = `vpaas-magic-cookie-5539cb854a4d47aba650f080c97d11b9/01f783`;

app.get('/token', (req, res) => {
  try {
    const userName = req.query.name || 'Guest';
    const userEmail = req.query.email || 'guest@example.com';
    const roomName = req.query.room || 'default';
    const isModerator = req.query.moderator === 'true';

    // 🟢 هنا بيتم بناء room الكامل
    const room = `${roomPrefix}/${roomName}`;

    const payload = {
      aud: 'jitsi',
      iss: appId,
      sub: appId,
      room,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 3, // 3 ساعات
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

    const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
    res.send({ token });
  } catch (error) {
    console.error('❌ Error generating token:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`✅ Token server running`);
});
