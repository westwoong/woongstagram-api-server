const { Follower } = require('../models');

const followByUserId = async (followId, followerId) => {
    return Follower.create({ followId, followerId });
}

const unFollowByUserId = async (followerId, followId) => {
    return Follower.destroy({ where: { followerId, followId } })
}

const getFollowingListByUserId = async (userId) => {
    return Follower.findAll({ where: { followerId: userId } });
}

const getFollowerListByUserId = async (userId) => {
    return Follower.findAll({ where: { followId: userId } });
}

const isDuplicateFollow = async (followerId, followId) => {
    return Follower.findOne({ where: { followerId, followId } });
}

const isFollowingByUserId = async (userId) => {
    return Follower.findOne({ where: { follower_id: userId } });
}

const followersCountByUserId = async (userId) => {
    return Follower.count({ where: { followerId: userId } });
}

const followingCountByUserId = async (userId) => {
    return Follower.count({ where: { followId: userId } });
}

module.exports = {
    followByUserId,
    unFollowByUserId,
    getFollowingListByUserId,
    getFollowerListByUserId,
    isDuplicateFollow,
    isFollowingByUserId,
    followersCountByUserId,
    followingCountByUserId
}