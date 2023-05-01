const signRouter = require('./sign');

const routes = (app) => {
    app.use('/auth', signRouter);
}

module.exports = routes;