const { Post } = require('../models');
const { Op } = require('sequelize');

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

const searchPosts = async (limit, offset) => {
    return Post.findAll({ order: [['created_at', 'DESC']], limit, offset });
}

const postsCount = async () => {
    return Post.count();
}

const postCountByUserId = async (userId) => {
    return Post.count({ where: { userId } });
}

const searchPostsByContent = async (content, limit, offset) => {
    return Post.findAll({
        where: { content: { [Op.substring]: content } },
        order: [['created_at', 'DESC']],
        limit,
        offset
    });
}
const getPostsByContentCount = async (content) => {
    return Post.count({ where: { content: { [Op.substring]: content } } });
}

module.exports = {
    isExistByPostId,
    getInfoByPostId,
    getPostsByContentCount,
    createPost,
    deletePost,
    updatePost,
    searchPosts,
    searchPostsByContent,
    postsCount,
    postCountByUserId
}