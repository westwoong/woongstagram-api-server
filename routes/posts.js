const { Post, Photo } = require('../models');
const { sequelize, transaction } = require('../config/database');
const express = require('express');
const postsRoute = express.Router();
const Authorization = require('../middleware/jsontoken');

postsRoute.post('/', Authorization, async (req, res, next) => {
    const { content, photos } = req.body;
    if (!content || content.length === 0) {
        return res.status(400).send('본문의 내용을 입력해 주시기 바랍니다.');
    }
    if (content.length > 1000) {
        return res.status(400).send('본문의 내용은 최대 1000자 까지 입력이 가능합니다.');
    }
    for (let PhotoArrayLength = 0; PhotoArrayLength < photos.length; PhotoArrayLength++) {
        if (!photos[PhotoArrayLength].startsWith("http://localhost:3000/images/")) {
            return res.status(400).send('http://localhost:3000/images/ 로 시작하는 이미지 주소를 입력해주세요');
        }
    }

    const payloadArray = req.user[0];
    console.log(payloadArray.id);
    const t = await transaction;

    try {
        const test123 = await sequelize.transaction(async (t) => {
            const createPost = await Post.create({ content, userId: payloadArray.id }, { transaction: t });
            for (let PhotoArrayLength = 0; PhotoArrayLength < photos.length; PhotoArrayLength++) {
                const checkPhotoUrl = await Photo.findAll({ attributes: ['url'], where: { url: photos[PhotoArrayLength] } });
                if (checkPhotoUrl.length === 0) {  // 이미지가 없을시? 배열의 값이 [] 로 출력되어 길이로 변경
                    return res.status(404).send(`${photos[PhotoArrayLength]}해당 이미지는 존재하지 않습니다.`);
                }
                await Photo.update({ postId: createPost.id }, { where: { url: photos[PhotoArrayLength] } }, { transaction: t });
            }
            return createPost;
        });
        return res.status(201).json({ post: test123 });
    } catch (err) {
        console.error(err);
        return res.status(500).send('알 수 없는 오류가 발생하였습니다 관리자에게 문의 바랍니다.')
    }
});


module.exports = postsRoute;