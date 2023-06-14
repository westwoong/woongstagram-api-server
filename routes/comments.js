const { User, Comment } = require('../models');
const express = require('express');
const commentsRoute = express.Router();
const authorization = require('../middleware/jsontoken');
const asyncHandler = require('../middleware/asyncHandler');


commentsRoute.post('/:postId', authorization, asyncHandler(async (req, res, next) => {
    const { postId } = req.params;
    const { comment } = req.body;
    if (!comment || comment.length > 100) {
        return res.status(400).send('댓글의 내용은 1글자 이상 100글자 이하로 작성이 가능합니다');
    }
    const userId = req.user[0].id;

    await Comment.create({ userId, postId, content: comment });
    return res.status(201).send('작성이 완료되었습니다');
}));

commentsRoute.get('/:postId', authorization, asyncHandler(async (req, res, next) => {
    const { postId } = req.params;
    const page = req.query.page || 1;
    const limit = 2;
    const offset = (page - 1) * limit;

    const comments = await Comment.findAll({
        where: { postId },
        attributes: ['userId', 'createdAt', 'content'],
        limit,
        offset
    });

    const commentsData = [];

    if (!comments) {
        return res.status(404).send('게시글이 존재하지 않습니다.');
    }
    for (const comment of comments) {
        const { userId, createdAt, content } = comment.dataValues;
        const findUserNickname = await User.findOne({ where: { id: userId }, attributes: ['nickname'] });

        commentsData.push({
            nickname: findUserNickname.dataValues.nickname,
            content: content,
            createdAt: createdAt
        });

    }

    const totalCommentsCount = await Comment.count({ where: { postId } }); // 게시글에 있는 전체 댓글 수 조회
    const totalPages = Math.ceil(totalCommentsCount / limit); // 전체 페이지 수 계산
    const nextPage = page < totalPages; // 다음 페이지 여부 있으면 true
    const prevPage = page > 1; // 이전 페이지 여부 있으면 true

    return res.status(200).send({
        commentsData: commentsData,
        pagination: {
            page,
            limit,
            totalCommentsCount,
            totalPages,
            nextPage,
            prevPage
        }
    });

}));

commentsRoute.patch('/:commentId', authorization, asyncHandler(async (req, res, next) => {
    const { commentId } = req.params;
    const { comment } = req.body;
    const userId = req.user[0].id;
    const foundComment = await Comment.findOne({ where: { id: commentId } });

    if (foundComment?.userId !== userId || foundComment === null) {
        return res.status(403).send('본인의 댓글만 수정이 가능합니다');
    }

    if (!foundComment) {
        return res.status(404).send('수정하려는 댓글이 존재하지 않습니다.');
    }

    if (!comment || comment.length > 100) {
        return res.status(400).send('댓글의 내용은 1글자 이상 100글자 이하로 작성이 가능합니다');
    }

    await Comment.update({ content: comment }, { where: { id: commentId, userId } });
    return res.status(204).send();

}));

commentsRoute.delete('/:commentId', authorization, asyncHandler(async (req, res, next) => {
    const { commentId } = req.params;
    const userId = req.user[0].id;

    const foundComment = await Comment.findOne({ where: { id: commentId, userId } });

    if (foundComment?.userId !== userId || foundComment === null) {
        return res.status(403).send('본인의 댓글만 삭제가 가능합니다');
    }

    if (!foundComment) {
        return res.status(400).send('삭제하려는 댓글이 존재하지 않습니다.');
    }

    await Comment.destroy({ where: { id: commentId, userId } });
    return res.status(201).send('댓글 삭제가 완료되었습니다');
}));


module.exports = commentsRoute;