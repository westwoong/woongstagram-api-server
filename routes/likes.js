const { Like } = require('../models');
const express = require('express');
const likesRoute = express.Router();
const Authorization = require('../middleware/jsontoken');
const ErrorCatch = require('../middleware/trycatch');

likesRoute.post('/:postId', Authorization, ErrorCatch(async (req, res) => {
    const { postId } = req.params;
    const payloadArray = req.user[0];
    await Like.create({ userId: payloadArray.id, postId });
    res.status(204).send();
}));

module.exports = likesRoute;