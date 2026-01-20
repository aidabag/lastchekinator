const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

// CORS middleware
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
  const num = req.query.num; // параметр num
  if (!num) return res.status(400).send('Number is required');

  const url = `https://kodaktor.ru/g/d7290da?${num}`;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: '/usr/bin/chromium-browser' // путь до системного Chromium
  });

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    await page.click('#bt');

    // ждём, пока поле #inp получит значение
    await page.waitForFunction(() => document.querySelector('#inp')?.value, { timeout: 2000 });

    const result = await page.$eval('#inp', el => el.value);

    res.send(result);
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  } finally {
    await browser.close();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
