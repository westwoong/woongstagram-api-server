const asyncHandler = require('../middleware/asyncHandler');
const { BadRequestException, ForbiddenException, NotFoundException } = require('../errors/IndexException');
const { getCommentByUserId, getCommentsByPostId, getCommentCountByPostId, createComment, deleteUserComment, modifyCommet } = require('../repository/commentRepository');
const { findOneUserNicknameAndNameByUserId } = require('../repository/userRepository');

module.exports.createComment = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { comment } = req.body;
    const userId = req.user[0].id;

    if (!comment || comment.length > 100) {
        throw new BadRequestException('댓글은 1글자 이상 100글자 이하로 작성해야 합니다');
    }

    await createComment(userId, postId, comment);
    return res.status(201).send('작성이 완료되었습니다');
});

module.exports.deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user[0].id;

    const foundComment = await getCommentByUserId(commentId, userId);

    if (!foundComment) {
        throw new BadRequestException('삭제하려는 댓글이 존재하지 않습니다.');
    }

    if (foundComment?.userId !== userId || foundComment === null) {
        throw new ForbiddenException('본인의 댓글만 삭제가 가능합니다.');
    }

    await deleteUserComment(commentId, userId);

    return res.status(201).send('댓글 삭제가 완료되었습니다');
});

module.exports.modifyCommet = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { comment } = req.body;
    const userId = req.user[0].id;

    const foundComment = await getCommentByUserId(commentId, userId);

    if (foundComment?.userId !== userId || foundComment === null) {
        throw new ForbiddenException('본인의 댓글만 수정이 가능합니다');
    }

    if (!foundComment) {
        throw new NotFoundException('수정하려는 댓글이 존재하지 않습니다.');
    }

    if (!comment || comment.length > 100) {
        throw new BadRequestException('댓글의 내용은 1글자 이상 100글자 이하로 작성이 가능합니다');
    }

    await modifyCommet(comment, commentId, userId)
    return res.status(200).send('수정이 완료되었습니다.');
});

module.exports.search = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const page = req.query.page || 1;
    const limit = 2;
    const offset = (page - 1) * limit;

    const comments = await getCommentsByPostId(postId, limit, offset);

    const commentsData = [];

    if (!comments || comments.length === 0) {
        throw new NotFoundException('게시글이 존재하지 않습니다.');
    }

    for (const comment of comments) {
        const { userId, createdAt, content } = comment.dataValues;
        const findUserNickname = await findOneUserNicknameAndNameByUserId(userId);
        console.log(findUserNickname);

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