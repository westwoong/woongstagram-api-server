const asyncHandler = require('../middleware/asyncHandler');
const { NotFoundException, ConflictException } = require('../errors/IndexException');
const { likeByPostId, isLikeByPostIdAndUserId, unLikeByPostIdAndUserId, getLikedBypostId, getLikeCountByPostId } = require('../repository/likeRepository');
const { isExistByPostId, getInfoByPostId } = require('../repository/postRepository');
const { getUserNicknameAndNameByUserId } = require('../repository/userRepository');
const { isFollowingByUserId } = require('../repository/followRepository');

module.exports.likeIt = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.user[0].id;

    if (!await isExistByPostId(postId)) {
        throw new NotFoundException('없는 게시물 입니다.');
    }
    if (await isLikeByPostIdAndUserId(postId, userId)) {
        throw new ConflictException('이미 좋아요를 누른 게시글입니다.');
    }

    await likeByPostId(postId, userId);
    res.status(204).send();
});

module.exports.unlikeIt = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.user[0].id;

    if (!await isExistByPostId(postId)) {
        throw new NotFoundException('없는 게시물 입니다.');
    }
    if (!await isLikeByPostIdAndUserId(postId, userId)) {
        throw new ConflictException('좋아요를 누른 게시물에 대해서 취소가 가능합니다.');
    }

    await unLikeByPostIdAndUserId(postId, userId);
    res.status(204).send();
});

module.exports.search = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const page = req.query.page || 1;
    const limit = 2;
    const offset = (page - 1) * limit;

    const likes = await getLikedBypostId(postId, limit, offset);

    const likesData = [];

    for (const like of likes) {
        const users = await getUserNicknameAndNameByUserId(like.userId, limit, offset);
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