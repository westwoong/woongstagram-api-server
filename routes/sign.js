const express = require('express');
const signRoute = express.Router();
const refreshAuthorization = require('../middleware/refreshAuth');
const signController = require('../controllers/signController');

signRoute.post('/sign-up', signController.signUp);

signRoute.post('/sign-in', signController.signIn);

signRoute.post('/refresh-token', refreshAuthorization, signController.refreshToken);


module.exports = signRoute;
