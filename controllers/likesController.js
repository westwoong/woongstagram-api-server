const asyncHandler = require('../middleware/asyncHandler');
const { BadRequestException } = require('../errors/IndexException');
const { likeByPostId, isLikeByPostIdAndUserId, unLikeByPostIdAndUserId, getLikedByPostId, getLikeCountByPostId } = require('../repository/likeRepository');
const { isExistByPostId, getInfoByPostId } = require('../repository/postRepository');
const { getUserInfoByUserId } = require('../repository/userRepository');
const { isFollowingByUserId } = require('../repository/followRepository');
const likeService = require('../service/likeService.js');

module.exports.likeIt = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.user[0].id;

    if (!postId) {
        throw new BadRequestException('postId 값이 존재하지 않습니다.');
    }
    if (!userId) {
        throw new BadRequestException('userId 값이 존재하지 않습니다.');
    }

    await likeService.like(postId, userId);
    res.status(204).send();
});

module.exports.unlikeIt = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.user[0].id;

    if (!postId) {
        throw new BadRequestException('postId 값이 존재하지 않습니다.');
    }
    if (!userId) {
        throw new BadRequestException('userId 값이 존재하지 않습니다.');
    }

    await likeService.unlike(postId, userId);
    res.status(204).send();
});

module.exports.search = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const page = req.query.page || 1;
    const limit = 2;
    const offset = (page - 1) * limit;

    const likes = await getLikedByPostId(postId, limit, offset);

    const likesData = [];

    for (const like of likes) {
        const users = await getUserInfoByUserId(like.userId, limit, offset);
        const posts = await getInfoByPostId(postId, limit, offset);
        const follows = await isFollowingByUserId(posts.userId);
        const followCheck = follows ? true : false;

        likesData.push({
            name: users.name,
            nickname: users.nickname,
            isFollower: followCheck
        })
    }

    const totalLikesCount = await getLikeCountByPostId(postId);
    const totalPages = Math.ceil(totalLikesCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return res.status(200).send({
        likesData: likesData,
        pagination: {
            page,
            limit,
            totalLikesCount,
            totalPages,
            hasNextPage,
            hasPreviousPage
        }

    });
});