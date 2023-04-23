const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('users', {
    id: {
        type: DataTypes.INTEGER(),
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "사용자 이름"
    },
    nickname: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        comment: "사용자 닉네임"
    },
    phone: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        comment: "사용자 휴대폰 번호(계정)"
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "사용자 비밀번호"
    },
    salt: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "비밀번호 암호화값"
    }
})
module.exports = User;