const { User } = require('../models');

const getUserNicknameAndNameByUserId = async (userId, limit, offset) => {
  return User.findOne({ where: { id: userId }, attributes: ['nickname', 'name'], limit, offset });
}


const isExistByUserId = async (userId) => {
  return User.findAll({ where: { id: userId } });
}

module.exports = {
  getUserNicknameAndNameByUserId,
  isExistByUserId
}