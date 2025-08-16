const express = require('express');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;

app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

function checkTelegramAuth(data) {
  const secret = crypto.createHash('sha256').update(BOT_TOKEN).digest();
  const { hash, ...fields } = data;
  const sorted = Object.entries(fields)
    .sort()
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
  const hmac = crypto.createHmac('sha256', secret).update(sorted).digest('hex');
  return hmac === hash;
}

app.get('/auth', (req, res) => {
  if (!checkTelegramAuth(req.query)) {
    return res.status(403).send('Ошибка авторизации');
  }
  const userData = JSON.stringify(req.query);
  const html = `
    <script>
      localStorage.setItem("tg_user", '${userData}');
      window.location.href = "/";
    </script>
  `;
  res.send(html);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);

});


