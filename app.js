const express = require('express');
const app = express();
require('dotenv').config();
require('./config/database');
require('./models/index');

app.listen(process.env.PORT, async () => {
    console.log(`서버가 실행됩니다. http://localhost:${process.env.PORT}`);
});