const postsRotuer = require('./posts');
const signRouter = require('./sign');
const uploadRouter = require('./upload');

const routes = (app) => {
    app.use('/auth', signRouter);
    app.use('/posts', postsRotuer);
    app.use('/images', uploadRouter);
}

module.exports = routes;