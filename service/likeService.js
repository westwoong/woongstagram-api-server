const { likeByPostId, unLikeByPostIdAndUserId, getLikedByPostId, getLikeCountByPostId } = require('../repository/likeRepository');
const { getInfoByPostId } = require('../repository/postRepository');
const { getUserInfoByUserId } = require('../repository/userRepository');
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

    const likes = await getLikedByPostId(postId, limit, offset);

    const likesData = [];

    for (const like of likes) {
        const users = await getUserInfoByUserId(like.userId, limit, offset);
        const posts = await getInfoByPostId(postId, limit, offset);
        const follows = await isFollowingByUserId(posts.userId);
        const followCheck = follows ? true : false;

        likesData.push({
            name: users[0].dataValues.name,
            nickname: users[0].dataValues.nickname,
            isFollower: followCheck
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