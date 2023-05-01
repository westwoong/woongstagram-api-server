const { Post } = require('../models');
const express = require('express');
const postsRoute = express.Router();

postsRoute.post('/', async (req, res) => {
    const { title, content } = req.body;
    console.log(title, content);
    res.status(201).json({ title, content });
})


module.exports = postsRoute;