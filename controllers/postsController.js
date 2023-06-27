const asyncHandler = require('../middleware/asyncHandler');
const postService = require('../service/postService');
const { sequelize } = require('../config/database');
const { BadRequestException, NotFoundException, ForbiddenException } = require('../errors/IndexException');
const { validatePost } = require('../service/validators/postValidator');
const { updatePost, deletePost, getInfoByPostId, getPostsByContentCount, searchPosts, searchPostsByContent, postsCount } = require('../repository/postRepository');
const { findPhotosUrl, getPhotoByPostId } = require('../repository/photoRepository');
const { unLikeByPostId, getPostLikesCountByPostId } = require('../repository/likeRepository');
const { deleteCommentByPostId, getPostCommentCountByPostId, getCommentByPostId } = require('../repository/commentRepository');
const { getUserInfoByUserId } = require('../repository/userRepository');

module.exports.createPost = asyncHandler(async (req, res) => {
    const { content, photos } = req.body;
    const userId = req.user[0].id;

    if (!content) {
        throw new BadRequestException('content 값이 존재하지 않습니다.')
    }

    if (!photos) {
        throw new BadRequestException('photos 값이 존재하지 않습니다.')
    }

    if (!userId) {
        throw new BadRequestException('userId 값이 존재하지 않습니다.')
    }

    const result = await postService.create(content, photos, userId);
    return res.status(201).send({ result })
});

module.exports.modifyPost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { content, photos } = req.body;
    const userId = req.user[0].id;

    if (!content) {
        throw new BadRequestException('content 값이 존재하지 않습니다.')
    }

    if (!photos) {
        throw new BadRequestException('photos 값이 존재하지 않습니다.')
    }

    if (!userId) {
        throw new BadRequestException('userId 값이 존재하지 않습니다.')
    }

    await postService.modify(postId, content, photos, userId);
    return res.status(200).send('게시글 수정이 완료되었습니다');
});

module.exports.deletePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.user[0].id;

    const post = await getInfoByPostId(postId);

    if (!post) {
        throw new BadRequestException('게시물이 존재하지 않습니다.');
    }
    if (post?.userId !== userId || post === null) {
        throw new ForbiddenException('본인의 게시글만 삭제가 가능합니다.');
    }

    await sequelize.transaction(async (t) => {
        await unLikeByPostId(postId, t);
        await deleteCommentByPostId(postId, t);
        await deletePost(postId, t);
    });

    return res.status(204).send();
});

module.exports.searchPosts = asyncHandler(async (req, res) => {
    const page = req.query.page || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const posts = await searchPosts(limit, offset);

    const postId = posts.map(post => post.id);

    const postLikeCounts = await getPostLikesCountByPostId(postId);
    const postCommentCounts = await getPostCommentCountByPostId(postId);
    const postPhotos = await getPhotoByPostId(postId, limit, offset);

    const postsData = [];

    for (const post of posts) {
        const { id, userId, createdAt } = post.dataValues;

        const findUserNickname = await getUserInfoByUserId(userId);
        const findComments = await getCommentByPostId(id, limit, offset);
        const commentUserId = findComments.map(comment => comment.dataValues.userId);
        const userNicknames = await getUserInfoByUserId(commentUserId);


        const commentsAndNickname = findComments.map(comment => {
            const userNickname = userNicknames.find(user => user.id === comment.userId)?.nickname || '';
            return {
                nickname: userNickname,
                comment: comment.content,
                createdAt
            };
        });

        const checkPostLikes = postLikeCounts.find(like => like.postId === id);
        const likeCount = checkPostLikes ? checkPostLikes.dataValues.like_count : 0;
        const checkPostComments = postCommentCounts.find(comment => comment.postId === id);
        const commentCount = checkPostComments ? checkPostComments.dataValues.comment_count : 0;
        const postPhotosUrl = postPhotos.filter(photo => photo.postId === id).map(photo => photo.url);

        postsData.push({
            contents: post.content,
            createdTime: createdAt,
            usernickname: findUserNickname[0].dataValues.nickname,
            likecount: likeCount,
            commentcount: commentCount,
            commentList: commentsAndNickname,
            images: postPhotosUrl
        });

    }
    const totalPostCount = await postsCount();
    const totalPages = Math.ceil(totalPostCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return res.status(200).send({
        posts: postsData,
        pagination: {
            page,
            limit,
            totalPostCount,
            totalPages,
            hasNextPage,
            hasPreviousPage
        }
    });

});

module.exports.searchPostsByContent = asyncHandler(async (req, res) => {
    const { content } = req.params;
    const page = req.query.page || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const posts = await searchPostsByContent(content, limit, offset);
    const postId = posts.map(post => post.id);

    const postLikesCount = await getPostLikesCountByPostId(postId);

    const postsData = [];

    for (const post of posts) {
        const findUserNickname = await getUserInfoByUserId(post.userId);
        const checkPostLikes = postLikesCount.find(like => like.postId === post.id);
        const likeCount = checkPostLikes ? checkPostLikes.dataValues.like_count : 0;
        const postPhotos = await getPhotoByPostId(post.id, limit, offset);

        for (const photo of postPhotos) {
            const { url } = photo.dataValues;
            postsData.push({
                content: post.content,
                createAt: post.createdAt,
                nickname: findUserNickname[0].dataValues.nickname,
                likeCount: likeCount,
                image: url
            })
        }
    }

    const totalPostCount = await getPostsByContentCount(content);
    const totalPages = Math.ceil(totalPostCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return res.status(200).send({
        postsData: postsData,
        pagination: {
            page,
            limit,
            totalPostCount,
            totalPages,
            hasNextPage,
            hasPreviousPage
        }
    });
});
