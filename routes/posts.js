const { User, Like, Post, Photo, Comment } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const express = require('express');
const postsRoute = express.Router();
const Authorization = require('../middleware/jsontoken');
const ErrorCatch = require('../middleware/trycatch');
const HttpException = require('../middleware/HttpException');

postsRoute.post('/', Authorization, ErrorCatch(async (req, res, next) => {
    const { content, photos } = req.body;
    const userId = req.user[0].id;

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


    const validationPhotosUrl = [];

    const postTransaction = await sequelize.transaction(async (t) => {
        const createPost = await Post.create({ content, userId }, { transaction: t });

        const photoPromise = photos.map(async (photosUrl) => {
            const checkPhotoUrl = await Photo.findOne({ where: { url: photosUrl } }); // map array에 담겨있는 URL를 찾는 변수
            if (!checkPhotoUrl) {
                // DB에 존재하지 않는 URL 확인 시 검증 배열로 넣기
                validationPhotosUrl.push(photosUrl);
            } else {
                /*
                찾은 URL의 같은필드에있는 post_id를 게시물의 PK(createPost.id)로 update시켜준다
                이때 { transaction: t } 으로 묶은 게시물작성과, 사진 FK 업데이트중 하나라도 실패한다면 쿼리 롤백
                */
                await checkPhotoUrl.update({ postId: createPost.id }, { transaction: t });
            }
        });
        // photoPromise 함수의 모든 작업이 완료될때까지 대기한다.
        // 모든 작업을 동시에 실행하여 하나라도 거부될경우 오류를 반환
        await Promise.all(photoPromise);

        if (validationPhotosUrl.length > 0) {
            const failsPhotosUrl = validationPhotosUrl.join(', ');
            throw new HttpException(`${failsPhotosUrl} 해당 이미지 주소는 존재하지않습니다`, 404)
        }
        else {
            return res.status(201).send({ postTransaction });
        }
    });
}));

postsRoute.patch('/:postId', Authorization, ErrorCatch(async (req, res, next) => {
    const { postId } = req.params;
    const { content, photos } = req.body;
    const userId = req.user[0].id;

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

    await sequelize.transaction(async (t) => {
        const updatePost = await Post.update({ content }, { where: { id: postId, userId }, transaction: t });
        const photoPromise = photos.map(async (photosUrl) => {
            const checkPhotoUrl = await Photo.findOne({ where: { url: photosUrl } });
            if (!checkPhotoUrl) {
                return res.status(404).send(`${photosUrl}해당 이미지는 존재하지 않습니다.`);
            }
            await checkPhotoUrl.update({ postId: updatePost.id }, { transaction: t });

        });
        await Promise.all(photoPromise);
        return updatePost;
    });
    return res.status(204).send();
}));

postsRoute.delete('/:postId', Authorization, ErrorCatch(async (req, res, next) => {
    const { postId } = req.params;
    const userId = req.user[0].id;

    const posts = await Post.findOne({ where: { id: postId } });

    if (!posts) {
        return res.status(400).send('게시물이 존재하지 않습니다.');
    }
    if (posts?.userId !== userId || posts === null) {
        return res.status(403).send('본인의 게시글만 삭제가 가능합니다');
    }

    await sequelize.transaction(async (t) => {
        await Like.destroy({ where: { postId }, transaction: t })
        await Comment.destroy({ where: { postId }, transaction: t });
        await Post.destroy({ where: { id: postId }, transaction: t });
    });

    return res.status(204).send();
}));

