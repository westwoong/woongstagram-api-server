const { User } = require('../models');

const findOneUserNicknameAndNameByUserId = async (userId) => {
  return User.findOne({ where: { id: userId }, attributes: ['nickname', 'name'] });
}

const isExistByUserId = async (userId) => {
  return User.findAll({ where: { id: userId } });
}

module.exports = {
  findOneUserNicknameAndNameByUserId,
  isExistByUserId
}