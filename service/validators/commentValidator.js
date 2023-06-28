const { BadRequestException, ForbiddenException } = require('../../errors/IndexException');
const { getCommentByIdAndUserId, getCommentById } = require('../../repository/commentRepository')

module.exports.validateCreateComment = async (comment) => {
    if (!comment || comment.length > 100) {
        throw new BadRequestException('댓글은 1글자 이상 100글자 이하로 작성해야 합니다');
    }
    if (!comment) {
        throw new BadRequestException('삭제하려는 댓글이 존재하지 않습니다.');
    }
}

module.exports.validateDeleteAndModifyComment = async (commentId, userId) => {
    const foundComment = await getCommentById(commentId);
    const isUserComment = await getCommentByIdAndUserId(commentId, userId);

    validateExistingComment(foundComment);
    validateAuthority(isUserComment, userId);
}

function validateExistingComment(comment) {
    if (!comment) {
        throw new BadRequestException('삭제하려는 댓글이 존재하지 않습니다.');
    }
}

function validateAuthority(comment, userId) {
    if (!comment || equalsCommentUserIdAndUserId(comment, userId)) {
        throw new ForbiddenException('권한이 없습니다.');
    }
}

function equalsCommentUserIdAndUserId(comment, userId) {
    return comment.userId !== userId;
}