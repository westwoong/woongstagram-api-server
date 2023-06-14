const { Follower } = require('../models');
const express = require('express');
const followsRoute = express.Router();
const authorization = require('../middleware/jsontoken');
const asyncHandler = require('../middleware/trycatch');


followsRoute.post('/:followId', authorization, asyncHandler(async (req, res, next) => {
    const { followId } = req.params;
    const followerId = req.user[0].id;

    if (followId == followerId) {
        return res.status(400).send('본인을 팔로우 할 순 없습니다 ㅎㅎ...');
    }

    await Follower.create({ followId, followerId });
    return res.status(204).send();
}));

followsRoute.delete('/:followId', authorization, asyncHandler(async (req, res, next) => {
    const { followId } = req.params;
    const followerId = req.user[0].id;

    await Follower.destroy({ where: { followerId, followId } })
    return res.status(204).send();
}));

module.exports = followsRoute;