const { User, Like, Post, Photo, Comment } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const { BadRequestException, NotFoundException, ForbiddenException } = require('../errors/IndexException');

module.exports.createPost = async (content, photos, userId) => {
  if (!content || content.length === 0) {
      throw new BadRequestException('본문의 내용을 입력해 주시기 바랍니다');
  }
  if (content.length > 1000) {
      throw new BadRequestException('본문의 내용은 최대 1000자 까지 입력이 가능합니다.');
  }
  for (let photoArrayLength = 0; photoArrayLength < photos.length; photoArrayLength++) {
      if (!photos[photoArrayLength].startsWith(`${process.env.S3_BUCKET_URL}`)) {
          throw new BadRequestException(`${process.env.S3_BUCKET_URL} 로 시작하는 이미지 주소를 입력해주세요`);
      }
  }

  const validationPhotosUrl = [];

  const postTransaction = await sequelize.transaction(async (t) => {
      const createPost = await Post.create({ content, userId }, { transaction: t });

      const photoPromise = photos.map(async (photosUrl) => {
          const checkPhotoUrl = await Photo.findOne({ where: { url: photosUrl } });
          if (!checkPhotoUrl) {
              validationPhotosUrl.push(photosUrl);
          } else {
              await checkPhotoUrl.update({ postId: createPost.id }, { transaction: t });
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