const { sequelize } = require('../config/database');
const { BadRequestException, NotFoundException, ForbiddenException } = require('../errors/IndexException');
const { validatePost } = require('./validators/postValidator');
const { updatePost, deletePost, getInfoByPostId, getPostsByContentCount, searchPosts, searchPostsByContent, postsCount } = require('../repository/postRepository');
const { findPhotosUrl, getPhotoByPostId } = require('../repository/photoRepository');
const { unLikeByPostId, getPostLikesCountByPostId } = require('../repository/likeRepository');
const { deleteCommentByPostId } = require('../repository/commentRepository');
const { getUserInfoByUserId } = require('../repository/userRepository');

module.exports.create = async (content, photos, userId) => {
    validatePost(content, photos, userId);

    const validationPhotosUrl = [];

    const postCreateTransaction = await sequelize.transaction(async (t) => {
        const post = await createPost(content, userId, t);
        const photoPromise = photos.map(async (photosUrl) => {
            const checkPhotoUrl = await findPhotosUrl(photosUrl);
            if (!checkPhotoUrl) {
                validationPhotosUrl.push(photosUrl);
            } else {
                await checkPhotoUrl.update({ postId: post.id }, { transaction: t });
            }
        });

        await Promise.all(photoPromise);

        if (validationPhotosUrl.length > 0) {
            const invalidPhotosUrl = validationPhotosUrl.join(', ');
            throw new NotFoundException(`${invalidPhotosUrl} 해당 이미지 주소는 존재하지않습니다.`);
        }
        else {
            return post;
        }
    });
    return postCreateTransaction;
}

module.exports.modify = async (postId, content, photos, userId) => {
    validatePost(content, photos);

    const postModifyTransaction = await sequelize.transaction(async (t) => {
        const post = await updatePost(content, postId, userId, t);
        const photoPromise = photos.map(async (photosUrl) => {
            const checkPhotoUrl = await findPhotosUrl(photosUrl);
            if (!checkPhotoUrl) {
                throw new NotFoundException(`${photosUrl}해당 이미지는 존재하지 않습니다.`);
            }
            await checkPhotoUrl.update({ postId: post.id }, { transaction: t });
        });

        await Promise.all(photoPromise);
        return post;
    });
    return postModifyTransaction;
}

module.exports.delete = async (postId, userId) => {
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
    return
}

module.exports.search = async (req) => {
    const page = req.query.page || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const posts = await searchPosts(limit, offset);

    const totalPostCount = await postsCount();
    const totalPages = Math.ceil(totalPostCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
        posts: posts,
        pagination: {
            page,
            limit,
            totalPostCount,
            totalPages,
            hasNextPage,
            hasPreviousPage
        }
    };
}

module.exports.searchContent = async (req, content) => {
    const page = req.query.page || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const posts = await searchPostsByContent(content, limit, offset);

    const totalPostCount = await getPostsByContentCount(content);
    const totalPages = Math.ceil(totalPostCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
        posts: posts,
        pagination: {
            page,
            limit,
            totalPostCount,
            totalPages,
            hasNextPage,
            hasPreviousPage
        }
    };
}