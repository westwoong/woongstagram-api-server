const express = require('express');
const commentsRoute = express.Router();
const authorization = require('../middleware/jwtAuth');
const commentsController = require('../controllers/commentsController');

commentsRoute.post('/:postId', authorization, commentsController.createComment);

commentsRoute.get('/:postId', authorization, commentsController.searchComment);

commentsRoute.delete('/:commentId', authorization, commentsController.deleteComment);

commentsRoute.patch('/:commentId', authorization, commentsController.modifyCommet);

module.exports = commentsRoute;