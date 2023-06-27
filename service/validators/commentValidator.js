const { BadRequestException, ForbiddenException } = require('../../errors/IndexException');

module.exports.validateComment = (comment) => {
    if (!comment || comment.length > 100) {
        throw new BadRequestException('댓글은 1글자 이상 100글자 이하로 작성해야 합니다');
    }
    if (!comment) {
        throw new BadRequestException('삭제하려는 댓글이 존재하지 않습니다.');
    }

    if (comment?.userId !== userId || comment === null) {
        throw new ForbiddenException('본인의 댓글만 허용됩니다.');
    }
    if (!comment || comment.length === 0) {
        throw new NotFoundException('게시글이 존재하지 않습니다.');
    }
}