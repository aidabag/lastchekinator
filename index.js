const express = require('express');
const axios = require('axios');
const { JSDOM } = require('jsdom');

const app = express();

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

// /login возвращает логин
app.get('/login', (_req, res) => {
  res.send('aidabag');
});

// /zombie?num=<число>
app.get('/zombie', async (req, res) => {
  const num = req.query.num;
  if (!num) return res.status(400).send('Number is required');

  try {
    // Подставляем число в URL
    const url = `https://kodaktor.ru/g/d7290da?${num}`;
    const response = await axios.get(url);

    // Парсим HTML с jsdom
    const dom = new JSDOM(response.data);
    const input = dom.window.document.querySelector('#inp');

    if (!input) return res.status(500).send('Input not found');

    res.set('Content-Type', 'text/plain');
    res.send(input.value);
  } catch (err) {
    res.status(500).send('Error fetching page');
  }
});

// Все остальные маршруты
app.all('*', (_req, res) => {
  res.status(404).send('Not Found');
});

// Запуск сервера
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
