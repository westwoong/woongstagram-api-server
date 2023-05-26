const { Follower } = require('../models');
const express = require('express');
const followsRoute = express.Router();
const Authorization = require('../middleware/jsontoken');
const ErrorCatch = require('../middleware/trycatch');


followsRoute.post('/:followId', Authorization, ErrorCatch(async (req, res, next) => {
    const { followId } = req.params;
    const followerId = req.user[0].id;
    console.log('aaaaa');
    console.log(followId);
    console.log('aaaaa');
    console.log('bbbb');
    console.log(followerId)
    console.log('bbbb');
    if (followId == followerId) {
        return res.status(400).send('본인을 팔로우 할 순 없습니다 ㅎㅎ...');
    }
    await Follower.create({ followId, followerId });
    return res.status(204).send();
}));

followsRoute.delete('/:followId', Authorization, ErrorCatch(async (req, res, next) => {
    const { followId } = req.params;
    const followerId = req.user[0].id;

    await Follower.destroy({ where: { followerId, followId } })
    return res.status(204).send();
}));

module.exports = followsRoute;