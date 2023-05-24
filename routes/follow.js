const { Follower } = require('../models');
const express = require('express');
const followsRoute = express.Router();
const Authorization = require('../middleware/jsontoken');
const ErrorCatch = require('../middleware/trycatch');


followsRoute.post('/:followId', Authorization, ErrorCatch(async (req, res, next) => {
    const { followId } = req.params;
    const followerId = req.user[0].id;

    const testresult = await Follower.create({ followId, followerId });
    console.log(testresult);

    return res.status(204).send();
}));

module.exports = followsRoute;
//followerId