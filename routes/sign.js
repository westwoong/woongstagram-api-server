const crypto = require('crypto');
const { User } = require('../models');

const signUp = async (req, res) => {
    const { name, nickname, password, phoneNumber } = req.body;
    console.log(name, nickname, password, phoneNumber);
}

module.exports = signUp;