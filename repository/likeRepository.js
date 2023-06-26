const { Like } = require('../models');

const likeByPostId = async (postId, userId) => {
    return Like.create({ postId, userId });
};

const unLikeByPostId = async (postId, userId) => {
    return Like.destroy({ where: { postId, userId } });
};

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
    unLikeByPostId,
    isLikeByPostIdAndUserId,
    getLikedBypostId,
    getLikeCountByPostId
}