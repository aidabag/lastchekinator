const express = require('express');
const puppeteer = require('puppeteer-core');

const app = express();

// CORS middleware (если нужно)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

// Маршрут /login
app.get('/login', (_req, res) => {
  res.send('aidabag'); // твой логин
});

// Маршрут /zombie?num=1234
app.get('/zombie', async (req, res) => {
  const num = req.query.num;
  if (!num) {
    return res.status(400).send('Number is required');
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    const targetURL = `https://kodaktor.ru/g/d7290da?${num}`;
    await page.goto(targetURL, { waitUntil: 'networkidle2' });

    // Кликаем по кнопке с id="bt"
    await page.click('#bt');

    // Ждём, пока в поле inp появится значение
    await page.waitForFunction(() => {
      const input = document.querySelector('#inp');
      return input && input.value !== '';
    }, { timeout: 2000 });

    const result = await page.$eval('#inp', el => el.value);

    await browser.close();
    res.set('Content-Type', 'text/plain');
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error executing Puppeteer');
  }
});

// Render автоматически берёт PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
