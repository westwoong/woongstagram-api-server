const { BadRequestException, ConflictException, NotFoundException } = require('../errors/IndexException');
const { followByUserId, unFollowByUserId, isDuplicateFollow } = require('../repository/followRepository');
const { isExistByUserId } = require('../repository/userRepository');


module.exports.follow = async (followId, followerId) => {
    if (!await isExistByUserId(followId)) {
        throw new NotFoundException('해당 사용자는 존재하지 않습니다');
    }

    if (followId == followerId) {
        throw new BadRequestException('본인을 팔로우 할 순 없습니다.');
    }

    if (await isDuplicateFollow(followerId, followId)) {
        throw new ConflictException('중복적으로 팔로우할 수 없습니다.');
    }

    return followByUserId(followId, followerId);
}

module.exports.unfollow = async (followId, followerId) => {
    if (!isExistByUserId(followId)) {
        throw new NotFoundException('해당 사용자는 존재하지 않습니다');
    }

    if (followId == followerId) {
        throw new BadRequestException('본인을 제외한 사용자에만 가능합니다');
    }

    if (!await isDuplicateFollow(followerId, followId)) {
        throw new ConflictException('이미 언팔로우한 사용자 입니다.');
    }

    return unFollowByUserId(followerId, followId)
}