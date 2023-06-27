const { NotFoundException, ConflictException } = require('../errors/IndexException');
const { likeByPostId, isLikeByPostIdAndUserId, unLikeByPostIdAndUserId, getLikedByPostId, getLikeCountByPostId } = require('../repository/likeRepository');
const { isExistByPostId, getInfoByPostId } = require('../repository/postRepository');
const { getUserInfoByUserId } = require('../repository/userRepository');
const { isFollowingByUserId } = require('../repository/followRepository');

module.exports.like = async (postId, userId) => {
    if (!await isExistByPostId(postId)) {
        throw new NotFoundException('없는 게시물 입니다.');
    }
    if (await isLikeByPostIdAndUserId(postId, userId)) {
        throw new ConflictException('이미 좋아요를 누른 게시글입니다.');
    }

    return likeByPostId(postId, userId);
}