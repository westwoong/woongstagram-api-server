const { User, Like, Post, Follower } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const { NotFoundException, ConflictException } = require('../errors/IndexException');

module.exports.likeIt = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.user[0].id;
    const checkLikes = await Like.findOne({ where: { postId, userId } });
    const checkExistPost = await Post.findOne({ where: { id: postId } });

    if (!checkExistPost) {
        throw new NotFoundException('없는 게시물 입니다.');
    }
    if (checkLikes) {
        throw new ConflictException('이미 좋아요를 누른 게시글입니다.');
    }

    await Like.create({ userId, postId });
    res.status(204).send();
});

module.exports.unlikeIt = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.user[0].id;
    await Like.destroy({ where: { userId, postId } });
    res.status(204).send();
});

module.exports.search = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const page = req.query.page || 1;
    const limit = 2;
    const offset = (page - 1) * limit
    ;
    const likes = await Like.findAll({ where: { postId }, attributes: ['userId', 'postId'], limit, offset });

    const likesData = [];

    for (const like of likes) {
        const users = await User.findOne({ where: { id: like.userId }, attributes: ['name', 'nickname'], limit, offset });
        const posts = await Post.findOne({ where: { id: postId }, attributes: ['userId'], limit });
        const follows = await Follower.findOne({ where: { follower_id: posts.userId } });
        const followCheck = follows ? true : false;

        likesData.push({
            name: users.name,
            nickname: users.nickname,
            isFollower: followCheck
        })
    }

    const totalLikesCount = await Like.count({ where: { postId } });
    const totalPages = Math.ceil(totalLikesCount / limit);
    const isExistNextPage = page < totalPages;
    const isExistPreviousPage = page > 1;

    return res.status(200).send({
        likesData: likesData,
        pagination: {
            page,
            limit,
            totalLikesCount,
            totalPages,
            isExistNextPage,
            isExistPreviousPage
        }

    });
});