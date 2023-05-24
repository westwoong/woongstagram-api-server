const { DataTypes } = require('sequelize');
const User = require('./Users');
const { sequelize } = require('../config/database');


const Follower = sequelize.define('follower', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    }
})


module.exports = Follower;