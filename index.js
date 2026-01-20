const express = require('express');
const puppeteer = require('puppeteer');

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
  res.send('aidabag'); 
});

// /zombie
app.get('/zombie', async (req, res) => {
  const number = req.query[Object.keys(req.query)[0]]; // Получаем число из query

  if (!number) return res.status(400).send('Number is required');

  const url = `https://kodaktor.ru/g/d7290da?${number}`;

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Клик по кнопке
    await page.click('#bt');

    // Ждём появления результата в поле #inp
    await page.waitForFunction(() => {
      const input = document.querySelector('#inp');
      return input && input.value.length > 0;
    }, { timeout: 2000 });

    // Чтение значения
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
