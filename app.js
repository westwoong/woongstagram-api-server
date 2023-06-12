const express = require('express');
const app = express();
app.use(express.json());
require('dotenv').config();
require('./config/database');
require('./models/index');
const morgan = require('morgan');
const logger = require('./utils/logger');
app.use(morgan('combined', { stream: logger.stream }));

// router 정의
const routes = require('./routes');
routes(app);

app.listen(process.env.PORT, async () => {
    console.log(`서버가 실행됩니다. http://localhost:${process.env.PORT}`);
});