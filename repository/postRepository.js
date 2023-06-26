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

const updatePost = async (content, postId, userId, transaction) => {
    return Post.update({ content }, { where: { id: postId, userId }, transaction });
}

const deletePost = async (postId, transaction) => {
    return Post.destroy({ where: { id: postId }, transaction });
}

module.exports = {
    isExistByPostId,
    getInfoByPostId,
    createPost,
    deletePost,
    updatePost
}