const { BadRequestException } = require('../../errors/IndexException');
require('dotenv').config('../../.env');

module.exports.validatePost = (content, photos) => {
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
}