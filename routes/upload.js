const express = require('express');
const uploadRoute = express.Router();
const authorization = require('../middleware/jwtAuth');
const uploadController = require('../controllers/uploadController');

uploadRoute.post('/', authorization, uploadController.module, uploadController.upload);

uploadRoute.patch('/:photoId', authorization, uploadController.module, uploadController.modifyPhotos);

module.exports = uploadRoute;
