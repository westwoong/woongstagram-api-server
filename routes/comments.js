const { Comment } = require('../models');
const express = require('express');
const commentsRoute = express.Router();
const Authorization = require('../middleware/jsontoken');
const ErrorCatch = require('../middleware/trycatch');


commentsRoute.post('/:postId', Authorization, ErrorCatch(async (req, res, next) => {
    const { postId } = req.params;
    const { comment } = req.body;
    if (!comment || comment.length > 100) {
        return res.status(400).send('댓글의 내용은 1글자 이상 100글자 이하로 작성이 가능합니다');
    }
    const payloadArray = req.user[0];

    await Comment.create({ userId: payloadArray.id, postId, content: comment });
    return res.status(201).send('작성이 완료되었습니다');
}));

commentsRoute.patch('/:postId/:commentId', Authorization, ErrorCatch(async (req, res, next) => {
    const { postId, commentId } = req.params;
    const { comment } = req.body;
    const payloadArray = req.user[0];
    const usercheck = await Comment.findOne({ where: { id: commentId, userId: payloadArray.id, postId } });

    if (!comment || comment.length > 100) {
        return res.status(400).send('댓글의 내용은 1글자 이상 100글자 이하로 작성이 가능합니다');
    }
    if (!usercheck) {
        return res.status(403).send('권한이 없습니다');
    }
    if (usercheck) {
        if (usercheck.userId && usercheck.userId !== payloadArray.id) {
            return res.status(403).send('본인의 댓글만 수정이 가능합니다');
        }
    }

    await Comment.update({ content: comment }, { where: { id: commentId, userId: payloadArray.id, postId } });
    return res.status(201).send('수정이 완료되었습니다');
}));

commentsRoute.delete('/:postId/:commentId', Authorization, ErrorCatch(async (req, res, next) => {
    const { postId, commentId } = req.params;
    const payloadArray = req.user[0];

    const usercheck = await Comment.findOne({ where: { id: commentId, userId: payloadArray.id, postId } });

    if (!usercheck) {
        return res.status(403).send('권한이 없습니다');
    }
    if (usercheck) {
        if (usercheck.userId && usercheck.userId !== payloadArray.id) {
            return res.status(403).send('본인의 댓글만 수정이 가능합니다');
        }
    }

    await Comment.destroy({ where: { id: commentId, userId: payloadArray.id, postId } });
    return res.status(201).send('댓글 삭제가 완료되었습니다');
}));


module.exports = commentsRoute;