const { Transaction } = require('sequelize/lib/sequelize');
const { Like } = require('../models');

const likeByPostId = async (postId, userId) => {
    return Like.create({ postId, userId });
};

const unLikeByPostIdAndUserId = async (postId, userId) => {
    return Like.destroy({ where: { postId, userId } });
};

const unLikeByPostId = async (postId, transaction) => {
    return Like.destroy({ where: { postId }, transaction });
}

const isLikeByPostIdAndUserId = async (postId, userId) => {
    return Like.findOne({ where: { postId, userId } });
};

const getLikedBypostId = async (postId, limit, offset) => {
    return Like.findAll({ where: { postId }, limit, offset });
};

const getLikeCountByPostId = async (postId) => {
    return Like.count({ where: { postId } });
};

module.exports = {
    likeByPostId,
    unLikeByPostIdAndUserId,
    unLikeByPostId,
    isLikeByPostIdAndUserId,
    getLikedBypostId,
    getLikeCountByPostId
}