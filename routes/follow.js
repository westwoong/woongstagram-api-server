const { Follower } = require('../models');
const express = require('express');
const followsRoute = express.Router();
const authorization = require('../middleware/jwtAuth');
const followController = require('../controllers/followController');


followsRoute.post('/:followId', authorization, followController.follow);

followsRoute.delete('/:followId', authorization, followController.unfollow);

module.exports = followsRoute;