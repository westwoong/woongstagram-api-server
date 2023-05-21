const { Like } = require('../models');
const express = require('express');
const likesRoute = express.Router();
const Authorization = require('../middleware/jsontoken');
const ErrorCatch = require('../middleware/trycatch');

likesRoute.post('/:postId', Authorization, ErrorCatch(async (req, res) => {
    const { postId } = req.params;
    const payloadArray = req.user[0];
    const checkLikes = await Like.findOne({ where: { postId, userId: payloadArray.id } });
    if (checkLikes) {
        return res.status(409).send('이미 좋아요를 누른 게시글입니다.');
    }
    await Like.create({ userId: payloadArray.id, postId });
    res.status(204).send();
}));

likesRoute.delete('/:postId', Authorization, ErrorCatch(async (req, res) => {
    const { postId } = req.params;
    const payloadArray = req.user[0];
    await Like.create({ userId: payloadArray.id, postId });
    res.status(204).send();
}));

module.exports = likesRoute;