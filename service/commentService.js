const asyncHandler = require('../middleware/asyncHandler');
const { BadRequestException, ForbiddenException, NotFoundException } = require('../errors/IndexException');
const { getCommentByUserId, getCommentsByPostId, getCommentCountByPostId, createComment, deleteUserComment, modifyCommet } = require('../repository/commentRepository');
const { getUserInfoByUserId } = require('../repository/userRepository');


module.exports.create = async (postId, comment, userId) => {
    if (!comment || comment.length > 100) {
        throw new BadRequestException('댓글은 1글자 이상 100글자 이하로 작성해야 합니다');
    }

    return createComment(userId, postId, comment);
}