const { Post } = require('../models');

const isExistByPostId = async (postId) => {
    return Post.findOne({ where: { id: postId } });
}

const getInfoByPostId = async (postId, limit, offset) => {
    return Post.findOne({ where: { id: postId }, limit, offset });
}

module.exports = {
    isExistByPostId,
    getInfoByPostId
}