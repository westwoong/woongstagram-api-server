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

module.exports = {
    followByUserId,
    unFollowByUserId,
    isDuplicateFollow
}