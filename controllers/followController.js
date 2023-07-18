const asyncHandler = require('../middleware/asyncHandler');
const { BadRequestException } = require('../errors/IndexException');
const followService = require('../service/followService');

module.exports.follow = asyncHandler(async (req, res) => {
  const { followId } = req.params;
  const followerId = req.user[0].id;

  if (!followId) {
    throw new BadRequestException('followId 값이 존재하지 않습니다.');
  }

  if (!followerId) {
    throw new BadRequestException('followerId 값이 존재하지 않습니다.');
  }

  await followService.follow(followId, followerId);

  return res.status(204).send();
})

module.exports.unfollow = asyncHandler(async (req, res) => {
  const { followId } = req.params;
  const followerId = req.user[0].id;

  if (!followId) {
    throw new BadRequestException('followId 값이 존재하지 않습니다.');
  }

  if (!followerId) {
    throw new BadRequestException('followerId 값이 존재하지 않습니다.');
  }

  await followService.unfollow(followId, followerId);

  return res.status(204).send();
});