const { User, Like, Post, Photo, Comment } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const { BadRequestException, NotFoundException, ForbiddenException } = require('../errors/IndexException');
const postService = require('../service/postService');
const { validatePost } = require('../service/validators/postValidator');

module.exports.createPost = asyncHandler(async (req, res) => {
    const { content, photos } = req.body;
    const userId = req.user[0].id;

    if (!content) {
        throw new BadRequestException('content의 값을 필수적으로 입력해야 합니다.')
    }

    if (!photos) {
        throw new BadRequestException('photos의 값을 필수적으로 입력해야 합니다.')
    }

    const result = await postService.create(content, photos, userId);
    return res.status(201).send({ result })
});

module.exports.modifyPost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { content, photos } = req.body;
    const userId = req.user[0].id;

    validatePost(content, photos);

    await sequelize.transaction(async (t) => {
        const updatePost = await Post.update({ content }, { where: { id: postId, userId }, transaction: t });

        const photoPromise = photos.map(async (photosUrl) => {
            const checkPhotoUrl = await Photo.findOne({ where: { url: photosUrl } });
            if (!checkPhotoUrl) {
                throw new NotFoundException(`${photosUrl}해당 이미지는 존재하지 않습니다.`);
            }
            await checkPhotoUrl.update({ postId: updatePost.id }, { transaction: t });
        });

        await Promise.all(photoPromise);
        return updatePost;
    });

    return res.status(204).send();
});

module.exports.deletePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.user[0].id;

    const posts = await Post.findOne({ where: { id: postId } });

    if (!posts) {
        throw new BadRequestException('게시물이 존재하지 않습니다.');
    }
    if (posts?.userId !== userId || posts === null) {
        throw new ForbiddenException('본인의 게시글만 삭제가 가능합니다.');
    }

    await sequelize.transaction(async (t) => {
        await Like.destroy({ where: { postId }, transaction: t })
        await Comment.destroy({ where: { postId }, transaction: t });
        await Post.destroy({ where: { id: postId }, transaction: t });
    });

    return res.status(204).send();
});

module.exports.searchPosts = asyncHandler(async (req, res) => {
    const page = req.query.page || 1;
    const limit = 2;
    const offset = (page - 1) * limit;

    const posts = await Post.findAll({
        attributes: ['id', 'user_id', 'created_at', 'content'], order: [['created_at', 'DESC']], limit, offset
    });
    const postId = posts.map(post => post.id);
    const postLikeCounts = await Like.findAll({
        attributes: ['postId', [sequelize.fn('COUNT', sequelize.col('id')), 'like_count']],
        where: { postId },
        group: ['postId']
    });
    const postCommentCounts = await Comment.findAll({
        attributes: ['postId', [sequelize.fn('COUNT', sequelize.col('id')), 'comment_count']],
        where: { postId },
        group: ['postId']
    });
    const postPhotos = await Photo.findAll({ where: { postId }, attributes: ['postId', 'url'], order: [['created_at', 'DESC']], limit });

    const postsData = [];

    for (const post of posts) {
        const { id, user_id, created_at } = post.dataValues;
        const findUserNickname = await User.findOne({
            where: { id: user_id },
            attributes: ['nickname']
        });
        const findComments = await Comment.findAll({
            where: { postId: id },
            attributes: ['content', 'userId'],
            order: [['created_at', 'DESC']],
            limit: 1
        });
        const commentUserId = findComments.map(comment => comment.dataValues.userId);
        const userNicknames = await User.findAll({ where: { id: commentUserId }, attributes: ['id', 'nickname'] });


        const commentsAndNickname = findComments.map(comment => {
            const userNickname = userNicknames.find(user => user.id === comment.userId)?.nickname || '';
            return {
                nickname: userNickname,
                comment: comment.content
            };
        });

        const checkPostLikes = postLikeCounts.find(like => like.postId === id);
        const likeCount = checkPostLikes ? checkPostLikes.dataValues.like_count : 0;
        const checkPostComments = postCommentCounts.find(comment => comment.postId === id);
        const commentCount = checkPostComments ? checkPostComments.dataValues.comment_count : 0;
        const postPhotosUrl = postPhotos.filter(photo => photo.postId === id).map(photo => photo.url);

        postsData.push({
            contents: post.content,
            created_time: created_at,
            usernickname: findUserNickname.nickname,
            likecount: likeCount,
            commentcount: commentCount,
            commentList: commentsAndNickname,
            images: postPhotosUrl
        });

    }
    const totalPostCount = await Post.count();
    const totalPages = Math.ceil(totalPostCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return res.status(200).send({
        posts: postsData,
        pagination: {
            page,
            limit,
            totalPostCount,
            totalPages,
            hasNextPage,
            hasPreviousPage
        }
    });

});

module.exports.searchPostsByContent = asyncHandler(async (req, res) => {
    const { content } = req.params;
    const page = req.query.page || 1;
    const limit = 2;
    const offset = (page - 1) * limit;

    const posts = await Post.findAll({
        where: { content: { [Op.substring]: content } },
        order: [['created_at', 'DESC']],
        limit,
        offset
    });
    const postId = posts.map(post => post.id);

    const postLikesCount = await Like.findAll({
        attributes: ['postId', [sequelize.fn('COUNT', sequelize.col('id')), 'like_count']],
        where: { postId },
        group: ['postId']
    });

    const postsData = [];

    for (const post of posts) {
        const findUserNickname = await User.findOne({
            where: { id: post.userId },
            attributes: ['nickname']
        });

        const checkPostLikes = postLikesCount.find(like => like.postId === post.id);
        const likeCount = checkPostLikes ? checkPostLikes.dataValues.like_count : 0;
        const postPhotos = await Photo.findAll({ where: { postId }, attributes: ['postId', 'url'], order: [['created_at', 'DESC']], limit });

        for (const photo of postPhotos) {
            const { url } = photo.dataValues;
            postsData.push({
                content: post.content,
                createAt: post.createAt,
                nickname: findUserNickname.nickname,
                likeCount: likeCount,
                image: url
            })
        }
    }

    const totalPostCount = await Post.count({ where: { content: { [Op.substring]: content } } });
    const totalPages = Math.ceil(totalPostCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return res.status(200).send({
        postsData: postsData,
        pagination: {
            page,
            limit,
            totalPostCount,
            totalPages,
            hasNextPage,
            hasPreviousPage
        }
    });
});
