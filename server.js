const express = require('express');
const cors = require('cors');
const path = require('path');
const { port } = require('./src/config/env');
const hospitalsRouter = require('./src/routes/hospitals');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/hospitals', hospitalsRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
