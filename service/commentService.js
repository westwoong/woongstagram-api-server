const { getCommentsByPostId, getCommentCountByPostId, createComment, deleteUserComment, modifyCommet } = require('../repository/commentRepository');
const { getUserInfoByUserId } = require('../repository/userRepository');
const { validateCreateComment, validateDeleteAndModifyComment } = require('./validators/commentValidator');

module.exports.create = async (postId, comment, userId) => {
    await validateCreateComment(comment);
    return createComment(userId, postId, comment);
}

module.exports.delete = async (commentId, userId) => {
    await validateDeleteAndModifyComment(commentId, userId);
    return deleteUserComment(commentId, userId);
}

module.exports.modify = async (commentId, comment, userId) => {
    await validateDeleteAndModifyComment(commentId, userId);
    return modifyCommet(comment, commentId, userId);
}

module.exports.search = async (postId, req) => {
    const page = req.query.page || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const comments = await getCommentsByPostId(postId, limit, offset);

    const commentsData = [];


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