const asyncHandler = require('../middleware/asyncHandler');
const commentService = require('../service/commentService');

module.exports.createComment = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { comment } = req.body;
    const userId = req.user[0].id;

    if (!postId) {
        throw new BadRequestException('postId 값이 존재하지 않습니다');
    }

    if (!comment) {
        throw new BadRequestException('comment 값이 존재하지 않습니다.');
    }

    if (!userId) {
        throw new BadRequestException('userId 값이 존재하지 않습니다.');
    }

    await commentService.create(postId, comment, userId);

    return res.status(201).send('작성이 완료되었습니다');
});

module.exports.deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user[0].id;

    if (!commentId) {
        throw new BadRequestException('commentId 값이 존재하지 않습니다.');
    }

    if (!userId) {
        throw new BadRequestException('userId 값이 존재하지 않습니다.');
    }

    await commentService.delete(commentId, userId);

    return res.status(201).send('댓글 삭제가 완료되었습니다');
});

module.exports.modifyCommet = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { comment } = req.body;
    const userId = req.user[0].id;

    if (!commentId) {
        throw new BadRequestException('commentId 값이 존재하지 않습니다');
    }
    if (!comment) {
        throw new BadRequestException('comment 값이 존재하지 않습니다');
    }
    if (!userId) {
        throw new BadRequestException('userId 값이 존재하지 않습니다');
    }

    await commentService.modify(commentId, comment, userId);

    return res.status(200).send('수정이 완료되었습니다.');
});

module.exports.searchComment = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    if (!postId) {
        throw new BadRequestException('postId 값이 존재하지않습니다');
    }

    const result = await commentService.search(postId, req);
    return res.status(200).send(result);
});