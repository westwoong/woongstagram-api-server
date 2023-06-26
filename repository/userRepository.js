const { User } = require('../models');
const findOneUserNicknameAndNameByUserId = async (userId) => {
  return User.findOne({ where: { id: userId }, attributes: ['nickname', 'name'] });
}

module.exports = {
  findOneUserNicknameAndNameByUserId
}