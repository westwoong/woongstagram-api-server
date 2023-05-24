const postsRotuer = require('./posts');
const signRouter = require('./sign');
const uploadRouter = require('./upload');
const likesRouter = require('./likes');
const commentsRouter = require('./comments');
const followsRoute = require('./follow');

const routes = (app) => {
    app.use('/auth', signRouter);
    app.use('/posts', postsRotuer);
    app.use('/images', uploadRouter);
    app.use('/likes', likesRouter);
    app.use('/comments', commentsRouter);
    app.use('/follows', followsRoute);
}

module.exports = routes;