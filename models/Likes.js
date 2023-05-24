const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');


const Like = sequelize.define('likes', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },

})


module.exports = Like;