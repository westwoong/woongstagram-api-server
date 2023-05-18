const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');


const Comment = sequelize.define('comments', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },

})


module.exports = Comment;