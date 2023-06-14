const { User, Like, Post, Photo, Comment } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const express = require('express');
const postsRoute = express.Router();
const authorization = require('../middleware/jwtAuth');
const asyncHandler = require('../middleware/asyncHandler');
const { BadRequestException, NotFoundException, ForbiddenException } = require('../errors/IndexException');

postsRoute.post('/', authorization, asyncHandler(async (req, res, next) => {
    const { content, photos } = req.body;
    const userId = req.user[0].id;

    if (!content || content.length === 0) {
        throw new BadRequestException('본문의 내용을 입력해 주시기 바랍니다');
    }
    if (content.length > 1000) {
        throw new BadRequestException('본문의 내용은 최대 1000자 까지 입력이 가능합니다.');
    }
    for (let photoArrayLength = 0; photoArrayLength < photos.length; photoArrayLength++) {
        if (!photos[photoArrayLength].startsWith(`${process.env.S3_BUCKET_URL}`)) {
            throw new BadRequestException(`${process.env.S3_BUCKET_URL} 로 시작하는 이미지 주소를 입력해주세요`);
        }
    }

    const validationPhotosUrl = [];

    const postTransaction = await sequelize.transaction(async (t) => {
        const createPost = await Post.create({ content, userId }, { transaction: t });

        const photoPromise = photos.map(async (photosUrl) => {
            const checkPhotoUrl = await Photo.findOne({ where: { url: photosUrl } });
            if (!checkPhotoUrl) {
                validationPhotosUrl.push(photosUrl);
            } else {
                await checkPhotoUrl.update({ postId: createPost.id }, { transaction: t });
            }
        });

        await Promise.all(photoPromise);

        if (validationPhotosUrl.length > 0) {
            const failsPhotosUrl = validationPhotosUrl.join(', ');
            throw new NotFoundException(`${failsPhotosUrl} 해당 이미지 주소는 존재하지않습니다.`);
        }
        else {
            return res.status(201).send({ postTransaction });
        }
    });
}));

postsRoute.patch('/:postId', authorization, asyncHandler(async (req, res, next) => {
    const { postId } = req.params;
    const { content, photos } = req.body;
    const userId = req.user[0].id;

    if (!content || content.length === 0) {
        throw new BadRequestException('본문의 내용을 입력해 주시기 바랍니다');
    }
    if (content.length > 1000) {
        throw new BadRequestException('본문의 내용은 최대 1000자 까지 입력이 가능합니다.');
    }
    for (let photoArrayLength = 0; photoArrayLength < photos.length; photoArrayLength++) {
        if (!photos[photoArrayLength].startsWith(`${process.env.S3_BUCKET_URL}`)) {
            throw new BadRequestException(`${process.env.S3_BUCKET_URL} 로 시작하는 이미지 주소를 입력해주세요`);
        }
    }

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
}));

postsRoute.delete('/:postId', authorization, asyncHandler(async (req, res, next) => {
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
}));

postsRoute.get('/', authorization, asyncHandler(async (req, res, next) => {
    const page = req.query.page || 1;
    const limit = 2;
    const offset = (page - 1) * limit;

    const posts = await Post.findAll({
        attributes: ['id', 'user_id', 'created_at', 'content'], order: [['created_at', 'DESC']], limit, offset
    });
    const postId = posts.map(post => post.id);
    const postLikesCount = await Like.findAll({
        attributes: ['postId', [sequelize.fn('COUNT', sequelize.col('id')), 'like_count']],
        where: { postId },
        group: ['postId']
    });
    const postCommentsCount = await Comment.findAll({
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

        // find메서드를 사용하여 PostLikesCount에 있는 postId의 값을 찾은 후 post.dataValues.id과 동일하면 변수에 할당
        const checkPostLikes = postLikesCount.find(like => like.postId === id);
        // ?를 사용해서 checkPostLikes의 값이 null이나 undefined가 아니면 이후 코드 실행
        const likeCount = checkPostLikes ? checkPostLikes.dataValues.like_count : 0;
        const checkPostComments = postCommentsCount.find(comment => comment.postId === id);
        const commentCount = checkPostComments ? checkPostComments.dataValues.comment_count : 0;

        // 사진중 postId가 동일한것만 map으로 url만 반환
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
    const totalPostCount = await Post.count(); // 전체 게시글 수 조회
    const totalPages = Math.ceil(totalPostCount / limit); // 전체 페이지 수 계산
    const nextPage = page < totalPages; // 다음 페이지 여부 있으면 true
    const prevPage = page > 1; // 이전 페이지 여부 있으면 true

    return res.status(200).send({
        posts: postsData,
        pagination: {
            page,
            limit,
            totalPostCount,
            totalPages,
            nextPage,
            prevPage
        }
    });

}));

postsRoute.get('/:content', authorization, asyncHandler(async (req, res, next) => {
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

    const totalPostCount = await Post.count({ where: { content: { [Op.substring]: content } } }); // 검색한 내용이 포함된 게시글 수 조회
    const totalPages = Math.ceil(totalPostCount / limit); // 전체 페이지 수 계산
    const nextPage = page < totalPages; // 다음 페이지 여부 있으면 true
    const prevPage = page > 1; // 이전 페이지 여부 있으면 true

    return res.status(200).send({
        postsData: postsData,
        pagination: {
            page,
            limit,
            totalPostCount,
            totalPages,
            nextPage,
            prevPage
        }
    });
}));

module.exports = postsRoute;