const { User, Like, Post, Follower } = require('../models');
const express = require('express');
const likesRoute = express.Router();
const authorization = require('../middleware/jsontoken');
const asyncHandler = require('../middleware/asyncHandler');

likesRoute.post('/:postId', authorization, asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.user[0].id;
    const checkLikes = await Like.findOne({ where: { postId, userId } });
    const checkExistPost = await Post.findOne({ where: { id: postId } });
    if (!checkExistPost) {
        return res.status(404).send('없는 게시물 입니다.');
    }
    if (checkLikes) {
        return res.status(409).send('이미 좋아요를 누른 게시글입니다.');
    }

    await Like.create({ userId, postId });
    res.status(204).send();
}));

likesRoute.delete('/:postId', authorization, asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.user[0].id;
    await Like.destroy({ where: { userId, postId } });
    res.status(204).send();
}));

likesRoute.get('/:postId', authorization, asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const page = req.query.page || 1; // 클라이언트 값이 없을 시 기본값 1
    const limit = 2;
    const offset = (page - 1) * limit;
    const likes = await Like.findAll({ where: { postId }, attributes: ['userId', 'postId'], limit, offset });

    const likesData = [];

    for (const like of likes) {
        const users = await User.findOne({ where: { id: like.userId }, attributes: ['name', 'nickname'], limit, offset });
        const posts = await Post.findOne({ where: { id: postId }, attributes: ['userId'], limit });
        const follows = await Follower.findOne({ where: { follower_id: posts.userId } });
        const followCheck = follows ? true : false;

        likesData.push({
            name: users.name,
            nickname: users.nickname,
            isFollower: followCheck
        })
    }

    const totalLikesCount = await Like.count({ where: { postId } });
    const totalPages = Math.ceil(totalLikesCount / limit); // 전체 페이지 수 계산
    const nextPage = page < totalPages; // 다음 페이지 여부 있으면 true
    const prevPage = page > 1; // 이전 페이지 여부 있으면 true

    return res.status(200).send({
        likesData: likesData,
        pagination: {
            page,
            limit,
            totalLikesCount,
            totalPages,
            nextPage,
            prevPage
        }

    })
}));

module.exports = likesRoute;