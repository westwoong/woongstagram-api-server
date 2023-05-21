const { Like } = require('../models');
const express = require('express');
const likesRoute = express.Router();
const Authorization = require('../middleware/jsontoken');

likesRoute.post('/:postId', Authorization, async (req, res) => {
    const payloadArray = req.user[0];

})

module.exports = likesRoute;