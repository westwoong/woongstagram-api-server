const User = require('./Users');
const Post = require('./Posts');
const Photo = require('./Photos');
const Comment = require('./Comments');
const NullFalse = { foreignKey: { allowNull: false } };

User.hasMany(Post, NullFalse);;
Post.belongsTo(User, NullFalse);
Post.hasMany(Comment, NullFalse);
User.hasMany(Comment, NullFalse);
Post.hasMany(Photo, NullFalse);
Photo.belongsTo(Post, NullFalse);
Comment.belongsTo(Post, NullFalse);
Comment.belongsTo(User, NullFalse);

module.exports = {
    User,
    Post,
    Photo,
    Comment
}