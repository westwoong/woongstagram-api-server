const { sequelize } = require('../config/database');
const { BadRequestException, NotFoundException, ForbiddenException } = require('../errors/IndexException');
const { validatePost } = require('./validators/postValidator');
const { updatePost, deletePost, getInfoByPostId, getPostsByContentCount, searchPosts, searchPostsByContent, postsCount } = require('../repository/postRepository');
const { findPhotosUrl, getPhotoByPostId } = require('../repository/photoRepository');
const { unLikeByPostId, getPostLikesCountByPostId } = require('../repository/likeRepository');
const { deleteCommentByPostId, getPostCommentCountByPostId, getCommentByPostId } = require('../repository/commentRepository');
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