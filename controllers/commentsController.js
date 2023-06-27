const asyncHandler = require('../middleware/asyncHandler');
const { BadRequestException, ForbiddenException, NotFoundException } = require('../errors/IndexException');
const { getCommentByUserId, getCommentsByPostId, getCommentCountByPostId, createComment, deleteUserComment, modifyCommet } = require('../repository/commentRepository');
const { getUserInfoByUserId } = require('../repository/userRepository');
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

module.exports.search = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const page = req.query.page || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const comments = await getCommentsByPostId(postId, limit, offset);

    const commentsData = [];

    if (!comments || comments.length === 0) {
        throw new NotFoundException('게시글이 존재하지 않습니다.');
    }

    for (const comment of comments) {
        const { userId, createdAt, content } = comment.dataValues;

        const findUserNickname = await getUserInfoByUserId(userId);
        commentsData.push({
            nickname: findUserNickname.dataValues.nickname,
            content: content,
            createdAt: createdAt
        });
    }

    const totalCommentsCount = await getCommentCountByPostId(postId);
    const totalPages = Math.ceil(totalCommentsCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return res.status(200).send({
        commentsData: commentsData,
        pagination: {
            page,
            limit,
            totalCommentsCount,
            totalPages,
            hasNextPage,
            hasPreviousPage
        }
    });
});