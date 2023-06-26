const asyncHandler = require('../middleware/asyncHandler');
const { BadRequestException } = require('../errors/IndexException');
const { followByUserId, unFollowByUserId, isDuplicateFollow } = require('../repository/followRepository');

module.exports.follow = asyncHandler(async (req, res, next) => {
  const { followId } = req.params;
  const followerId = req.user[0].id;

  if (followId == followerId) {
    throw new BadRequestException('본인을 팔로우 할 순 없습니다.');
  }

  if (await isDuplicateFollow(followerId, followId)) {
    throw new BadRequestException('중복적으로 팔로우할 수 없습니다.');
  }

  await followByUserId(followId, followerId);
  return res.status(204).send();
})

module.exports.unfollow = asyncHandler(async (req, res, next) => {
  const { followId } = req.params;
  const followerId = req.user[0].id;

  if (!await isDuplicateFollow(followerId, followId)) {
    throw new BadRequestException('이미 언팔로우한 사용자 입니다.');
  }

  await unFollowByUserId(followerId, followId)
  return res.status(204).send();
});