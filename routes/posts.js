const express = require('express');
const postsRoute = express.Router();
const authorization = require('../middleware/jwtAuth');
const postsController = require('../controllers/postsController');

postsRoute.post('/', authorization, postsController.createPost);

postsRoute.patch('/:postId', authorization, postsController.modifyPost);

postsRoute.delete('/:postId', authorization, postsController.deletePost);

postsRoute.get('/', authorization, postsController.searchPosts);

postsRoute.get('/:content', authorization, postsController.searchPostsByContent);

module.exports = postsRoute;