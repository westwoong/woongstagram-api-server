const { User, Follower, Post } = require('../models');
const express = require('express');
const usersRoute = express.Router();
const authorization = require('../middleware/jsontoken');
const asyncHandler = require('../middleware/trycatch');


usersRoute.get('/myfollower', authorization, asyncHandler(async (req, res, next) => {
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

usersRoute.get('/myfollowing', authorization, asyncHandler(async (req, res, next) => {
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

usersRoute.get('/myinfo', authorization, asyncHandler(async (req, res, next) => {
    const userId = req.user[0].id;
    const users = await User.findOne({ where: { id: userId }, attributes: ['nickname', 'name'] });
    const myPostList = await Post.findAll({ where: { userId } });
    const findMyFollowList = await Follower.findAll({ where: { followerId: userId } });
    const findMyFollowerList = await Follower.findAll({ where: { followId: userId } });


    return res.status(200).send({
        userNickname: users.nickname,
        userName: users.name,
        postCount: myPostList.length,
        myFollowCount: findMyFollowList.length,
        myFollowerCount: findMyFollowerList.length,
    });

}));

module.exports = usersRoute;