const User = require('./Users');
const Post = require('./Posts');
const Photo = require('./Photos');
const Comment = require('./Comments');
const Like = require('./Likes');
const Follower = require('./Follower');
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

User.hasMany(Follower, {
    foreignKey: {
        allowNull: false,
        name: 'followerId',
        comment: '구독자'
    }
});
User.hasMany(Follower, {
    foreignKey: {
        allowNull: false,
        name: 'followId',
        comment: '사용자'
    }
});

module.exports = {
    User,
    Post,
    Photo,
    Comment,
    Like,
    Follower
}