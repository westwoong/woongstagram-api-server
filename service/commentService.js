const { BadRequestException, ForbiddenException, NotFoundException } = require('../errors/IndexException');
const { getCommentByUserId, getCommentsByPostId, getCommentCountByPostId, createComment, deleteUserComment, modifyCommet } = require('../repository/commentRepository');
const { getUserInfoByUserId } = require('../repository/userRepository');


module.exports.create = async (postId, comment, userId) => {
    if (!comment || comment.length > 100) {
        throw new BadRequestException('댓글은 1글자 이상 100글자 이하로 작성해야 합니다');
    }

    return createComment(userId, postId, comment);
}

module.exports.delete = async (commentId, userId) => {
    const foundComment = await getCommentByUserId(commentId, userId);

    if (!foundComment) {
        throw new BadRequestException('삭제하려는 댓글이 존재하지 않습니다.');
    }

    if (foundComment?.userId !== userId || foundComment === null) {
        throw new ForbiddenException('본인의 댓글만 삭제가 가능합니다.');
    }

    return deleteUserComment(commentId, userId);
}

module.exports.modify = async (commentId, comment, userId) => {
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

    return modifyCommet(comment, commentId, userId);
}

module.exports.search = async (postId, req) => {
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
            nickname: findUserNickname[0].dataValues.nickname,
            content: content,
            createdAt: createdAt
        });
    }

    const totalCommentsCount = await getCommentCountByPostId(postId);
    const totalPages = Math.ceil(totalCommentsCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
        commentsData,
        pagination: {
            page,
            limit,
            totalCommentsCount,
            totalPages,
            hasNextPage,
            hasPreviousPage
        }
    }
}