const express = require('express');
const puppeteer = require('puppeteer-core');

const app = express();

// Заголовки CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

// /login
app.get('/login', (_req, res) => {
  res.send('aidabag'); // ваш логин
});

// /zombie
app.get('/zombie', async (req, res) => {
  const queryKeys = Object.keys(req.query);
  if (queryKeys.length === 0) return res.status(400).send('Number is required');

  const number = req.query[queryKeys[0]];
  const url = `https://kodaktor.ru/g/d7290da?${number}`;

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium-browser', // системный Chromium на Render
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Клик по кнопке #bt
    await page.click('#bt');

    // Ждём появления значения в поле #inp
    await page.waitForFunction(() => {
      const el = document.querySelector('#inp');
      return el && el.value.length > 0;
    }, { timeout: 2000 });

    const result = await page.$eval('#inp', el => el.value);
    res.send(result);

  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  } finally {
    if (browser) await browser.close();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
