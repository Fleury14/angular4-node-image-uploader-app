const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
const bodyParser = require('body-parser');

const routes = require('./routes/images');

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Method', 'GET, PUT, POST, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type', 'Authorization');
  next();
});

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/images', routes);

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.listen(port, () => {
  console.log('Example app listening on port 3001!');
});