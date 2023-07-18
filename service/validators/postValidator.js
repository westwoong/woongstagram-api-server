const { BadRequestException, NotFoundException } = require('../../errors/IndexException');
const { isExistByPostId } = require('../../repository/postRepository');
require('dotenv').config('../../.env');

module.exports.validatePost = (content, photos) => {
  validateContent(content);
  validateContentPhotos(photos);
}

module.exports.validateIsExistPostId = async (postId) => {
  if (!await isExistByPostId(postId)) {
    throw new NotFoundException('해당 게시물은 존재하지 않습니다.');
  }
}

function validateContent(content) {
  if (!content || content.length === 0) {
    throw new BadRequestException('본문의 내용을 입력해 주시기 바랍니다');
  }
  if (content.length > 1000) {
    throw new BadRequestException('본문의 내용은 최대 1000자 까지 입력이 가능합니다.');
  }
}

function validateContentPhotos(photos) {
  for (let photoArrayLength = 0; photoArrayLength < photos.length; photoArrayLength++) {
    if (!photos[photoArrayLength].startsWith(`${process.env.S3_BUCKET_URL}`)) {
      throw new BadRequestException(`${process.env.S3_BUCKET_URL} 로 시작하는 이미지 주소를 입력해주세요`);
    }
  }
}
