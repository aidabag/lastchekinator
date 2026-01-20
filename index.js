const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

// маршрут /login/
app.get('/login/', (_, res) => {
  res.send('aidabag'); // твой логин
});

// маршрут /zombie/
app.get('/zombie', async (req, res) => {
  const num = req.query.num; // <- берём параметр num
  if (!num) return res.status(400).send('Number is required');

  const url = `https://kodaktor.ru/g/d7290da?${num}`;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: '/usr/bin/chromium-browser' // для Render
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  // ждём появления кнопки и кликаем
  await page.click('#bt');

  // ждём, пока в поле inp появится значение
  await page.waitForFunction(() => document.querySelector('#inp')?.value, { timeout: 2000 });

  const result = await page.$eval('#inp', el => el.value);

  await browser.close();

  res.send(result); // возвращаем число
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
