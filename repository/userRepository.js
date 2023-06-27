const { User } = require('../models');

const createUser = async (phoneNumber, name, nickname, salt, password) => {
  return User.create({ phoneNumber, name, nickname, salt, password });
}

const updateRefreshTokenByUserId = async (refreshToken, id) => {
  return User.update({ refreshToken }, { where: { id } });
}

const getUserInfoByUserId = async (userId, limit, offset) => {
  return User.findAll({
    where: { id: userId },
    attributes: ['id', 'name', 'nickname', 'phone_number', 'created_at', 'updated_at'],
    limit,
    offset
  });
}

const isExistByUserId = async (userId) => {
  return User.findOne({ where: { id: userId } });
}

const isExistByPhoneNumber = async (phoneNumber) => {
  return User.findOne({ attributes: ['phone_number'], where: { phoneNumber } });
}

const isExistByNickname = async (nickname) => {
  return User.findOne({ attributes: ['nickname'], where: { nickname } });
}

const findUserPasswordByPhoneNumber = async (phoneNumber) => {
  return User.findAll({ attributes: ['password'], where: { phoneNumber } });
}

const findUserSaltByPhoneNumber = async (phoneNumber) => {
  return User.findAll({ attributes: ['salt'], where: { phoneNumber } });
}

const findUserPrimaryKeyByPhoneNumber = async (phoneNumber) => {
  return User.findAll({ attributes: ['id'], where: { phoneNumber } });
}

const findRefreshTokenByUserId = async (userId) => {
  return User.findOne({ where: { id: userId }, attributes: ['refresh_Token'] });
}


module.exports = {
  createUser,
  updateRefreshTokenByUserId,
  getUserInfoByUserId,
  findUserPasswordByPhoneNumber,
  findUserSaltByPhoneNumber,
  findUserPrimaryKeyByPhoneNumber,
  findRefreshTokenByUserId,
  isExistByUserId,
  isExistByPhoneNumber,
  isExistByNickname
}