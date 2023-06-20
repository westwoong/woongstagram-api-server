const express = require('express');
const likesRoute = express.Router();
const authorization = require('../middleware/jwtAuth');
const likesController = require('../controllers/likesController');

likesRoute.post('/:postId', authorization, likesController.likeIt);

likesRoute.delete('/:postId', authorization, likesController.unlikeIt);

likesRoute.get('/:postId', authorization, likesController.search);

module.exports = likesRoute;