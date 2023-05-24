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
    const userId = req.user[0].id;

    await Comment.create({ userId, postId, content: comment });
    return res.status(201).send('작성이 완료되었습니다');
}));

commentsRoute.patch('/:commentId', Authorization, ErrorCatch(async (req, res, next) => {
    const { commentId } = req.params;
    const { comment } = req.body;
    const userId = req.user[0].id;
    const foundComment = await Comment.findOne({ where: { id: commentId } });

    if (foundComment?.userId !== userId || foundComment === nul) {
        return res.status(403).send('본인의 댓글만 수정이 가능합니다');
    }

    if (!foundComment) {
        return res.status(400).send('수정하려는 댓글이 존재하지 않습니다.');
    }

    if (!comment || comment.length > 100) {
        return res.status(400).send('댓글의 내용은 1글자 이상 100글자 이하로 작성이 가능합니다');
    }

    await Comment.update({ content: comment }, { where: { id: commentId, userId } });
    return res.status(204).send();

}));

commentsRoute.delete('/:commentId', Authorization, ErrorCatch(async (req, res, next) => {
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