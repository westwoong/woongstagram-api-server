const { sequelize } = require('../config/database');
const { BadRequestException, NotFoundException, ForbiddenException } = require('../errors/IndexException');
const { validatePost } = require('./validators/postValidator');
const { updatePost, deletePost, getInfoByPostId, getPostsByContentCount, searchPosts, searchPostsByContent, postsCount } = require('../repository/postRepository');
const { findPhotosUrl, getPhotoByPostId } = require('../repository/photoRepository');
const { unLikeByPostId, getPostLikesCountByPostId } = require('../repository/likeRepository');
const { deleteCommentByPostId, getPostCommentCountByPostId, getCommentByPostId } = require('../repository/commentRepository');
const { getUserInfoByUserId } = require('../repository/userRepository');

module.exports.create = async (content, photos, userId) => {
    validatePost(content, photos, userId);

    const validationPhotosUrl = [];

    const postCreateTransaction = await sequelize.transaction(async (t) => {
        const post = await createPost(content, userId, t);
        const photoPromise = photos.map(async (photosUrl) => {
            const checkPhotoUrl = await findPhotosUrl(photosUrl);
            if (!checkPhotoUrl) {
                validationPhotosUrl.push(photosUrl);
            } else {
                await checkPhotoUrl.update({ postId: post.id }, { transaction: t });
            }
        });

        await Promise.all(photoPromise);

        if (validationPhotosUrl.length > 0) {
            const invalidPhotosUrl = validationPhotosUrl.join(', ');
            throw new NotFoundException(`${invalidPhotosUrl} 해당 이미지 주소는 존재하지않습니다.`);
        }
        else {
            return post;
        }
    });
    return postCreateTransaction;
}

module.exports.modify = async (postId, content, photos, userId) => {
    validatePost(content, photos);

    const postModifyTransaction = await sequelize.transaction(async (t) => {
        const post = await updatePost(content, postId, userId, t);
        const photoPromise = photos.map(async (photosUrl) => {
            const checkPhotoUrl = await findPhotosUrl(photosUrl);
            if (!checkPhotoUrl) {
                throw new NotFoundException(`${photosUrl}해당 이미지는 존재하지 않습니다.`);
            }
            await checkPhotoUrl.update({ postId: post.id }, { transaction: t });
        });

        await Promise.all(photoPromise);
        return post;
    });
    return postModifyTransaction;
}

module.exports.search = async (req) => {
    const page = req.query.page || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const posts = await searchPosts(limit, offset);

    const postId = posts.map(post => post.id);

    const postLikeCounts = await getPostLikesCountByPostId(postId);
    const postCommentCounts = await getPostCommentCountByPostId(postId);
    const postPhotos = await getPhotoByPostId(postId, limit, offset);

    const postsData = [];

    for (const post of posts) {
        const { id, userId, createdAt } = post.dataValues;

        const findUserNickname = await getUserInfoByUserId(userId);
        const findComments = await getCommentByPostId(id, limit, offset);
        const commentUserId = findComments.map(comment => comment.dataValues.userId);
        const userNicknames = await getUserInfoByUserId(commentUserId);


        const commentsAndNickname = findComments.map(comment => {
            const userNickname = userNicknames.find(user => user.id === comment.userId)?.nickname || '';
            return {
                nickname: userNickname,
                comment: comment.content,
                createdAt
            };
        });

        const checkPostLikes = postLikeCounts.find(like => like.postId === id);
        const likeCount = checkPostLikes ? checkPostLikes.dataValues.like_count : 0;
        const checkPostComments = postCommentCounts.find(comment => comment.postId === id);
        const commentCount = checkPostComments ? checkPostComments.dataValues.comment_count : 0;
        const postPhotosUrl = postPhotos.filter(photo => photo.postId === id).map(photo => photo.url);

        postsData.push({
            contents: post.content,
            createdTime: createdAt,
            usernickname: findUserNickname[0].dataValues.nickname,
            likecount: likeCount,
            commentcount: commentCount,
            commentList: commentsAndNickname,
            images: postPhotosUrl
        });
    }

    const totalPostCount = await postsCount();
    const totalPages = Math.ceil(totalPostCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
        posts: postsData,
        pagination: {
            page,
            limit,
            totalPostCount,
            totalPages,
            hasNextPage,
            hasPreviousPage
        }
    };
}

module.exports.searchContent = async (req, content) => {
    const page = req.query.page || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const posts = await searchPostsByContent(content, limit, offset);
    const postId = posts.map(post => post.id);

    const postLikesCount = await getPostLikesCountByPostId(postId);

    const postsData = [];

    for (const post of posts) {
        const findUserNickname = await getUserInfoByUserId(post.userId);
        const checkPostLikes = postLikesCount.find(like => like.postId === post.id);
        const likeCount = checkPostLikes ? checkPostLikes.dataValues.like_count : 0;
        const postPhotos = await getPhotoByPostId(post.id, limit, offset);

        for (const photo of postPhotos) {
            const { url } = photo.dataValues;
            postsData.push({
                content: post.content,
                createAt: post.createdAt,
                nickname: findUserNickname[0].dataValues.nickname,
                likeCount: likeCount,
                image: url
            })
        }
    }

    const totalPostCount = await getPostsByContentCount(content);
    const totalPages = Math.ceil(totalPostCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
        posts: postsData,
        pagination: {
            page,
            limit,
            totalPostCount,
            totalPages,
            hasNextPage,
            hasPreviousPage
        }
    };
}