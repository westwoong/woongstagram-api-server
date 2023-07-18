const { Post, User, Comment, Photo } = require('../models');
const { sequelize } = require('../config/database');
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
    return getPostsDetailData(limit, offset);
};

const postsCount = async () => {
    return Post.count();
}

const postCountByUserId = async (userId) => {
    return Post.count({ where: { userId } });
}

const searchPostsByContent = async (content, limit, offset) => {
    return getPostsByContentDetail(content, limit, offset);
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

function getPostsDetailData(limit, offset) {
    return Post.findAll({
        order: [['created_at', 'DESC']],
        limit,
        offset,
        include: [
            {
                model: User,
                attributes: ['nickname'],
                as: 'user',
                required: true,
            },
            {
                model: Comment,
                attributes: ['content', 'createdAt'],
                as: 'comments',
                include: [
                    {
                        model: User,
                        attributes: ['nickname'],
                        as: 'user',
                        required: false,
                    },
                ],
                required: false,
            },
            {
                model: Photo,
                attributes: ['url'],
                as: 'photos',
                required: false,
            },
        ],
        group: ['posts.id', 'user.id', 'comments.id', 'photos.id'],
        subQuery: false,
        attributes: {
            include: [
                [sequelize.literal('(SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id)'), 'comments_count'],
                [sequelize.literal('(SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id)'), 'likes_count'],
            ],
        },
    });
}

function getPostsByContentDetail(content, limit, offset) {
    return Post.findAll({
        where: { content: { [Op.substring]: content } },
        order: [['created_at', 'DESC']],
        limit,
        offset,
        include: [
            {
                model: User,
                attributes: ['nickname'],
                as: 'user',
                required: true,
            },
            {
                model: Comment,
                attributes: ['content', 'createdAt'],
                as: 'comments',
                include: [
                    {
                        model: User,
                        attributes: ['nickname'],
                        as: 'user',
                        required: false,
                    },
                ],
                required: false,
            },
            {
                model: Photo,
                attributes: ['url'],
                as: 'photos',
                required: false,
            },
        ],
        group: ['posts.id', 'user.id', 'comments.id', 'photos.id'],
        subQuery: false,
        attributes: {
            include: [
                [sequelize.literal('(SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id)'), 'comments_count'],
                [sequelize.literal('(SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id)'), 'likes_count'],
            ],
        }
    });
}