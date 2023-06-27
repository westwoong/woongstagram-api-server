const express = require('express');
const uploadRoute = express.Router();
const authorization = require('../middleware/jwtAuth');
const uploadController = require('../controllers/uploadController');
const uploadService = require('../service/uploadService');

uploadRoute.post('/', authorization, uploadService.module, uploadController.upload);

uploadRoute.patch('/:photoId', authorization, uploadService.module, uploadController.modifyPhotos);

module.exports = uploadRoute;
