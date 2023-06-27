const { BadRequestException, ConflictException, NotFoundException } = require('../../errors/IndexException');
const { isDuplicateFollow } = require('../../repository/followRepository');
const { isExistByUserId } = require('../../repository/userRepository');

module.exports.validateFollow = async (followId, followerId) => {
    if (followId == followerId) {
        throw new BadRequestException('본인을 팔로우 할 순 없습니다.');
    }

    if (!await isExistByUserId(followId)) {
        throw new NotFoundException('해당 사용자는 존재하지 않습니다');
    }

    if (!await isDuplicateFollow(followerId, followId) || await isDuplicateFollow(followerId, followId)) {
        throw new ConflictException('이미 처리된 요청입니다.');
    }
}