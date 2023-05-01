const User = require('./Users');
const Post = require('./Posts');
const Photo = require('./Photos');
const Comment = require('./Comments');

User.hasMany(Post);
Post.belongsTo(User);
Post.hasMany(Comment);
User.hasMany(Comment);
Post.hasMany(Photo);
Photo.belongsTo(Post);
Comment.belongsTo(Post);
Comment.belongsTo(User);

module.exports = {
    User,
    Post,
    Photo,
    Comment
}