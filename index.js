require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());

// 🗝️ تحميل المفتاح الخاص
const privateKey = fs.readFileSync(path.join(__dirname, 'private_key.pem'), 'utf8');

// 🆔 بيانات الـ App والـ Tenant
const appId = process.env.APP_ID;
const tenant = process.env.TENANT_ID;

// 🔐 إنشاء التوكن
app.get('/token', (req, res) => {
  try {
    const userName = req.query.name || 'Guest';
    const userEmail = req.query.email || 'guest@example.com';
    const roomName = req.query.room || '*'; // لو عايزة تخليه داينمك حطي req.query.room
    const isModerator = req.query.moderator === 'true';

    const payload = {
      aud: 'jitsi',
      iss: appId,
      sub: tenant,
      room: roomName, // هنا ممكن تعملي "*", أو `${prefix}/${roomName}` لو عايزة تحديد غرفة
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 3, // 3 ساعات
      iat: Math.floor(Date.now() / 1000),
      context: {
        user: {
          name: userName,
          email: userEmail,
          moderator: isModerator
        }
      }
    };

    const token = jwt.sign(payload, privateKey, {
      algorithm: 'RS256',
      keyid: '0a1615' // لازم تطابق الـ API Key ID
    });

    res.send({ token });
  } catch (error) {
    console.error('❌ Error generating token:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// 🚀 تشغيل السيرفر
app.listen(process.env.PORT || 3000, () => {
  console.log(`✅ Token server running`);
});
