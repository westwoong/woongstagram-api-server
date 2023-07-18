const { S3Client } = require('@aws-sdk/client-s3');
const { BadRequestException } = require('../../errors/IndexException');
const multer = require('multer');
const multerS3 = require('multer-s3');
require('dotenv').config('../../.env');

const fileFilter = (req, file, cb) => {
    const photos = req.files;
    if (!photos) {
        throw new BadRequestException('사진은 반드시 1장 이상 첨부해 주시기 바랍니다.');
    }
    if (photos.length > 10) {
        throw new BadRequestException('사진은 최대 10장 까지 첨부가 가능합니다.');
    }
    if (!file.mimetype == 'image/jpg' || !file.mimetype == 'image/jpeg' || !file.mimetype == 'image/png' || !file.mimetype == 'image/gif') {
        return cb(new BadRequestException('파일의 확장자는 jpg, png, gif 만 가능합니다'), false);
    }
    const maxFileSize = 20000000; // 20MB
    if (file.size > maxFileSize) {
        return cb(new BadRequestException('파일의 용량은 20mb까지 업로드가 가능합니다.'), false);
    } else {
        cb(null, true);
    }
}

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY
    }
})

module.exports.module = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'woong-nodejs-uploaded-files',
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, Date.now() + file.originalname);
        }
    }),
    limits: { fileSize: 20000000 }, // byte 단위, 20Mb
    fileFilter
}).array('photos', 10);