postsRoute.get('/', Authorization, ErrorCatch(async (req, res, next) => {
    const limit = 5;
    const posts = await Post.findAll({
        attributes: ['id', 'user_id', 'created_at', 'content'], order: [['created_at', 'DESC']], limit
    });
    const postId = posts.map(post => post.id);
    const PostLikesCount = await Like.findAll({
        attributes: ['postId', [sequelize.fn('COUNT', sequelize.col('id')), 'like_count']],
        where: { postId },
        group: ['postId']
    });
    const PostCommentsCount = await Comment.findAll({
        attributes: ['postId', [sequelize.fn('COUNT', sequelize.col('id')), 'comment_count']],
        where: { postId },
        group: ['postId']
    });
    const postPhotos = await Photo.findAll({ where: { postId }, attributes: ['postId', 'url'], order: [['created_at', 'DESC']], limit });
    // console.log(postPhotos);
    const PostImagesUrl = []; // 게시글 이미지 URL
    const ContentsList = [];  // 내용
    const CreatedTimeList = []; // 생성 시간
    const NickNameList = []; // 작성자 닉네임
    const PostLikeList = []; // 게시물 좋아요 수
    const CommentCountList = []; // 댓글 수
    const CommentsList = []; // 댓글 내용

    for (const post of posts) {
        const { id, user_id, created_at } = post.dataValues;
        const findUserNickname = await User.findOne({
            where: { id: user_id },
            attributes: ['nickname']
        });
        const findComments = await Comment.findAll({
            where: { postId: id },
            attributes: ['content', 'userId'],
            order: [['created_at', 'DESC']],
            limit: 1
        });
        const commentUserId = findComments.map(comment => comment.dataValues.userId);
        // console.log(commentUserId);
        const userNicknames = await User.findAll({ where: { id: commentUserId }, attributes: ['id', 'nickname'] });


        const commentsAndNickname = findComments.map(comment => {
            // userNcinames에서 댓글남긴 userId와 users테이블에 있는 id와 같으면 nickname을 할당 없으면 '' 빈값 할당
            const userNickname = userNicknames.find(user => user.id === comment.userId)?.nickname || '';
            return {
                nickname: userNickname,
                comment: comment.content
            };
        });
        CommentsList.push(commentsAndNickname);

        // find메서드를 사용하여 PostLikesCount에 있는 postId의 값을 찾은 후 post.dataValues.id과 동일하면 변수에 ㅏㄹ당
        const checkPostLikes = PostLikesCount.find(like => like.postId === id);
        // ?를 사용해서 checkPostLikes의 값이 null이나 undefined가 아니면 이후 코드 실행
        const likeCount = checkPostLikes ? checkPostLikes.dataValues.like_count : 0;
        const checkPostComments = PostCommentsCount.find(comment => comment.postId === id);
        const CommentCount = checkPostComments ? checkPostComments.dataValues.comment_count : 0;

        ContentsList.push(post.content);
        CreatedTimeList.push(created_at);
        NickNameList.push(findUserNickname.nickname);
        PostLikeList.push(likeCount);
        CommentCountList.push(CommentCount);
    }

    for (const photo of postPhotos) {
        const { url } = photo.dataValues;
        PostImagesUrl.push(url);
    }

    PostImagesUrl.reverse();

    return res.status(200).send({
        contents: ContentsList,  // 게시글 본문
        created_time: CreatedTimeList, // 게시글 생성 시간
        usernickname: NickNameList, // 사용자 닉네임
        likecount: PostLikeList, // 좋아요 수
        commentcount: CommentCountList, // 댓글 수
        commentList: CommentsList, // 댓글 목록
        images: PostImagesUrl // 게시글에 있는 image URL
    });
}));

postsRoute.get('/:content', Authorization, ErrorCatch(async (req, res, next) => {
    const { content } = req.params;
    const limit = 5;
    const posts = await Post.findAll({
        where: { content: { [Op.substring]: content } },
        order: [['created_at', 'DESC']],
        limit
    });
    const postId = posts.map(post => post.id);

    const PostLikesCount = await Like.findAll({
        attributes: ['postId', [sequelize.fn('COUNT', sequelize.col('id')), 'like_count']],
        where: { postId },
        group: ['postId']
    });

    const PostImagesUrl = []; // 게시글 이미지 URL
    const ContentsList = [];  // 내용
    const CreatedTimeList = []; // 생성 시간
    const NickNameList = []; // 작성자 닉네임
    const PostLikeList = []; // 게시물 좋아요 수

    for (const post of posts) {
        const findUserNickname = await User.findOne({
            where: { id: post.userId },
            attributes: ['nickname']
        });

        const checkPostLikes = PostLikesCount.find(like => like.postId === post.id);
        const likeCount = checkPostLikes ? checkPostLikes.dataValues.like_count : 0;

        ContentsList.push(post.content);
        CreatedTimeList.push(post.createdAt);
        NickNameList.push(findUserNickname.nickname);
        PostLikeList.push(likeCount);
    }

    const postPhotos = await Photo.findAll({ where: { postId }, attributes: ['postId', 'url'], order: [['created_at', 'DESC']], limit });
    for (const photo of postPhotos) {
        const { url } = photo.dataValues;
        PostImagesUrl.push(url);
    }
    PostImagesUrl.reverse();

    return res.status(200).send({
        contents: ContentsList,  // 게시글 본문
        created_time: CreatedTimeList, // 게시글 생성 시간
        usernickname: NickNameList, // 사용자 닉네임
        likecount: PostLikeList, // 좋아요 수
        images: PostImagesUrl // 게시글에 있는 image URL
    });
}));

module.exports = postsRoute;