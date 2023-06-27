const asyncHandler = require('../middleware/asyncHandler');
const postService = require('../service/postService');
const { sequelize } = require('../config/database');
const { BadRequestException, NotFoundException, ForbiddenException } = require('../errors/IndexException');
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

    if (!postId) {
        throw new BadRequestException('postId 값이 존재하지 않습니다.')
    }

    if (!userId) {
        throw new BadRequestException('userId 값이 존재하지 않습니다.')
    }
    await postService.delete(postId, userId);
    return res.status(204).send();
});

module.exports.searchPosts = asyncHandler(async (req, res) => {
    const result = await postService.search(req);
    return res.status(200).send(result);
});

module.exports.searchPostsByContent = asyncHandler(async (req, res) => {
    const { content } = req.params;

    if (!content) {
        throw new BadRequestException('content 값이 존재하지 않습니다.');
    }
    const result = await postService.searchContent(req, content);
    return res.status(200).send(result);
});
