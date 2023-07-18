const express = require('express');
const usersRoute = express.Router();
const authorization = require('../middleware/jwtAuth');
const usersController = require('../controllers/usersController');

usersRoute.get('/myfollowing', authorization, usersController.getMyFollowingList);

usersRoute.get('/myfollower', authorization, usersController.getMyFollowerList);

usersRoute.get('/myinfo', authorization, usersController.getMyInformation);

module.exports = usersRoute;