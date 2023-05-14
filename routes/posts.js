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
        // sequelize 트랜잭션 매서드
        const postTransaction = await sequelize.transaction(async (t) => {
            const createPost = await Post.create({ content, userId: payloadArray.id }, { transaction: t });

            const photoPromise = photos.map(async (photosUrl) => {
                const checkPhotoUrl = await Photo.findOne({ where: { url: photosUrl } }); // map array에 담겨있는 URL를 찾는 변수
                console.log('----------------------')
                console.log(checkPhotoUrl);
                console.log('----------------------')
                if (!checkPhotoUrl) {
                    // map array에 없는게 있을경우 캐치하여 해당 배열 URL반환
                    return res.status(404).send(`${photosUrl}해당 이미지는 존재하지 않습니다.`);
                }
                /*
                찾은 URL의 같은필드에있는 post_id를 게시물의 PK(createPost.id)로 update시켜준다
                이때 { transaction: t } 으로 묶은 게시물작성과, 사진 FK 업데이트중 하나라도 실패한다면 쿼리 롤백
                */
                await checkPhotoUrl.update({ postId: createPost.id }, { transaction: t });

            });
            // photoPromise 함수의 모든 작업이 완료될때까지 대기한다.
            // 모든 작업을 동시에 실행하여 하나라도 거부될경우 오류를 반환
            await Promise.all(photoPromise);
            return createPost;
        });
        return res.status(201).send({ postTransaction });
    } catch (err) {
        console.error(err);
        return res.status(500).send('알 수 없는 오류가 발생하였습니다 관리자에게 문의 바랍니다.')
    }
});


module.exports = postsRoute;