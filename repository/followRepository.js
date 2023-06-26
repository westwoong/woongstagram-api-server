const { Follower } = require('../models');

const followByUserId = async (followId, followerId) => {
    return Follower.create({ followId, followerId });
}

const unFollowByUserId = async (followerId, followId) => {
    return Follower.destroy({ where: { followerId, followId } })
}

const isDuplicateFollow = async (followerId, followId) => {
    return Follower.findOne({ where: { followerId, followId } });
}

const isFollowingByUserId = async (userId) => {
    return Follower.findOne({ where: { follower_id: userId } });
}

module.exports = {
    followByUserId,
    unFollowByUserId,
    isDuplicateFollow,
    isFollowingByUserId
}