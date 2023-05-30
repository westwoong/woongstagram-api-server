const { Like, Post } = require('../models');
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

module.exports = likesRoute;