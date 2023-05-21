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


module.exports = commentsRoute;