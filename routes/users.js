const { User, Follower } = require('../models');
const express = require('express');
const usersRoute = express.Router();
const Authorization = require('../middleware/jsontoken');
const ErrorCatch = require('../middleware/trycatch');


usersRoute.get('/myfollower', Authorization, ErrorCatch(async (req, res, next) => {
    const followId = req.user[0].id;
    const findFollower = await Follower.findAll({ where: { followId } }); //사용자 기준 팔로워목록 출력(배열)
    const followerList = [];

    for (const follower of findFollower) {
        const followerUser = await User.findOne({
            where: { id: follower.followerId },  // findfollower 배열안에있는 followerId를 찾는다.
            attributes: ['nickname', 'name']
        });
        const { nickname, name } = followerUser;
        followerList.push({ nickname, name }) // 이름, 별명값 결과를 배열에 넣기
    }

    return res.status(200).send({ followers: followerList });
}));

usersRoute.get('/myfollowing', Authorization, ErrorCatch(async (req, res, next) => {
    const userId = req.user[0].id;
    const findMyFollow = await Follower.findAll({ where: { followerId: userId } });
    const followingList = [];

    for (const following of findMyFollow) {
        const followingUser = await User.findOne({
            where: { id: following.followId },
            attributes: ['nickname', 'name']
        });
        const { nickname, name } = followingUser;
        followingList.push({ nickname, name });
    }
    return res.status(200).send({ followings: followingList });
}));

module.exports = usersRoute;