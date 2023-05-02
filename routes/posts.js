const { Post } = require('../models');
const express = require('express');
const postsRoute = express.Router();

postsRoute.post('/', async (req, res) => {
    const { content } = req.body;
    try {
        const createPost = await Post.create({ content });
        res.status(201).json(createPost);

    } catch (err) {
        console.error(err);
        res.status(500).send('알 수 없는 오류가 발생하였습니다 관리자에게 문의 바랍니다.')
    }
});


module.exports = postsRoute;