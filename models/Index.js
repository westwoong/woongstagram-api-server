const User = require('./Users');
const Post = require('./Posts');
const Comment = require('./Comments');

User.hasMany(Post);
Post.belongsTo(User);
Post.hasMany(Comment);
User.hasMany(Comment);
Comment.belongsTo(Post);
Comment.belongsTo(User);

module.exports = {
    User,
    Post,
    Comment
}