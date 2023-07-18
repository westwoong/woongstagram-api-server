const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');
require('dotenv').config('../.env');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    timezone: "+09:00",
    define: {
        underscored: true
    }
});

const dbConnecting = async () => {
    try {
        await sequelize.authenticate();
        logger.info('sequelize connection success!');
        if (process.env.SERVER_SETTING === 'DEV') {
            await sequelize.sync({ force: false });
        }
        else if (process.env.SERVER_SETTING === 'LIVE'){
            await sequelize.sync({ force: true });
        }
    }
    catch (error) {
        logger.error(`connection failes :${error}`);
    }
}

dbConnecting();

module.exports = { sequelize };