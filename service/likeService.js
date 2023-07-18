const { likeByPostId, unLikeByPostIdAndUserId, getLikedByPostId, getLikeCountByPostId } = require('../repository/likeRepository');
const { isFollowingByUserId } = require('../repository/followRepository');
const { validateLike } = require('./validators/likeValidator');

module.exports.like = async (postId, userId) => {
    await validateLike(postId, userId);
    return likeByPostId(postId, userId);
}

module.exports.unlike = async (postId, userId) => {
    await validateLike(postId, userId);
    return unLikeByPostIdAndUserId(postId, userId);
}

module.exports.searchPostLikedUsersInfo = async (postId, req) => {
    const page = req.query.page || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    const likesData = [];

    const likes = await getLikedByPostId(postId, limit, offset);

    for (const like of likes) {
        const follows = await isFollowingByUserId(like.userId);
        const isFollower = follows ? true : false;
        likesData.push({
            name: like.user.name,
            nickname: like.user.nickname,
            isFollower: isFollower
        })
    }
    const totalLikesCount = await getLikeCountByPostId(postId);
    const totalPages = Math.ceil(totalLikesCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
        likesData,
        pagination: {
            page,
            limit,
            totalLikesCount,
            totalPages,
            hasNextPage,
            hasPreviousPage
        }
    }
}