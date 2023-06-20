const { User, Comment } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const { BadRequestException, ForbiddenException, NotFoundException } = require('../errors/IndexException');

module.exports.create = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { comment } = req.body;
    if (!comment || comment.length > 100) {
        throw new BadRequestException('댓글의 내용은 1글자 이상 100글자 이하로 작성이 가능합니다');
    }
    const userId = req.user[0].id;

    await Comment.create({ userId, postId, content: comment });
    return res.status(201).send('작성이 완료되었습니다');
});

module.exports.delete = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user[0].id;

    const foundComment = await Comment.findOne({ where: { id: commentId, userId } });

    if (foundComment?.userId !== userId || foundComment === null) {
        throw new ForbiddenException('본인의 댓글만 삭제가 가능합니다');
    }

    if (!foundComment) {
        throw new BadRequestException('삭제하려는 댓글이 존재하지 않습니다.');
    }

    await Comment.destroy({ where: { id: commentId, userId } });
    return res.status(201).send('댓글 삭제가 완료되었습니다');
});

module.exports.modify = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { comment } = req.body;
    const userId = req.user[0].id;
    const foundComment = await Comment.findOne({ where: { id: commentId } });

    if (foundComment?.userId !== userId || foundComment === null) {
        throw new ForbiddenException('본인의 댓글만 수정이 가능합니다');
    }

    if (!foundComment) {
        throw new NotFoundException('수정하려는 댓글이 존재하지 않습니다.');
    }

    if (!comment || comment.length > 100) {
        throw new BadRequestException('댓글의 내용은 1글자 이상 100글자 이하로 작성이 가능합니다');
    }

    await Comment.update({ content: comment }, { where: { id: commentId, userId } });
    return res.status(204).send();
});

module.exports.search = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const page = req.query.page || 1;
    const limit = 2;
    const offset = (page - 1) * limit;

    const comments = await Comment.findAll({
        where: { postId },
        attributes: ['userId', 'createdAt', 'content'],
        limit,
        offset
    });

    const commentsData = [];

    if (!comments || comments.length === 0) {
        throw new NotFoundException('게시글이 존재하지 않습니다.');
    }

    for (const comment of comments) {
        const { userId, createdAt, content } = comment.dataValues;
        const findUserNickname = await User.findOne({ where: { id: userId }, attributes: ['nickname'] });

        commentsData.push({
            nickname: findUserNickname.dataValues.nickname,
            content: content,
            createdAt: createdAt
        });
    }

    const totalCommentsCount = await Comment.count({ where: { postId } });
    const totalPages = Math.ceil(totalCommentsCount / limit);
    const isExistNextPage = page < totalPages;
    const isExistPreviousPage = page > 1;

    return res.status(200).send({
        commentsData: commentsData,
        pagination: {
            page,
            limit,
            totalCommentsCount,
            totalPages,
            isExistNextPage,
            isExistPreviousPage
        }
    });
});