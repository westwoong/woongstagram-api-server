const { BadRequestException } = require('../errors/IndexException');
const asyncHandler = require('../middleware/asyncHandler');
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

    if (!photoId) {
        throw new BadRequestException('photoId 값이 존재하지 않습니다.');
    }

    if (!photos) {
        throw new BadRequestException('photos 값이 존재하지 않습니다.');
    }

    await uploadService.modify(photoId, photos);
    return res.status(200).send('사진 수정이 완료되었습니다');
})

