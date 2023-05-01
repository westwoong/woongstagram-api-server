const postsRotuer = require('./posts');
const signRouter = require('./sign');

const routes = (app) => {
    app.use('/auth', signRouter);
    app.use('/posts', postsRotuer);
}

module.exports = routes;