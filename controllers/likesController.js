const asyncHandler = require('../middleware/asyncHandler');
const { BadRequestException } = require('../errors/IndexException');
const likeService = require('../service/likeService.js');

module.exports.likeIt = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.user[0].id;

    if (!postId) {
        throw new BadRequestException('postId 값이 존재하지 않습니다.');
    }
    if (!userId) {
        throw new BadRequestException('userId 값이 존재하지 않습니다.');
    }

    await likeService.like(postId, userId);
    res.status(204).send();
});

module.exports.unlikeIt = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.user[0].id;

    if (!postId) {
        throw new BadRequestException('postId 값이 존재하지 않습니다.');
    }
    if (!userId) {
        throw new BadRequestException('userId 값이 존재하지 않습니다.');
    }

    await likeService.unlike(postId, userId);
    res.status(204).send();
});

module.exports.search = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    if (!postId) {
        throw new BadRequestException('postId 값이 존재하지 않습니다.');
    }

    const result = await likeService.searchPostLikedUsersInfo(postId, req);
    return res.status(200).send(result);
});