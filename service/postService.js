const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const { BadRequestException, NotFoundException, ForbiddenException } = require('../errors/IndexException');
const { validatePost } = require('./validators/postValidator');
const { createPost } = require('../repository/postRepository');
const { findPhotosUrl } = require('../repository/photoRepository');

module.exports.create = async (content, photos, userId) => {
    validatePost(content, photos, userId);

    const validationPhotosUrl = [];

    const postTransaction = await sequelize.transaction(async (t) => {
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
            return postTransaction;
        }
    });
}