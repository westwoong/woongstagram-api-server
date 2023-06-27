const { BadRequestException } = require('../errors/IndexException');
const { createPhotos, modifyPhotosByPostId } = require('../repository/photoRepository');
const asyncHandler = require('../middleware/asyncHandler');
require('dotenv').config('../.env');
const uploadService = require('../service/uploadService');

module.exports.upload = asyncHandler(async (req, res) => {
    const photos = req.files;

    if (!photos) {
        throw new BadRequestException('photos 값이 존재하지 않습니다.');
    }

    const result = await uploadService.upload(photos);
    return res.status(201).json({ iamgeUrl: result });
});

module.exports.modifyPhotos = asyncHandler(async (req, res) => {
    const { photoId } = req.params;
    const photos = req.files;

    for (let PhotoArrayLength = 0; PhotoArrayLength < photos.length; PhotoArrayLength++) {
        const { location } = photos[PhotoArrayLength];
        await modifyPhotosByPostId(location, PhotoArrayLength, photoId);
    }
    return res.status(200).send('사진 수정이 완료되었습니다');
})

