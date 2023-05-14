const { Photo } = require('../models');
const express = require('express');
const uploadRoute = express.Router();
const multer = require('multer');
const Authorization = require('../middleware/jsontoken');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images/');
    },
    filename: function (req, file, cb) {
        // cb(null, 'posts_image-' + Date.now() + file.originalname);
        cb(null, file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    const photos = req.files;
    if (!photos) {
        return res.status(400).send('사진은 반드시 1장 이상 첨부해 주시기 바랍니다.');
    }
    if (photos.length > 10) {
        return res.status(400).send('사진은 최대 10장 까지 첨부가 가능합니다.');
    }
    if (!file.mimetype == 'image/jpg' || !file.mimetype == 'image/jpeg' || !file.mimetype == 'image/png' || !file.mimetype == 'image/gif') {
        return cb(new Error('파일의 확장자는 jpg, png, gif 만 가능합니다'), false);
    }
    const maxFileSize = 20000000; // 20MB
    if (file.size > maxFileSize) {
        return cb(new Error('파일의 용량은 20mb까지 업로드가 가능하비다.'), false);
    } else {
        cb(null, true);
    }
}

const upload = multer({
    storage,
    limits: { fileSize: 20000000 }, // byte 단위, 20Mb
    fileFilter
}).array('photos', 10);

uploadRoute.post("/", Authorization, upload, async (req, res) => {
    const photos = req.files;

    try {
        for (let PhotoArrayLength = 0; PhotoArrayLength < photos.length; PhotoArrayLength++) {
            await Photo.create({ url: `http://localhost:3000/images/${photos[PhotoArrayLength].filename}`, sequence: PhotoArrayLength });
        }
        res.status(201).json(photos);

    } catch (err) {
        console.error(err);
        res.status(500).send('알 수 없는 오류가 발생하였습니다 관리자에게 문의 바랍니다.')
    }
})


module.exports = uploadRoute;
