const { NotFoundException, ConflictException } = require('../../errors/IndexException');
const { isLikeByPostIdAndUserId } = require('../../repository/likeRepository');
const { isExistByPostId } = require('../../repository/postRepository');

module.exports.validateLike = async (postId, userId) => {
    if (!await isExistByPostId(postId)) {
        throw new NotFoundException('없는 게시물 입니다.');
    }

    if (await isLikeByPostIdAndUserId(postId, userId)) {
        throw new ConflictException('이미 처리된 요청입니다.');
    }
}