const { getCommentsByPostId, getCommentCountByPostId, createComment, deleteUserComment, modifyCommet } = require('../repository/commentRepository');
const { validateCreateComment, validateDeleteByComment, validateModifyBycomment } = require('./validators/commentValidator');
const { validateIsExistPostId } = require('./validators/postValidator');

module.exports.create = async (postId, comment, userId) => {
    await validateCreateComment(comment);
    return createComment(userId, postId, comment);
}

module.exports.delete = async (commentId, userId) => {
    await validateDeleteByComment(commentId, userId);
    return deleteUserComment(commentId, userId);
}

module.exports.modify = async (commentId, comment, userId) => {
    await validateModifyBycomment(commentId, comment, userId);
    return modifyCommet(comment, commentId, userId);
}

module.exports.search = async (postId, req) => {
    const page = req.query.page || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    await validateIsExistPostId(postId);

    const comments = await getCommentsByPostId(postId, limit, offset);
    const totalCommentsCount = await getCommentCountByPostId(postId);
    const totalPages = Math.ceil(totalCommentsCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
        comments : comments,
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