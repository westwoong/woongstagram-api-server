const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Photo = sequelize.define('photos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "이미지 업로드 주소"
    }
})

module.exports = Photo;