const express = require('express');
const commentsRoute = express.Router();
const authorization = require('../middleware/jwtAuth');
const commentsController = require('../controllers/commentsController');

commentsRoute.post('/:postId', authorization, commentsController.create);

commentsRoute.get('/:postId', authorization, commentsController.search);

commentsRoute.delete('/:commentId', authorization, commentsController.delete);

commentsRoute.patch('/:commentId', authorization, commentsController.modify);

module.exports = commentsRoute;