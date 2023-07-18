const { followByUserId, unFollowByUserId } = require('../repository/followRepository');
const { validateFollow } = require('./validators/followValidator');


module.exports.follow = async (followId, followerId) => {
    await validateFollow(followId, followerId);
    return followByUserId(followId, followerId);
}

module.exports.unfollow = async (followId, followerId) => {
    await validateFollow(followId, followerId);
    return unFollowByUserId(followerId, followId)
}