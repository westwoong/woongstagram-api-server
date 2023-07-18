const express = require('express');
const uploadRoute = express.Router();
const authorization = require('../middleware/jwtAuth');
const uploadController = require('../controllers/uploadController');
const uploadValidator = require('../service/validators/uploadValidator');

uploadRoute.post('/', authorization, uploadValidator.module, uploadController.upload);

uploadRoute.patch('/:photoId', authorization, uploadValidator.module, uploadController.modifyPhotos);

module.exports = uploadRoute;
