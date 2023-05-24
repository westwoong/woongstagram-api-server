const User = require('./Users');
const Post = require('./Posts');
const Photo = require('./Photos');
const Comment = require('./Comments');
const Like = require('./Likes');
const NullFalse = { foreignKey: { allowNull: false } };

User.hasMany(Post, NullFalse);;
Post.belongsTo(User, NullFalse);


User.hasMany(Comment, NullFalse);
Comment.belongsTo(User, NullFalse);

User.hasMany(Like, NullFalse);
Like.belongsTo(User, NullFalse);

Post.hasMany(Comment, NullFalse);
Comment.belongsTo(Post, NullFalse);

Post.hasMany(Like, NullFalse);
Like.belongsTo(Post, NullFalse);

Post.hasMany(Photo);
Photo.belongsTo(Post);

module.exports = {
    User,
    Post,
    Photo,
    Comment,
    Like
}