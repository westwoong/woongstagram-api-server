const { User } = require('../models');

const getUserInfoByUserId = async (userId, limit, offset) => {
  return User.findAll({ where: { id : userId }, limit, offset});
}

const isExistByUserId = async (userId) => {
  return User.findAll({ where: { id: userId } });
}

module.exports = {
  getUserInfoByUserId,
  isExistByUserId
}