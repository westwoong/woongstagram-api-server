const { User, Like, Post, Follower } = require('../models');
const express = require('express');
const likesRoute = express.Router();
const Authorization = require('../middleware/jsontoken');
const ErrorCatch = require('../middleware/trycatch');

likesRoute.post('/:postId', Authorization, ErrorCatch(async (req, res) => {
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

likesRoute.delete('/:postId', Authorization, ErrorCatch(async (req, res) => {
    const { postId } = req.params;
    const userId = req.user[0].id;
    await Like.destroy({ where: { userId, postId } });
    res.status(204).send();
}));

likesRoute.get('/:postId', Authorization, ErrorCatch(async (req, res) => {
    const { postId } = req.params;
    const limit = 5;
    const likes = await Like.findAll({ where: { postId }, attributes: ['userId', 'postId'], limit });
    const UserNickname = [];
    const UserName = [];
    const isFollower = [];

    for (const like of likes) {
        const users = await User.findOne({ where: { id: like.userId }, attributes: ['name', 'nickname'], limit });
        const posts = await Post.findOne({ where: { id: postId }, attributes: ['userId'], limit });
        const follows = await Follower.findOne({ where: { follower_id: posts.userId } });
        const followCheck = follows ? true : false;

        UserName.push(users.name); // 좋아요 누른사람 실명
        UserNickname.push(users.nickname); // 좋아요 누른사람 별명
        isFollower.push(followCheck); // 팔로우 유무 확인
    }


    return res.status(200).send({
        likeusernickname: UserNickname,
        likeusername: UserName,
        isFollower: isFollower,
    });
}));

module.exports = likesRoute;