const { Like } = require('../models');
const { sequelize } = require('../config/database');

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

const getLikedByPostId = async (postId, limit, offset) => {
    return Like.findAll({ where: { postId }, limit, offset });
};

const getLikeCountByPostId = async (postId) => {
    return Like.count({ where: { postId } });
};

const getPostLikesCountByPostId = async (postId) => {
    return Like.findAll({
        attributes: ['postId', [sequelize.fn('COUNT', sequelize.col('id')), 'like_count']],
        where: { postId },
        group: ['postId']
    });
}

module.exports = {
    likeByPostId,
    unLikeByPostIdAndUserId,
    unLikeByPostId,
    isLikeByPostIdAndUserId,
    getLikedByPostId,
    getLikeCountByPostId,
    getPostLikesCountByPostId
}