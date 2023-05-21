const postsRotuer = require('./posts');
const signRouter = require('./sign');
const uploadRouter = require('./upload');
const likesRouter = require('./likes');

const routes = (app) => {
    app.use('/auth', signRouter);
    app.use('/posts', postsRotuer);
    app.use('/images', uploadRouter);
    app.use('/likes', likesRouter);
}

module.exports = routes;