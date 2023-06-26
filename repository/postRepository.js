const { Post } = require('../models');

const isExistByPostId = async (postId) => {
    return Post.findOne({ where: { id: postId } });
}

const getInfoByPostId = async (postId, limit, offset) => {
    return Post.findOne({ where: { id: postId }, limit, offset });
}

const createPost = async (content, userId, transaction) => {
    return Post.create({ content, userId }, { transaction });
}

module.exports = {
    isExistByPostId,
    getInfoByPostId,
    createPost
}