const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');


const Comment = sequelize.define('comments', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    content: {
        type: DataTypes.STRING,
        allowNull: false
    }

})


module.exports = Comment;