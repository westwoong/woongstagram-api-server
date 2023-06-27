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

module.exports.unlike = async (postId, userId) => {
    if (!await isExistByPostId(postId)) {
        throw new NotFoundException('없는 게시물 입니다.');
    }
    if (!await isLikeByPostIdAndUserId(postId, userId)) {
        throw new ConflictException('좋아요를 누른 게시물에 대해서 취소가 가능합니다.');
    }

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